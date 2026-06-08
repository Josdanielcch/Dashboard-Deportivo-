require('dotenv').config();
const mailer = require('./src/config/mailer');

async function testMail() {
  if (!mailer) {
    console.error('Mailer is null. SMTP variables not loaded.');
    process.exit(1);
  }
  try {
    console.log('Sending test email...');
    await mailer.sendMail({
      from: `"SportSpaces OS" <no-reply@sportspaces.com>`,
      to: 'josdanielcch@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email.'
    });
    console.log('Email sent successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Error sending email:', e);
    process.exit(1);
  }
}
testMail();
