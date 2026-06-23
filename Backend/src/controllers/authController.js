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
      "SELECT id, username, email, password_hash, first_name, last_name, role_id, status, avatar_url, first_name || ' ' || last_name AS full_name FROM users WHERE username = $1 OR email = $1";
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    if (user.status === "Pending" || user.status === "pending") {
      return res.status(403).json({ error: "Tu cuenta está pendiente de aprobación por un administrador." });
    }

    if (user.status !== "Activated" && user.status !== "activated") {
      return res.status(403).json({ error: "Usuario inactivo" });
    }

    if (user.role_id === 10 || user.role_id === 7) {
      return res.status(403).json({ error: "Acceso denegado. Este usuario solo puede ingresar por la página web." });
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
    const customerResult = await pool.query(customerQuery, [user.email || user.username]);
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
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, username } = req.body;
    const userName = username?.trim() || email?.trim();

    if (!first_name || !last_name || !email || !phone || !password || !userName) {
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
    const roleId = 2; // Por defecto Recepcionista para el panel

    const userResult = await pool.query(
      `INSERT INTO users (username, password_hash, first_name, last_name, role_id, email, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
       RETURNING id, username, first_name, last_name, role_id, status, first_name || ' ' || last_name AS full_name`,
      [userName, password_hash, first_name, last_name, roleId, email]
    );

    let newCustomerId = customerId;
    if (!newCustomerId) {
      const customerResult = await pool.query(
        `INSERT INTO customers (first_name, last_name, email, phone)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [first_name, last_name, email, phone]
      );
      newCustomerId = customerResult.rows[0].id;
    }

    // Notificar a los administradores
    try {
      const adminsResult = await pool.query("SELECT email FROM users WHERE role_id = 1 AND status = 'Activated'");
      const adminEmails = adminsResult.rows.map(admin => admin.email).filter(e => e);

      if (adminEmails.length > 0) {
        await mailer.sendMail({
          from: process.env.SMTP_FROM || '"CourtManager" <no-reply@courtmanager.com>',
          to: adminEmails.join(','),
          subject: "Nueva Cuenta de Usuario Pendiente de Aprobación",
          html: `
            <h2>Nueva solicitud de acceso al Panel Administrativo</h2>
            <p>Se ha registrado un nuevo usuario desde la pantalla de login del panel:</p>
            <ul>
              <li><strong>Nombre:</strong> ${first_name} ${last_name}</li>
              <li><strong>Usuario:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Teléfono:</strong> ${phone}</li>
            </ul>
            <p>Por favor, ingrese al sistema en el módulo de <strong>Usuarios</strong> para activar o rechazar esta cuenta.</p>
          `,
        });
      }
    } catch (mailError) {
      console.error("Error al notificar a los administradores:", mailError);
    }

    return res.status(201).json({
      success: true,
      message: "Registro exitoso. Tu cuenta debe ser aprobada por un administrador.",
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
    const userQuery = "SELECT id, username, email, first_name || ' ' || last_name AS full_name, role_id, status, avatar_url FROM users WHERE id = $1";
    const userResult = await pool.query(userQuery, [req.user.id]);
    const user = userResult.rows[0] || req.user;
    const customerQuery = "SELECT id, phone, email FROM customers WHERE email = $1";
    const customerResult = await pool.query(customerQuery, [user.email || req.user.username]);
    const customer = customerResult.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role_id: user.role_id,
        status: user.status,
        customer_id: customer ? customer.id : null,
        phone: customer ? customer.phone : null,
        email: customer ? customer.email : user.email,
        avatar_url: user.avatar_url,
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
    const query = "SELECT id, username, first_name, last_name, first_name || ' ' || last_name AS full_name FROM users WHERE email = $1";
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

    // Mostrar enlace en consola para desarrollo (útil sin SMTP)
    console.log("\n═══════════════════════════════════════════");
    console.log("🔗 ENLACE DE RECUPERACIÓN (desarrollo):");
    console.log(`  ${resetLink}`);
    console.log("═══════════════════════════════════════════\n");

    // Enviamos el correo usando Nodemailer
    await mailer.sendMail({
      from: `"CourtManager" <no-reply@courtmanager.com>`,
      to: email,
      subject: "Recuperación de contraseña - CourtManager",
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #0a0e27; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 56px; height: 56px; background: linear-gradient(135deg, #ccff00, #a6e000); border-radius: 14px; line-height: 56px; margin-bottom: 12px;">
              <span style="font-size: 24px;">🏟️</span>
            </div>
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">CourtManager</h1>
            <p style="color: #ccff00; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin: 4px 0 0 0;">Sistema de Gestión Integral</p>
          </div>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0;">
          <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6;">Hola, <strong style="color: #ffffff;">${user.full_name || user.username}</strong>,</p>
          <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6;">Recibimos una solicitud para restablecer tu contraseña en <strong style="color: #ffffff;">CourtManager</strong>.</p>
          <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6;">Haz clic en el botón para continuar:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #ccff00, #a6e000); color: #0a0e27; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 0 30px rgba(204,255,0,0.15);">Restablecer Contraseña</a>
          </div>
          <p style="font-size: 12px; color: #ef4444; font-weight: 600; text-align: center;">Este enlace expira en 1 hora</p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0;">
          <p style="font-size: 12px; color: #555566;">Si el botón no funciona, copia este enlace en tu navegador:</p>
          <p style="font-size: 12px; color: #ccff00; word-break: break-all; font-family: monospace; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">${resetLink}</p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0;">
          <p style="font-size: 12px; color: #555566; text-align: center;">Si no solicitaste esto, ignora este correo.</p>
        </div>
      `,
    });

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

const clientLogin = async (req, res) => {
  try {
    const { username, password } = req.body; // username is actually email

    if (!username || !password) {
      return res.status(400).json({ error: "Correo y contraseña requeridos" });
    }

    const query = "SELECT * FROM customers WHERE email = $1 AND password_hash IS NOT NULL";
    const result = await pool.query(query, [username.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const customer = result.rows[0];

    const isHashed = typeof customer.password_hash === "string" && customer.password_hash.startsWith("$2");
    const passwordMatch = isHashed
      ? await bcrypt.compare(password, customer.password_hash)
      : password === customer.password_hash;

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Role 10 for Client
    const token = jwt.sign(
      { id: customer.id, username: customer.email, role_id: 10, is_client: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      success: true,
      message: "Login exitoso",
      token,
      user: {
        id: customer.id,
        username: customer.email,
        full_name: `${customer.first_name} ${customer.last_name}`,
        role_id: 10,
        customer_id: customer.id,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("Client Login error:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const clientRegister = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !last_name || !email || !phone || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Check if customer already exists
    const existingCustomer = await pool.query(
      "SELECT * FROM customers WHERE email = $1 OR phone = $2",
      [email.toLowerCase(), phone]
    );

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    let customerId;
    let customerData;

    if (existingCustomer.rows.length > 0) {
      const customer = existingCustomer.rows[0];
      // Edge Case: Receptionist created customer, no password set.
      if (!customer.password_hash) {
        const updateRes = await pool.query(
          `UPDATE customers SET password_hash = $1, first_name = COALESCE(first_name, $2), last_name = COALESCE(last_name, $3) 
           WHERE id = $4 RETURNING *`,
          [password_hash, first_name, last_name, customer.id]
        );
        customerData = updateRes.rows[0];
        customerId = customer.id;
      } else {
        return res.status(409).json({ error: "El usuario ya existe y tiene una cuenta activa." });
      }
    } else {
      const insertRes = await pool.query(
        `INSERT INTO customers (first_name, last_name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [first_name, last_name, email.toLowerCase(), phone, password_hash]
      );
      customerData = insertRes.rows[0];
      customerId = customerData.id;
    }

    const token = jwt.sign(
      { id: customerId, username: email.toLowerCase(), role_id: 10, is_client: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Registro exitoso",
      token,
      user: {
        id: customerId,
        username: email.toLowerCase(),
        full_name: `${customerData.first_name} ${customerData.last_name}`,
        role_id: 10,
        customer_id: customerId,
        phone: customerData.phone,
        email: customerData.email,
      },
      customer_id: customerId,
    });
  } catch (error) {
    console.error("Client Register error:", error);
    res.status(500).json({ error: "Error en el servidor al registrar cliente" });
  }
};

const clientRecoverPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "El correo electrónico es requerido" });

    const query = "SELECT * FROM customers WHERE email = $1";
    const result = await pool.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.json({ success: true, message: "Si el correo existe, recibirás un enlace." });
    }

    const customer = result.rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);

    await pool.query("UPDATE customers SET reset_token = $1, reset_token_expires = $2 WHERE id = $3", [token, expires, customer.id]);

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

    await mailer.sendMail({
      from: `"CourtConnect" <no-reply@courtconnect.com>`,
      to: customer.email,
      subject: "Recuperación de contraseña - CourtConnect",
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #0a0e27; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 56px; height: 56px; background: linear-gradient(135deg, #ccff00, #a6e000); border-radius: 14px; line-height: 56px; margin-bottom: 12px;">
              <span style="font-size: 24px;">🏟️</span>
            </div>
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">CourtConnect</h1>
            <p style="color: #ccff00; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin: 4px 0 0 0;">Plataforma de Reservas Premium</p>
          </div>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0;">
          <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6;">Hola, <strong style="color: #ffffff;">${customer.first_name}</strong>,</p>
          <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6;">Recibimos una solicitud para restablecer tu contraseña en <strong style="color: #ffffff;">CourtConnect</strong>.</p>
          <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6;">Haz clic en el botón para continuar:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #ccff00, #a6e000); color: #0a0e27; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 0 30px rgba(204,255,0,0.15);">Restablecer Contraseña</a>
          </div>
          <p style="font-size: 12px; color: #ef4444; font-weight: 600; text-align: center;">Este enlace expira en 1 hora</p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0;">
          <p style="font-size: 12px; color: #555566;">Si el botón no funciona, copia este enlace en tu navegador:</p>
          <p style="font-size: 12px; color: #ccff00; word-break: break-all; font-family: monospace; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">${resetLink}</p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0;">
          <p style="font-size: 12px; color: #555566; text-align: center;">Si no solicitaste esto, ignora este correo.</p>
        </div>
      `,
    });

    return res.json({ success: true, message: "Si el correo existe, recibirás un enlace." });
  } catch (error) {
    console.error("Error en clientRecoverPassword:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const clientResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "El token y la nueva contraseña son requeridos" });

    const query = "SELECT id FROM customers WHERE reset_token = $1 AND reset_token_expires > NOW()";
    const result = await pool.query(query, [token]);

    if (result.rows.length === 0) return res.status(400).json({ error: "El token de recuperación es inválido o ha expirado" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query("UPDATE customers SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2", [hashedPassword, result.rows[0].id]);

    return res.json({ success: true, message: "Tu contraseña ha sido restablecida exitosamente." });
  } catch (error) {
    console.error("Error en clientResetPassword:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const clientGoogleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ error: "Access token requerido" });

    // Fetch user info from Google
    const fetchResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    if (!fetchResponse.ok) {
      return res.status(401).json({ error: "Token de Google inválido o expirado" });
    }

    const payload = await fetchResponse.json();
    const email = payload.email.toLowerCase();
    const firstName = payload.given_name || 'Google User';
    const lastName = payload.family_name || '';

    // Check if customer exists
    let customerResult = await pool.query("SELECT * FROM customers WHERE email = $1", [email]);
    let customer;

    if (customerResult.rows.length === 0) {
      // Create new customer
      const insertRes = await pool.query(
        "INSERT INTO customers (first_name, last_name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *",
        [firstName, lastName, email, ""]
      );
      customer = insertRes.rows[0];
    } else {
      customer = customerResult.rows[0];
    }

    // Generate JWT
    const token = jwt.sign(
      { id: customer.id, username: customer.email, role_id: 10, is_client: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      success: true,
      message: "Login con Google exitoso",
      token,
      user: {
        id: customer.id,
        username: customer.email,
        full_name: `${customer.first_name} ${customer.last_name}`,
        role_id: 10,
        customer_id: customer.id,
        phone: customer.phone,
        email: customer.email,
      },
      customer_id: customer.id,
    });
  } catch (error) {
    console.error("Google Login error:", error);
    res.status(500).json({ error: "Error en el servidor al autenticar con Google" });
  }
};

module.exports = { 
  login, register, getMe, recoverPassword, resetPassword,
  clientLogin, clientRegister, clientRecoverPassword, clientResetPassword, clientGoogleLogin
};
