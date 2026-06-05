require('dotenv').config();
const app = require('./src/app'); // Importa la app configurada
// Forzar el puerto a 3000 para que coincida exactamente con la configuración de red de Railway
const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});