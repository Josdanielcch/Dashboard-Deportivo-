const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mailer = require('../src/config/mailer');

async function testMail() {
  if (!mailer) {
    console.error('Mailer is null. SMTP variables not loaded.');
    process.exit(1);
  }

  const targetEmail = process.argv[2] || process.env.SMTP_USER || 'admin@courtconnect.com';
  const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER;

  console.log("\n========================================================");
  console.log("       PRUEBA DE CONFIGURACIÓN SMTP (BREVO / NODEMAILER)");
  console.log("========================================================");
  console.log(`🌐 Servidor (Host): ${process.env.SMTP_HOST || 'NO DEFINIDO'}`);
  console.log(`🔌 Puerto:          ${process.env.SMTP_PORT || '587'}`);
  console.log(`👤 Usuario Brevo:   ${process.env.SMTP_USER || 'NO DEFINIDO'}`);
  console.log(`🔑 Clave SMTP:      ${process.env.SMTP_PASS ? '******** (definida)' : 'NO DEFINIDA'}`);
  console.log(`📤 Remitente (From): ${fromEmail || 'Por defecto'}`);
  console.log(`📥 Destinatario:    ${targetEmail}`);
  console.log("========================================================\n");

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("⚠️ Faltan variables SMTP en tu archivo .env");
    console.error("Asegúrate de definir SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASS.");
    process.exit(1);
  }

  try {
    console.log("⏳ Enviando correo de prueba...");
    const result = await mailer.sendMail({
      from: fromEmail,
      to: targetEmail,
      subject: "⚽ Prueba de Envío SMTP - Brevo / CourtManager",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">¡Conexión Brevo Exitosa! 🎉</h1>
            <p style="color: #94a3b8; font-size: 14px;">CourtManager & CourtConnect</p>
          </div>
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155;">
            <p style="margin-top: 0;">Hola,</p>
            <p>Este correo confirma que tu servicio de <strong>SMTP de Brevo</strong> está correctamente conectado y funcionando en tu backend.</p>
            <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.8;">
              <li><strong>Host:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>Puerto:</strong> ${process.env.SMTP_PORT || '587'}</li>
              <li><strong>Remitente verificado:</strong> ${fromEmail}</li>
              <li><strong>Fecha y hora:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 24px;">
            Enviado desde el sistema de pruebas del backend.
          </p>
        </div>
      `,
      text: `¡Conexión Brevo Exitosa! Tu servicio SMTP está funcionando correctamente desde ${process.env.SMTP_HOST}.`
    });

    console.log("\n✅ ¡Correo de prueba enviado con éxito!");
    if (result && result.messageId) {
      console.log(`🆔 Message ID: ${result.messageId}`);
    }
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error al enviar el correo:");
    console.error(error.message);

    if (error.response) {
      console.error("\nRespuesta del servidor SMTP:");
      console.error(error.response);
    }

    if (error.message.includes("550") || (error.response && error.response.includes("550"))) {
      console.error("\n💡 CONSEJO PARA BREVO:");
      console.error("El error 550 suele indicar que el correo remitente (FROM) no está validado");
      console.error("como remitente autorizado en Brevo (Senders & IP > Senders).");
    } else if (error.message.includes("535") || (error.response && error.response.includes("535"))) {
      console.error("\n💡 CONSEJO PARA BREVO:");
      console.error("El error 535 indica autenticación fallida. Asegúrate de:");
      console.error("1. Usar tu clave SMTP (Master Key que empieza con xsmtpsib-...) y NO tu contraseña de acceso web de Brevo.");
      console.error("2. Verificar que el usuario en SMTP_USER sea exactamente el correo o login SMTP indicado en Brevo.");
    }
    process.exit(1);
  }
}

setTimeout(testMail, 1500);
