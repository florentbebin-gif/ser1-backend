const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const calcRouter = require('./routes/calc');
const exportRouter = require('./routes/export-pptx');

const app = express();

/**
 * CORS — autorise ton front Vercel et le dev local
 * IMPORTANT : ce middleware doit être placé AVANT les routes (/health, /api/…)
 */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ser1-frontend.vercel.app' // <= ton origine front (celle vue dans l’erreur)
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// Route santé (aussi couverte par CORS)
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.send('ok');
});

// API
app.use('/api/calc', calcRouter);
app.use('/api/export-pptx', exportRouter);

// Render fournit PORT via variables d'env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on', PORT));
