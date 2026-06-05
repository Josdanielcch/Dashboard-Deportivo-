const nodemailer = require("nodemailer");

// Solo inicializamos si tenemos las variables necesarias
const createTransporter = () => {
    // Si no tienes variables de entorno, no intentes crear el transporter
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

// Verificación solo si el transportador existe
if (transporter && process.env.NODE_ENV !== "test") {
    transporter.verify((error, success) => {
        if (error) {
            console.error("❌ Error de conexión con el servidor SMTP:", error.message);
            // IMPORTANTE: NO usamos process.exit(1) aquí para no tumbar el servidor
        } else {
            console.log("📌 Servidor de correos SMTP listo para enviar mensajes");
        }
    });
}

module.exports = transporter;
