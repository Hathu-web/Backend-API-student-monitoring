const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/protected", auth, (req, res) => {
  res.json({
    msg: "Access granted",
    user: req.user,
  });
});

module.exports = router;
