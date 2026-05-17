// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../config/database");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Usuario y contraseña requeridos" });
    }

    const query =
      "SELECT id, username, password_hash, full_name, role_id, status FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    if (user.status !== "Activated" && user.status !== "activated") {
      return res.status(403).json({ error: "Usuario inactivo" });
    }

    const isHashed =
      typeof user.password_hash === "string" &&
      user.password_hash.startsWith("$2");
    const passwordMatch = isHashed
      ? await bcrypt.compare(password, user.password_hash)
      : password === user.password_hash;

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    return res.json({
      success: true,
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role_id: user.role_id,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: "El correo electrónico es requerido" });
    }

    // Aquí iría la lógica real para buscar el usuario por email
    // y enviar un correo con nodemailer, postmark, sendgrid, etc.

    //simulamos que todo salió bien
    res.json({
      success: true,
      message:
        "Si el correo existe en nuestra base de datos, recibirás un enlace para recuperar tu contraseña.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error en el servidor al intentar recuperar contraseña" });
  }
};

module.exports = { login, getMe, recoverPassword };
