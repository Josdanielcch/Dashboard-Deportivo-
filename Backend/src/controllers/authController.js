// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/database");
const mailer = require("../config/mailer");

const isProduction = process.env.NODE_ENV === 'production';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET ? process.env.JWT_SECRET + '_refresh' : 'cc_refresh_secret');

const getCookieOptions = (maxAge = 7 * 24 * 60 * 60 * 1000) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  maxAge,
});

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
};

const generatePasswordResetHtml = ({ appName, subtitle, userName, resetLink }) => `
<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Recuperación de Contraseña — ${appName}</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body, table, td, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    @media (prefers-color-scheme: dark) {
      .email-bg {
        background-color: #0b0f19 !important;
      }
      .card-box {
        background-color: #111827 !important;
        border-color: #1f2937 !important;
      }
      .brand-title {
        color: #ffffff !important;
      }
      .heading-title {
        color: #f3f4f6 !important;
      }
      .text-body {
        color: #cbd5e1 !important;
      }
      .text-strong {
        color: #ffffff !important;
      }
      .link-wrapper {
        background-color: #1e293b !important;
        border-color: #334155 !important;
      }
      .link-text {
        color: #38bdf8 !important;
      }
      .notice-box {
        background-color: #261616 !important;
        border-color: #7f1d1d !important;
        color: #fca5a5 !important;
      }
      .footer-text {
        color: #64748b !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;" class="email-bg">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 32px 12px;" class="email-bg">
    <tr>
      <td align="center">
        <!-- Tarjeta Principal -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);" class="card-box">
          <!-- Borde Superior de Acento Deportivo -->
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #15803d, #84cc16, #15803d); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Cabecera de Marca -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center;">
              <!-- Icono Deportivo -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 12px auto;">
                <tr>
                  <td width="56" height="56" align="center" valign="middle" style="background-color: #0f172a; border: 2px solid #84cc16; border-radius: 16px; font-size: 26px; line-height: 56px;">
                    🏟️
                  </td>
                </tr>
              </table>
              <h1 class="brand-title" style="margin: 0 0 8px 0; color: #0f172a; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">${appName}</h1>
              <!-- Badge Subtítulo de Alto Contraste -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 9999px; padding: 4px 14px;">
                    <span style="color: #15803d; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">${subtitle}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Separador -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0;">
            </td>
          </tr>

          <!-- Cuerpo del Mensaje -->
          <tr>
            <td style="padding: 28px 32px 20px 32px;">
              <h2 class="heading-title" style="margin: 0 0 16px 0; color: #0f172a; font-size: 19px; font-weight: 800; letter-spacing: -0.3px;">Recuperación de Contraseña</h2>
              <p class="text-body" style="margin: 0 0 14px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                Hola, <strong class="text-strong" style="color: #0f172a; font-weight: 700;">${userName}</strong>:
              </p>
              <p class="text-body" style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                Recibimos una solicitud para restablecer la contraseña de acceso a tu cuenta en <strong>${appName}</strong>.
              </p>
              <p class="text-body" style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                Para continuar y crear tu nueva clave, haz clic en el siguiente botón:
              </p>

              <!-- Botón Bulletproof compatible con móviles y modo oscuro -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="margin: 28px auto;">
                <tr>
                  <td align="center">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#15803d" style="background-color: #15803d; border-radius: 12px; box-shadow: 0 4px 14px rgba(21, 128, 61, 0.35);">
                          <a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="background-color: #15803d; border: 16px solid #15803d; border-left-width: 32px; border-right-width: 32px; display: inline-block; color: #ffffff !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 800; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2; text-align: center;">
                            Restablecer Contraseña &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Caja de Expiración -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 20px 0;">
                <tr>
                  <td class="notice-box" style="background-color: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 12px 16px;">
                    <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: 600; line-height: 1.5;">
                      ⏱️ <strong>Aviso de seguridad:</strong> Este enlace es de un solo uso y expirará en <strong>1 hora</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Enlace alternativo directo -->
              <p class="text-body" style="margin: 24px 0 8px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                Si el botón no abre automáticamente tu navegador, puedes hacer clic o copiar directamente el siguiente enlace:
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="link-wrapper" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 16px; word-break: break-all;">
                    <span class="link-text" style="color: #0284c7; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; line-height: 1.6; text-decoration: underline; word-break: break-all; -webkit-user-select: all; user-select: all; cursor: text;">
                      ${resetLink}
                    </span>
                  </td>
                </tr>
              </table>

              <p class="text-body" style="margin: 24px 0 0 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                Si no solicitaste este cambio, puedes ignorar este correo con total tranquilidad. Tu cuenta permanece protegida y tu contraseña actual no cambiará.
              </p>
            </td>
          </tr>

          <!-- Pie de página -->
          <tr>
            <td style="padding: 20px 32px 28px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;" class="card-box">
              <p class="footer-text" style="margin: 0 0 4px 0; color: #94a3b8; font-size: 12px; font-weight: 500;">
                © ${new Date().getFullYear()} ${appName} · SportSpaces OS
              </p>
              <p class="footer-text" style="margin: 0; color: #cbd5e1; font-size: 11px;">
                Correo automático de seguridad del sistema. Por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

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

    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      role_id: user.role_id,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      type: 'panel',
    });

    res.cookie('panel_refresh_token', refreshToken, getCookieOptions());

    const customerQuery = "SELECT id, phone, email FROM customers WHERE email = $1";
    const customerResult = await pool.query(customerQuery, [user.email || user.username]);
    const customer = customerResult.rows[0];

    return res.json({
      success: true,
      message: "Login exitoso",
      token: accessToken,
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
          from: process.env.SMTP_FROM || process.env.EMAIL_FROM || (process.env.SMTP_USER ? `"CourtManager" <${process.env.SMTP_USER}>` : '"CourtManager" <no-reply@courtmanager.com>'),
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
    const customerQuery = "SELECT id, phone, email, COALESCE(membership_level, 'standard') as membership_level FROM customers WHERE email = $1";
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
        membership_level: customer ? customer.membership_level : 'standard',
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

    // Guardamos el token y su expiración en el usuario de la BD
    // Usamos NOW() + INTERVAL '1 hour' directamente en PostgreSQL para garantizar consistencia absoluta sin desajustes de zona horaria
    const updateQuery = `
      UPDATE users 
      SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour' 
      WHERE id = $2
    `;
    await pool.query(updateQuery, [token, user.id]);

    // Construimos el enlace para restablecer la contraseña en el Panel
    const rawPanelBase = process.env.PANEL_URL || (process.env.FRONTEND_URL ? (process.env.FRONTEND_URL.includes('/panel') ? process.env.FRONTEND_URL.replace(/\/$/, '') : `${process.env.FRONTEND_URL.replace(/\/$/, '')}/panel`) : "http://localhost:5173/panel");
    const panelBase = rawPanelBase.endsWith('/') ? rawPanelBase : `${rawPanelBase}/`;
    const resetLink = `${panelBase}?token=${token}`;

    const userName = user.full_name || user.username || "Usuario";

    // Mostrar enlace en consola para desarrollo (útil sin SMTP)
    console.log("\n═══════════════════════════════════════════");
    console.log("🔗 ENLACE DE RECUPERACIÓN (desarrollo):");
    console.log(`  ${resetLink}`);
    console.log("═══════════════════════════════════════════\n");

    // Enviamos el correo usando Nodemailer
    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.EMAIL_FROM || (process.env.SMTP_USER ? `"CourtManager" <${process.env.SMTP_USER}>` : '"CourtManager" <no-reply@courtmanager.com>'),
      to: email,
      subject: "Recuperación de contraseña - CourtManager",
      html: generatePasswordResetHtml({
        appName: "CourtManager",
        subtitle: "Sistema de Gestión Integral",
        userName,
        resetLink,
      }),
      text: `Hola ${userName},\n\nRecibimos una solicitud para restablecer tu contraseña en CourtManager.\n\nHaz clic en el siguiente enlace para continuar (válido por 1 hora):\n${resetLink}\n\nSi no solicitaste esto, puedes ignorar este correo de forma segura.`,
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

    // Buscamos al usuario que tenga el token de restablecimiento y que no haya expirado en users
    const query =
      "SELECT id, username FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()";
    let result = await pool.query(query, [token]);
    let targetTable = "users";

    // Si no se encuentra en users, verificamos si el token corresponde a customers
    if (!result || !result.rows || result.rows.length === 0) {
      try {
        const clientQuery =
          "SELECT id, first_name, email FROM customers WHERE reset_token = $1 AND reset_token_expires > NOW()";
        const clientResult = await pool.query(clientQuery, [token]);
        if (clientResult && clientResult.rows && clientResult.rows.length > 0) {
          result = clientResult;
          targetTable = "customers";
        }
      } catch (err) {
        // Fallback silente si la tabla customers no responde o no está mockeada
      }
    }

    if (!result || !result.rows || result.rows.length === 0) {
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
      UPDATE ${targetTable} 
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
    const accessToken = generateAccessToken({
      id: customer.id,
      username: customer.email,
      role_id: 10,
      is_client: true,
    });

    const refreshToken = generateRefreshToken({
      id: customer.id,
      username: customer.email,
      role_id: 10,
      is_client: true,
      type: 'client',
    });

    res.cookie('client_refresh_token', refreshToken, getCookieOptions());

    return res.json({
      success: true,
      message: "Login exitoso",
      token: accessToken,
      user: {
        id: customer.id,
        username: customer.email,
        full_name: `${customer.first_name} ${customer.last_name}`,
        role_id: 10,
        customer_id: customer.id,
        phone: customer.phone,
        email: customer.email,
        membership_level: customer.membership_level || 'standard',
      },
    });
  } catch (error) {
    console.error("Client Login error:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const clientRegister = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, membership_level, membershipLevel, payment_reference, paymentReference } = req.body;
    const finalMembership = membership_level || membershipLevel || 'standard';
    const finalPaymentRef = payment_reference || paymentReference || null;

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
          `UPDATE customers 
           SET password_hash = $1, 
               first_name = COALESCE(first_name, $2), 
               last_name = COALESCE(last_name, $3),
               membership_level = COALESCE($4, membership_level, 'standard'),
               payment_reference = COALESCE($5, payment_reference)
           WHERE id = $6 RETURNING *`,
          [password_hash, first_name, last_name, finalMembership, finalPaymentRef, customer.id]
        );
        customerData = updateRes.rows[0];
        customerId = customer.id;
      } else {
        return res.status(409).json({ error: "El usuario ya existe y tiene una cuenta activa." });
      }
    } else {
      const insertRes = await pool.query(
        `INSERT INTO customers (first_name, last_name, email, phone, password_hash, membership_level, payment_reference)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [first_name, last_name, email.toLowerCase(), phone, password_hash, finalMembership, finalPaymentRef]
      );
      customerData = insertRes.rows[0];
      customerId = customerData.id;
    }

    const accessToken = generateAccessToken({
      id: customerId,
      username: email.toLowerCase(),
      role_id: 10,
      is_client: true,
    });

    const refreshToken = generateRefreshToken({
      id: customerId,
      username: email.toLowerCase(),
      role_id: 10,
      is_client: true,
      type: 'client',
    });

    res.cookie('client_refresh_token', refreshToken, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: "Registro exitoso",
      token: accessToken,
      user: {
        id: customerId,
        username: email.toLowerCase(),
        full_name: `${customerData.first_name} ${customerData.last_name}`,
        role_id: 10,
        customer_id: customerId,
        phone: customerData.phone,
        email: customerData.email,
        membership_level: customerData.membership_level || finalMembership,
        payment_reference: customerData.payment_reference || finalPaymentRef,
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

    await pool.query("UPDATE customers SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour' WHERE id = $2", [token, customer.id]);

    // Construimos el enlace para restablecer la contraseña en la Website pública
    const rawWebsiteBase = process.env.WEBSITE_URL || (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/panel\/?$/, '').replace(/\/$/, '') : "http://localhost:5173");
    const websiteBase = rawWebsiteBase.endsWith('/') ? rawWebsiteBase : `${rawWebsiteBase}/`;
    const resetLink = `${websiteBase}?token=${token}`;

    const userName = customer.first_name || customer.username || "Cliente";

    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.EMAIL_FROM || (process.env.SMTP_USER ? `"CourtConnect" <${process.env.SMTP_USER}>` : '"CourtConnect" <no-reply@courtconnect.com>'),
      to: customer.email,
      subject: "Recuperación de contraseña - CourtConnect",
      html: generatePasswordResetHtml({
        appName: "CourtConnect",
        subtitle: "Plataforma de Reservas Premium",
        userName,
        resetLink,
      }),
      text: `Hola ${userName},\n\nRecibimos una solicitud para restablecer tu contraseña en CourtConnect.\n\nHaz clic en el siguiente enlace para continuar (válido por 1 hora):\n${resetLink}\n\nSi no solicitaste esto, puedes ignorar este correo de forma segura.`,
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
    let result = await pool.query(query, [token]);
    let targetTable = "customers";

    if (!result || !result.rows || result.rows.length === 0) {
      try {
        const userQuery = "SELECT id, username FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()";
        const userResult = await pool.query(userQuery, [token]);
        if (userResult && userResult.rows && userResult.rows.length > 0) {
          result = userResult;
          targetTable = "users";
        }
      } catch (err) {
        // Fallback silente
      }
    }

    if (!result || !result.rows || result.rows.length === 0) return res.status(400).json({ error: "El token de recuperación es inválido o ha expirado" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(`UPDATE ${targetTable} SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2`, [hashedPassword, result.rows[0].id]);

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
    const accessToken = generateAccessToken({
      id: customer.id,
      username: customer.email,
      role_id: 10,
      is_client: true,
    });

    const refreshToken = generateRefreshToken({
      id: customer.id,
      username: customer.email,
      role_id: 10,
      is_client: true,
      type: 'client',
    });

    res.cookie('client_refresh_token', refreshToken, getCookieOptions());

    return res.json({
      success: true,
      message: "Login con Google exitoso",
      token: accessToken,
      user: {
        id: customer.id,
        username: customer.email,
        full_name: `${customer.first_name} ${customer.last_name}`,
        role_id: 10,
        customer_id: customer.id,
        phone: customer.phone,
        email: customer.email,
        membership_level: customer.membership_level || 'standard',
      },
      customer_id: customer.id,
    });
  } catch (error) {
    console.error("Google Login error:", error);
    res.status(500).json({ error: "Error en el servidor al autenticar con Google" });
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies?.panel_refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: "Token de refresco no proporcionado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Token de refresco inválido o expirado" });
    }

    if (decoded.type !== 'panel') {
      return res.status(403).json({ error: "Tipo de token no válido para panel" });
    }

    const query =
      "SELECT id, username, email, first_name, last_name, role_id, status, avatar_url, first_name || ' ' || last_name AS full_name FROM users WHERE id = $1";
    const result = await pool.query(query, [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    if (user.status !== "Activated" && user.status !== "activated") {
      return res.status(403).json({ error: "Usuario inactivo" });
    }

    const newAccessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      role_id: user.role_id,
    });

    return res.json({
      success: true,
      token: newAccessToken,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role_id: user.role_id,
        status: user.status,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Error en refreshTokenHandler:", error);
    return res.status(500).json({ error: "Error al refrescar token" });
  }
};

const clientRefreshTokenHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies?.client_refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: "Token de refresco de cliente no proporcionado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Token de refresco inválido o expirado" });
    }

    if (decoded.type !== 'client') {
      return res.status(403).json({ error: "Tipo de token no válido para cliente" });
    }

    const query = "SELECT * FROM customers WHERE id = $1";
    const result = await pool.query(query, [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Cliente no encontrado" });
    }

    const customer = result.rows[0];

    const newAccessToken = generateAccessToken({
      id: customer.id,
      username: customer.email,
      role_id: 10,
      is_client: true,
    });

    return res.json({
      success: true,
      token: newAccessToken,
      user: {
        id: customer.id,
        username: customer.email,
        full_name: `${customer.first_name} ${customer.last_name}`,
        role_id: 10,
        customer_id: customer.id,
        phone: customer.phone,
        email: customer.email,
        membership_level: customer.membership_level || 'standard',
      },
    });
  } catch (error) {
    console.error("Error en clientRefreshTokenHandler:", error);
    return res.status(500).json({ error: "Error al refrescar token de cliente" });
  }
};

const logoutHandler = async (req, res) => {
  try {
    res.clearCookie('panel_refresh_token', getCookieOptions(0));
    return res.json({ success: true, message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error en logoutHandler:", error);
    return res.status(500).json({ error: "Error al cerrar sesión" });
  }
};

const clientLogoutHandler = async (req, res) => {
  try {
    res.clearCookie('client_refresh_token', getCookieOptions(0));
    return res.json({ success: true, message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error en clientLogoutHandler:", error);
    return res.status(500).json({ error: "Error al cerrar sesión" });
  }
};

module.exports = { 
  login, register, getMe, recoverPassword, resetPassword,
  clientLogin, clientRegister, clientRecoverPassword, clientResetPassword, clientGoogleLogin,
  refreshTokenHandler, clientRefreshTokenHandler, logoutHandler, clientLogoutHandler
};
