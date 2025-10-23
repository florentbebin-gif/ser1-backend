// index.js — SER1 backend (ajout /api/ir)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const ir = require('./routes/ir');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // temporaire
app.use(bodyParser.json());

app.get('/health', (req,res)=>res.send('ok'));
app.use('/api/ir', ir);

app.listen(PORT, () => console.log('✅ Server running on', PORT));
