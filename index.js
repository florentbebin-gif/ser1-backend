// index.js — backend SER1
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ TEMPORAIRE : autoriser toutes les origines (pour tests Render/Vercel)
app.use(cors());

// Parser JSON
app.use(bodyParser.json());

// Route de santé (pour tester Render)
app.get('/health', (req, res) => {
  res.send('ok');
});

// Exemple de route calcul (appelée par le front)
app.post('/api/calc', (req, res) => {
  try {
    const { age, revenu, epargneAnn } = req.body;

    // Simule le calcul de ton fichier Excel
    const potentiel = Math.round((epargneAnn || 0) * (65 - (age || 45)) * 1.05);
    const ir_est = Math.round((revenu || 0) * 0.2);

    res.json({ potentiel, ir_est });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
