const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/student.controller");

// Tất cả route đều cần login
router.use(auth);

router.post("/", controller.createStudent);
router.get("/", controller.getAllStudents);
router.get("/:id", controller.getStudentById);
router.put("/:id", controller.updateStudent);
router.delete("/:id", controller.deleteStudent);

module.exports = router;
