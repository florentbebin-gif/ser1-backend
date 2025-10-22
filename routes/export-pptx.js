const express = require('express');
const PPTX = require('pptxgenjs');
const router = express.Router();

router.post('/', async (req, res) => {
  const { inputs={}, result={} } = req.body;
  const pptx = new PPTX();
  const slide = pptx.addSlide();
  slide.addText('Synthèse PER', { x:0.5, y:0.4, fontSize:24 });
  slide.addText(`Age: ${inputs.age || '-'}\nPotentiel: ${result.potentiel || '-'} €`, { x:0.5, y:1.2, fontSize:14 });
  const out = await pptx.write('nodebuffer');
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.presentationml.presentation');
  res.setHeader('Content-Disposition','attachment; filename="synthese-per.pptx"');
  res.send(out);
});

module.exports = router;
