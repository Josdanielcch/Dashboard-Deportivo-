// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/database");
const mailer = require("../config/mailer");

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

    const customerQuery = "SELECT id, phone, email FROM customers WHERE email = $1";
    const customerResult = await pool.query(customerQuery, [user.username]);
    const customer = customerResult.rows[0];

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
        customer_id: customer ? customer.id : null,
        phone: customer ? customer.phone : null,
        email: customer ? customer.email : null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, username } = req.body;
    const userName = username?.trim() || email?.trim();

    if (!full_name || !email || !phone || !password || !userName) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Verificar si el nombre de usuario ya existe
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [userName]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    // Si existe el cliente por correo o teléfono, no se duplicará.
    const existingCustomer = await pool.query(
      "SELECT id FROM customers WHERE email = $1 OR phone = $2",
      [email, phone]
    );

    const customerId = existingCustomer.rows[0]?.id;

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const roleId = 10; // Normalmente un usuario final
    // Asegurar que el rol 10 exista antes de registrar el usuario
    await pool.query(
      "INSERT INTO roles (id, role_name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
      [roleId, 'Client', 'Cliente Final del Sitio Web']
    );

    const userResult = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role_id, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, full_name, role_id, status`,
      [userName, password_hash, full_name, roleId, email]
    );

    let newCustomerId = customerId;
    if (!newCustomerId) {
      const customerResult = await pool.query(
        `INSERT INTO customers (full_name, email, phone)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [full_name, email, phone]
      );
      newCustomerId = customerResult.rows[0].id;
    }

    const token = jwt.sign(
      { id: userResult.rows[0].id, username: userResult.rows[0].username, role_id: roleId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Registro exitoso",
      token,
      user: userResult.rows[0],
      customer_id: newCustomerId,
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Usuario o cliente ya existe' });
    }
    res.status(500).json({ error: "Error en el servidor al registrar usuario" });
  }
};

const getMe = async (req, res) => {
  try {
    const customerQuery = "SELECT id, phone, email FROM customers WHERE email = $1";
    const customerResult = await pool.query(customerQuery, [req.user.username]);
    const customer = customerResult.rows[0];
    res.json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        role_id: req.user.role_id,
        customer_id: customer ? customer.id : null,
        phone: customer ? customer.phone : null,
        email: customer ? customer.email : null,
      }
    });
  } catch (error) {
    res.json({ success: true, user: req.user });
  }
};

const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: "El correo electrónico es requerido" });
    }

    // Buscamos al usuario por su correo electrónico en la tabla users
    const query = "SELECT id, username, full_name FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);

    // Por seguridad, si el usuario no existe no lo informamos directamente
    // para evitar enumeración de correos, pero devolvemos una respuesta genérica de éxito.
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        message:
          "Si el correo existe en nuestra base de datos, recibirás un enlace para recuperar tu contraseña.",
      });
    }

    const user = result.rows[0];

    // Generamos un token temporal seguro de 32 bytes
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hora de validez

    // Guardamos el token y su expiración en el usuario de la BD
    const updateQuery = `
      UPDATE users 
      SET reset_token = $1, reset_token_expires = $2 
      WHERE id = $3
    `;
    await pool.query(updateQuery, [token, expires, user.id]);

    // Construimos el enlace para restablecer la contraseña
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

    // Enviamos el correo usando Nodemailer
    //await mailer.sendMail({
    // from: `"SportSpaces OS" <no-reply@sportspaces.com>`,
    //to: email,
    //subject: "Recuperación de contraseña - SportSpaces OS",
    //html: `
    //<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
    //<h2 style="color: #10b981; text-align: center; margin-top: 0;">🏟️ SportSpaces OS</h2>
    //<hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;">
    //<p>Hola, <strong>${user.full_name || user.username}</strong>,</p>
    //<p> Hemos recibido una solicitud para restablecer tu contraseña en la plataforma de gestión de complejos deportivos <strong>SportSpaces OS</strong>.</p>
    //<p>Para proceder con el restablecimiento de tu contraseña, por favor haz clic en el siguiente botón:</p>
    //<div style="text-align: center; margin: 30px 0;">
    //<a href="${resetLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
    //</div>
    //<p style="font-size: 13px; color: #ef4444; font-weight: 500; text-align: center;">Este enlace tiene una validez de 1 hora.</p>
    //<hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;">
    //<p style="font-size: 12px; color: #71717a;">Si el botón no funciona, copia y pega el siguiente enlace directamente en tu navegador:</p>
    //<p style="font-size: 12px; color: #10b981; word-break: break-all; font-family: monospace;">${resetLink}</p>
    //<hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;">
    //<p style="font-size: 12px; color: #a1a1aa; text-align: center;">Si no solicitaste este restablecimiento, puedes ignorar este correo de forma totalmente segura.</p>
    //</div>
    //`,
    //});

    return res.json({
      success: true,
      message:
        "Si el correo existe en nuestra base de datos, recibirás un enlace para recuperar tu contraseña.",
    });
  } catch (error) {
    console.error("Error en recoverPassword:", error);
    res.status(500).json({
      error: "Error en el servidor al intentar recuperar contraseña",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ error: "El token y la nueva contraseña son requeridos" });
    }

    // Buscamos al usuario que tenga el token de restablecimiento y que no haya expirado
    const query =
      "SELECT id, username FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()";
    const result = await pool.query(query, [token]);

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "El token de recuperación es inválido o ha expirado" });
    }

    const user = result.rows[0];

    // Encriptamos la nueva contraseña de forma segura
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Actualizamos la base de datos con la nueva contraseña encriptada
    // y limpiamos el token de recuperación
    const updateQuery = `
      UPDATE users 
      SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL 
      WHERE id = $2
    `;
    await pool.query(updateQuery, [hashedPassword, user.id]);

    return res.json({
      success: true,
      message: "Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({
      error: "Error en el servidor al intentar restablecer la contraseña",
    });
  }
};

module.exports = { login, register, getMe, recoverPassword, resetPassword };
