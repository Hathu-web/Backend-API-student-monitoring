const express = require("express");
const nodemailer = require("nodemailer");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const auth = require("../middleware/auth");

const router = express.Router();

// 1. Cấu hình Nodemailer để gửi Email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/attendance/checkin
router.post("/checkin", auth, async (req, res) => {
  try {
    // 1. Lấy studentId từ body thay vì dùng userId từ Token
    const { studentId, date, present } = req.body;

    if (!studentId) {
      return res.status(400).json({ msg: "Vui lòng cung cấp mã sinh viên (studentId)" });
    }

    // 2. Tìm sinh viên dựa trên trường studentId trong Database
    const student = await Student.findOne({ studentId: studentId });
    
    if (!student) {
      return res.status(404).json({ msg: "Không tìm thấy sinh viên với mã này" });
    }

    // 3. Chuẩn hóa ngày (YYYY-MM-DD)
    const checkDate = date || new Date().toISOString().slice(0, 10);

    // 4. Chặn check-in trùng ngày (Dùng _id thật của MongoDB để đối chiếu)
    const existed = await Attendance.findOne({
      student: student._id,
      date: checkDate,
    });

    if (existed) {
      return res.status(400).json({ msg: "Sinh viên này đã điểm danh hôm nay" });
    }

    // 5. Lưu bản ghi điểm danh
    const record = await Attendance.create({
      student: student._id,
      date: checkDate,
      present,
    });

    // 6. Logic kiểm tra vắng 2 ngày liên tiếp và gửi Email
    if (present === false) {
      const lastTwo = await Attendance.find({ student: student._id })
        .sort({ date: -1 })
        .limit(2);

      const absent2Days =
        lastTwo.length === 2 && lastTwo.every(r => r.present === false);

      if (absent2Days && student.parentEmail) {
        await transporter.sendMail({
          from: `"Student Monitoring" <${process.env.EMAIL_USER}>`,
          to: student.parentEmail,
          subject: "CẢNH BÁO: Sinh viên vắng 2 ngày liên tiếp",
          html: `<p>Sinh viên <b>${student.name}</b> đã vắng mặt 2 ngày liên tiếp.</p>`,
        });

        // Cập nhật trạng thái đã gửi cảnh báo trong Database
        await Attendance.updateMany(
          { _id: { $in: lastTwo.map(r => r._id) } },
          { alertParent: true }
        );
      }
    }

    res.json({ msg: "Điểm danh thành công", record });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ADMIN + PARENT: xem danh sách cảnh báo
router.get("/alerts", auth, async (req, res) => {
  try {
    let filter = { alertParent: true };

    //  ADMIN: xem tất cả
    if (req.user.role === "admin") {
      // giữ nguyên filter
    }

    //  PHỤ HUYNH: chỉ xem con mình
    if (req.user.role === "parent") {
      const students = await Student.find({
        parentEmail: req.user.email,
      });

      const studentIds = students.map((s) => s._id);
      filter.student = { $in: studentIds };
    }

    const alerts = await Attendance.find(filter)
      .populate("student", "name studentId parentEmail")
      .sort({ date: -1 });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
// VIEW ATTENDANCE HISTORY
router.get("/history/:studentId", auth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // kiểm tra sinh viên tồn tại
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // phân quyền
    if (req.user.role === "parent") {
      if (student.parentEmail !== req.user.email) {
        return res.status(403).json({ msg: "Access denied" });
      }
    }

    if (req.user.role === "student") {
      if (req.user.id !== student.userId?.toString()) {
        return res.status(403).json({ msg: "Access denied" });
      }
    }

    const history = await Attendance.find({ student: studentId })
      .sort({ date: -1 });

    res.json({
      student: {
        name: student.name,
        studentId: student.studentId,
      },
      totalDays: history.length,
      history,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
const { Parser } = require("json2csv");

router.get("/export/csv", auth, async (req, res) => {
  try {
    // 1. Phân quyền
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    // 2. Lấy toàn bộ dữ liệu điểm danh
    const records = await Attendance.find()
      .populate("student", "name studentId parentEmail")
      .sort({ date: -1 });

    // 3. Chuẩn hoá dữ liệu cho CSV
    const data = records.map((r) => ({
      studentName: r.student?.name || "",
      studentId: r.student?.studentId || "",
      date: r.date,
      status: r.present ? "Có mặt" : "Vắng",
      alertSent: r.alertParent ? "Đã cảnh báo" : "Chưa",
      parentEmail: r.student?.parentEmail || "",
    }));

    // 4. Tạo CSV
    const parser = new Parser({
      fields: [
        "studentName",
        "studentId",
        "date",
        "status",
        "alertSent",
        "parentEmail",
      ],
    });

    const csv = parser.parse(data);

    // 5. Trả file
    res.header("Content-Type", "text/csv");
    res.attachment("attendance_report.csv");
    return res.send("\ufeff" + csv);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


module.exports = router;