const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Lấy token từ header
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  // Format: Bearer TOKEN
  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, "secret123");
    req.user = decoded; // lưu thông tin user
    next(); // cho đi tiếp
  } catch (err) {
    return res.status(401).json({ msg: "Token invalid" });
  }
};

module.exports = auth;
