const express = require('express');
const bodyParser = require('body-parser');
const calcRouter = require('./routes/calc');
const exportRouter = require('./routes/export-pptx');

const app = express();
app.use(bodyParser.json());

app.use('/api/calc', calcRouter);
app.use('/api/export-pptx', exportRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on', PORT));
