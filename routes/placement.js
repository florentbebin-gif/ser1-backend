// routes/placement.js
const express = require('express');
const router = express.Router();

/**
 * Hypothèses "Excel-like" retenues (simples et exactes):
 * - Frais d’entrée (entryFeePct) appliqués une seule fois au capital initial (t=0)
 * - Capital net investi A0 = initial * (1 - entryFeePct)
 * - Croissance composée annuelle : A_t = A0 * (1 + rate)^t, t ∈ [1..duration]
 * - Agrégat Total = somme des produits année par année
 */

function toNumber(x, fallback = 0){
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

router.post('/', (req, res) => {
  try {
    const duration = Math.max(1, Math.floor(toNumber(req.body?.duration, 16)));
    const custom1Years = Math.max(1, Math.floor(toNumber(req.body?.custom1Years, duration)));
    const products = Array.isArray(req.body?.products) ? req.body.products : [];

    const years = Array.from({ length: duration }, (_, i) => i + 1);

    const series = products.map((p) => {
      const name = String(p?.name ?? 'Produit');
      const rate = toNumber(p?.rate, 0);         // ex: 0.04 pour 4%
      const initial = toNumber(p?.initial, 0);
      const entryFeePct = Math.max(0, toNumber(p?.entryFeePct, 0)); // ex: 0.085 pour 8.5%

      const A0 = initial * (1 - entryFeePct);
      const values = years.map(t => A0 * Math.pow(1 + rate, t));
      return { name, rate, initial, entryFeePct, A0, values };
    });

    // Série d’agrégat Total
    const total = years.map((_, i) => series.reduce((acc, s) => acc + (s.values[i] ?? 0), 0));

    // Valeurs à l’horizon custom1Years
    const horizonYears = Array.from({ length: custom1Years }, (_, i) => i + 1);
    const horizonByProduct = products.map((p) => {
      const rate = toNumber(p?.rate, 0);
      const initial = toNumber(p?.initial, 0);
      const entryFeePct = Math.max(0, toNumber(p?.entryFeePct, 0));
      const A0 = initial * (1 - entryFeePct);
      const v = A0 * Math.pow(1 + rate, custom1Years);
      return v;
    });
    const horizonTotal = horizonByProduct.reduce((a,b)=>a+b,0);

    return res.json({
      years,
      series: [
        ...series.map(s => ({ name: s.name, values: s.values })),
        { name: 'Total', values: total }
      ],
      meta: {
        duration,
        custom1Years,
        inputsCount: products.length
      },
      horizon: {
        year: custom1Years,
        byProduct: horizonByProduct,
        total: horizonTotal
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Bad input', details: String(err?.message || err) });
  }
});

module.exports = router;
