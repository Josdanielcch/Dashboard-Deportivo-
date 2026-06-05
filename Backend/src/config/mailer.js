const nodemailer = require("nodemailer");

// Creamos el transportador utilizando variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "2525"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verificación de conexión (útil en consola para debug, desactivado en pruebas)
if (process.env.NODE_ENV !== "test") {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Error de conexión con el servidor SMTP:", error.message);
    } else {
      console.log("✨ Servidor de correos SMTP listo para enviar mensajes");
    }
  });
}

module.exports = transporter;
