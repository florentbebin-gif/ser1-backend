const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req,res)=>res.type('text').send('ok'));

// Routes
app.use('/api/placement', require('./routes/placement'));
app.use('/api/ir', require('./routes/ir'));

// Root
app.get('/', (req,res)=>res.type('text').send('SER1 backend'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('server running on '+PORT));
