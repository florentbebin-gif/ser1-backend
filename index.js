const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const calcRouter = require('./routes/calc');
const exportRouter = require('./routes/export-pptx');

const app = express();

// Autorise le front (localhost et ton futur domaine Vercel)
app.use(cors({
  origin: ['http://localhost:5173', 'https://ton-site-front.vercel.app'],
  methods: ['GET', 'POST']
}));

app.use(bodyParser.json());

// ✅ Route santé
app.get('/health', (req, res) => res.send('ok'));

// Tes routes d'API
app.use('/api/calc', calcRouter);
app.use('/api/export-pptx', exportRouter);

// ✅ Render fournit PORT via env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on', PORT));
