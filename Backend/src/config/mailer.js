require('dotenv').config();
const nodemailer = require("nodemailer");

let transporter = null;

const createTransporter = async () => {
  if (process.env.SMTP_HOST) {
    const port = parseInt(process.env.SMTP_PORT || "587");
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    try {
      await transporter.verify();
      console.log("");
      console.log("╔══════════════════════════════════════════════════╗");
      console.log("║        📧 SMTP CONFIGURADO CORRECTAMENTE        ║");
      console.log("║        Los correos ya llegan a destino          ║");
      console.log("╚══════════════════════════════════════════════════╝");
      console.log("");
    } catch (err) {
      console.error("❌ Error SMTP:", err.message);
      console.log("📧 Usando Ethereal (email de prueba)...");
      await createEthereal();
    }
  } else {
    console.log("📧 SMTP no configurado. Usando Ethereal (email de prueba)...");
    await createEthereal();
  }
};

const createEthereal = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📧 Ethereal listo: ${testAccount.user}`);
  } catch (err) {
    console.warn("⚠️ No se pudo crear cuenta Ethereal. Los correos se mostrarán en consola.");
    transporter = null;
  }
};

const sendMail = async (options) => {
  if (transporter) {
    try {
      const info = await transporter.sendMail(options);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("");
      console.log("╔══════════════════════════════════════════════════╗");
      console.log("║        📧 EMAIL ENVIADO CON ÉXITO              ║");
      console.log("║  Para:    " + (options.to || "").padEnd(30) + "║");
      console.log("║  Asunto:  " + (options.subject || "").substring(0, 28).padEnd(28) + "║");
      if (previewUrl) {
        console.log("║  Preview: " + previewUrl.substring(0, 28).padEnd(28) + "║");
      }
      console.log("╚══════════════════════════════════════════════════╝");
      console.log("");
      return info;
    } catch (err) {
      console.error("❌ Error enviando email:", err.message);
      throw err;
    }
  } else {
    console.log("\n═══════════════════════════════════════════");
    console.log("📧 EMAIL (fallback - sin SMTP configurado):");
    console.log("  Para:", options.to);
    console.log("  Asunto:", options.subject);
    console.log("  Contenido HTML incluido");
    console.log("═══════════════════════════════════════════\n");
    return { messageId: "console-fallback", to: options.to };
  }
};

createTransporter();

module.exports = { sendMail };
