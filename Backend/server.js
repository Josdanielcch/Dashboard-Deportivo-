require('dotenv').config();
const dns = require('dns');
// Forzar IPv4 para evitar errores ENETUNREACH con IPv6 en Railway (especialmente con Gmail)
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
const app = require('./src/app'); // Importa la app configurada
// Forzar el puerto a 3000 para que coincida exactamente con la configuración de red de Railway
const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});