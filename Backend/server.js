const cors = require('cors');

app.use(cors({
    origin: 'https://rococo-malasada-e1ce07.netlify.app/', // Tu URL de Netlify
    credentials: true
}));