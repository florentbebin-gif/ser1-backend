// routes/ir.js
const express = require('express');
const router = express.Router();

/**
 * Calcul IR par tranches progressives.
 * Entrée: {
 *   taxable: number,            // revenu imposable du foyer
 *   parts: number,              // nb de parts (quotient familial)
 *   brackets?: [ { upTo, rate } , ... , { upTo:null, rate } ] // optionnel
 * }
 * Convention: rate = 0.11 pour 11% ; upTo en € (par **part**)
 * Si brackets omis, vous pouvez fournir côté frontend les tranches de l’année voulue.
 */

function toNumber(x, d=0){ const n=Number(x); return Number.isFinite(n)?n:d; }

function computeTaxProgressive(base, brackets){
  let remaining = base;
  let tax = 0;
  let prev = 0;
  const lines = [];
  for(const br of brackets){
    const cap = (br.upTo == null) ? Infinity : br.upTo;
    const span = Math.max(0, Math.min(remaining, cap - prev));
    const lineTax = span * br.rate;
    tax += lineTax;
    lines.push({ from: prev, to: cap === Infinity ? null : cap, rate: br.rate, base: span, tax: lineTax });
    remaining -= span;
    prev = cap;
    if(remaining <= 0) break;
  }
  return { tax, lines };
}

router.post('/', (req,res)=>{
  try{
    const taxable = Math.max(0, toNumber(req.body?.taxable, 0));
    const parts = Math.max(1, toNumber(req.body?.parts, 1));
    const brackets = Array.isArray(req.body?.brackets) && req.body.brackets.length
      ? req.body.brackets.map(b=>({ upTo: (b.upTo==null?null:Number(b.upTo)), rate: Number(b.rate)||0 }))
      : null;

    if(!brackets){
      // Par défaut, laissez le frontend passer les tranches exactes liées au modèle Excel.
      // Ici, on met une structure vide explicite pour forcer le caller à fournir les tranches.
      return res.status(400).json({ error: 'Brackets manquants. Passez les tranches depuis le frontend pour coller au tableur.' });
    }

    const qfBase = taxable / parts; // base par part
    const step = computeTaxProgressive(qfBase, brackets);
    const tax = step.tax * parts;   // recomposition du QF

    res.json({
      inputs: { taxable, parts, brackets },
      qfBase,
      detailParPart: step.lines,
      impots: tax
    });
  }catch(err){
    console.error(err);
    res.status(400).json({ error: 'Bad input', details: String(err?.message||err) })
  }
});

module.exports = router;
