require('dotenv').config();
const dns = require('dns');
const http = require('http');
const { Server } = require('socket.io');

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
const app = require('./src/app'); // Importa la app configurada

// Forzar el puerto a 3000 para que coincida exactamente con la configuración de red de Railway
const PORT = 3000;

const app = require('./src/app');

const PORT = 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'https://rococo-malasada-e1ce07.netlify.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('join-dashboard', () => {
    socket.join('dashboard');
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
