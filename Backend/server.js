require('dotenv').config();
const app = require('./src/app'); // Importa la app configurada
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});