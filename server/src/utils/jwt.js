const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/env");

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );

module.exports = { generateToken };
