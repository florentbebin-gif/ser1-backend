// backend/routes/ir.js
const express = require('express');
const router = express.Router();

/**
 * Calcul d'IR progressif par tranches, compatible avec un mapping direct depuis Excel.
 *
 * Entrée (POST /api/ir):
 * {
 *   taxable: number,            // revenu imposable du foyer
 *   parts: number,              // nombre de parts (quotient familial)
 *   brackets?: Array<{          // tranches optionnelles (par PART). Si absent → barème par défaut
 *     upTo: number|null,        // plafond de tranche (par part). null => pas de plafond (dernière tranche)
 *     rate: number              // taux en décimal (ex: 0.11 pour 11%)
 *   }>
 * }
 *
 * Sortie:
 * {
 *   inputs: { taxable, parts, brackets },
 *   qfBase: number,                 // base par part
 *   detailParPart: Array<{ from,to,rate,base,tax }>, // détail par part
 *   impots: number                  // impôt total (après recomposition des parts)
 * }
 */

function toNumber(x, d = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

/**
 * Calcule l'impôt progressif pour une base (par part) et un tableau de tranches.
 * @param {number} base - base imposable PAR PART
 * @param {{upTo:number|null, rate:number}[]} brackets - tranches triées dans l'ordre croissant de upTo
 * @returns {{ tax:number, lines:Array }}
 */
function computeTaxProgressive(base, brackets) {
  let remaining = Math.max(0, base);
  let tax = 0;
  let prev = 0;
  const lines = [];

  for (const br of brackets) {
    const cap = (br.upTo == null) ? Infinity : Number(br.upTo);
    const span = Math.max(0, Math.min(remaining, cap - prev));
    const lineTax = span * (Number(br.rate) || 0);

    tax += lineTax;
    lines.push({
      from: prev,
      to: cap === Infinity ? null : cap,
      rate: Number(br.rate) || 0,
      base: span,
      tax: lineTax
    });

    remaining -= span;
    prev = cap;
    if (remaining <= 0) break;
  }

  return { tax, lines };
}

router.post('/', (req, res) => {
  try {
    const taxable = Math.max(0, toNumber(req.body?.taxable, 0));
    const parts = Math.max(1, toNumber(req.body?.parts, 1));

    // === OPTION A : barème par défaut si rien n'est fourni ===
    // ⚠️ Ceci est un placeholder pédagogique pour éviter une 400 et l'écran blanc.
    // Remplacez ces seuils/taux par ceux de VOTRE Excel pour un rendu identique.
    const defaultBrackets = [
      { upTo: 10000,  rate: 0.00 },
      { upTo: 26000,  rate: 0.11 },
      { upTo: 75000,  rate: 0.30 },
      { upTo: 160000, rate: 0.41 },
      { upTo: null,   rate: 0.45 }
    ];

    const inputBrackets = Array.isArray(req.body?.brackets) && req.body.brackets.length
      ? req.body.brackets.map(b => ({
          upTo: (b.upTo == null ? null : Number(b.upTo)),
          rate: Number(b.rate) || 0
        }))
      : defaultBrackets;

    // Base par part (quotient familial)
    const qfBase = taxable / parts;

    // Calcul par part, puis recomposition
    const step = computeTaxProgressive(qfBase, inputBrackets);
    const taxTotal = step.tax * parts;

    return res.json({
      inputs: { taxable, parts, brackets: inputBrackets },
      qfBase,
      detailParPart: step.lines,
      impots: taxTotal
    });
  } catch (err) {
    console.error('IR error:', err);
    return res.status(400).json({
      error: 'Bad input',
      details: String(err?.message || err)
    });
  }
});

module.exports = router;
