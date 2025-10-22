const express = require('express');
const router = express.Router();

// Exemple simplifié: calcul du potentiel retraite
router.post('/', (req, res) => {
  const { age=45, revenu=45000, epargneAnn=3000, taux=0.03, retraite=67 } = req.body;
  const years = Math.max(0, retraite - age);
  let pot = 0;
  for(let i=0;i<years;i++) pot = (pot + epargneAnn) * (1 + taux);
  const ir_est = Math.round(revenu * 0.2);
  res.json({ potentiel: Math.round(pot), ir_est });
});

module.exports = router;
