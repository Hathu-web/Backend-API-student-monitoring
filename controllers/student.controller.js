const Student = require("../models/Student");

//  Create student
exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

//  Get all students
exports.getAllStudents = async (req, res) => {
  const students = await Student.find();
  res.json(students);
};

//  Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ msg: "Student not found" });
    res.json(student);
  } catch {
    res.status(400).json({ msg: "Invalid ID" });
  }
};

//  Update student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(student);
  } catch {
    res.status(400).json({ msg: "Update failed" });
  }
};

//  Delete student
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ msg: "Student deleted" });
  } catch {
    res.status(400).json({ msg: "Delete failed" });
  }
};
