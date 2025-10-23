// backend/routes/placement.js
const express = require('express');
const router = express.Router();

/**
 * Calculs "Excel-like" pour Placement :
 * - Frais d’entrée appliqués une fois au t=0 : A0 = initial * (1 - entryFeePct)
 * - Croissance composée annuelle : A_t = A0 * (1 + rate)^t
 * Entrée:
 * {
 *   duration: number,
 *   custom1Years: number,
 *   products: [{ name, rate, initial, entryFeePct }]
 * }
 */
function num(x, d=0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

router.post('/', (req, res) => {
  try {
    const duration = Math.max(1, Math.floor(num(req.body?.duration, 16)));
    const custom1Years = Math.max(1, Math.floor(num(req.body?.custom1Years, duration)));
    const products = Array.isArray(req.body?.products) ? req.body.products : [];

    const years = Array.from({ length: duration }, (_, i) => i + 1);

    const series = products.map((p) => {
      const name = String(p?.name ?? 'Produit');
      const rate = num(p?.rate, 0);
      const initial = num(p?.initial, 0);
      const entryFeePct = Math.max(0, num(p?.entryFeePct, 0));
      const A0 = initial * (1 - entryFeePct);
      const values = years.map(t => A0 * Math.pow(1 + rate, t));
      return { name, values };
    });

    const total = years.map((_, i) =>
      series.reduce((acc, s) => acc + (s.values[i] ?? 0), 0)
    );

    // Valeur à l'horizon custom1Years
    const horizonByProduct = products.map((p) => {
      const rate = num(p?.rate, 0);
      const initial = num(p?.initial, 0);
      const entryFeePct = Math.max(0, num(p?.entryFeePct, 0));
      const A0 = initial * (1 - entryFeePct);
      return A0 * Math.pow(1 + rate, custom1Years);
    });
    const horizonTotal = horizonByProduct.reduce((a,b)=>a+b,0);

    res.json({
      years,
      series: [
        ...series,
        { name: 'Total', values: total }
      ],
      meta: { duration, custom1Years, inputsCount: products.length },
      horizon: { year: custom1Years, byProduct: horizonByProduct, total: horizonTotal }
    });
  } catch (err) {
    console.error('placement error:', err);
    res.status(400).json({ error: 'Bad input', details: String(err?.message || err) });
  }
});

module.exports = router;
