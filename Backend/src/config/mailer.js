const nodemailer = require("nodemailer");

// Solo creamos el transportador si existen variables
const createTransporter = () => {
    if (!process.env.SMTP_HOST) {
        console.warn("⚠️ SMTP no configurado: El envío de correos está deshabilitado.");
        return null;
    }
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "2525"),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const transporter = createTransporter();

// Verificación segura: No detiene el servidor si falla
if (transporter) {
    transporter.verify((error, success) => {
        if (error) console.error("❌ Error SMTP (No bloqueante):", error.message);
        else console.log("📌 Servidor de correos listo");
    });
}

module.exports = transporter;