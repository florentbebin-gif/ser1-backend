// routes/placement.js
const express = require('express');
const router = express.Router();

/**
 * Moteur "Placement" (version 1)
 * Hypothèses :
 * - Montant initial par produit (colonne "Placement initial").
 * - Frais d'entrée (%) appliqués au départ et DÉDUITS du capital (initial_net = initial * (1 - fee%)).
 * - Rendement net annuel (taux décimal) appliqué en fin d'année : C(n+1) = C(n) * (1 + taux).
 * - Durée (années entières).
 * - Durée "sur mesure" affichée en bas pour le Placement 1.
 *
 * POST /api/placement
 * {
 *   "duration": 16,
 *   "custom1Years": 20,
 *   "products": [
 *     {"name":"Placement 1","rate":0.05,"initial":563750,"entryFeePct":0.00},
 *     {"name":"Placement 2","rate":0.04,"initial":570000,"entryFeePct":0.00},
 *     {"name":"Placement 3","rate":0.035,"initial":100000,"entryFeePct":0.00},
 *     {"name":"Assurance vie (SCPI)","rate":0.04,"initial":97000,"entryFeePct":0.085},
 *     {"name":"Compte titre","rate":0.05,"initial":100000,"entryFeePct":0.00}
 *   ]
 * }
 */
router.post('/', (req, res) => {
  try {
    const duration = Math.max(1, Math.floor(+req.body?.duration || 16));
    const custom1Years = Math.max(1, Math.floor(+req.body?.custom1Years || duration));
    const products = Array.isArray(req.body?.products) ? req.body.products : [];

    const years = Array.from({ length: duration }, (_, i) => i + 1);

    const series = products.map((p, idx) => {
      const name = p.name || `Produit ${idx + 1}`;
      const rate = +p.rate || 0; // ex: 0.05
      const initial = Math.max(0, +p.initial || 0);
      const feePct = Math.max(0, +p.entryFeePct || 0); // ex: 0.085
      const entryCost = Math.round(initial * feePct);
      const initialNet = Math.round(initial - entryCost);

      // évolution annuelle
      let values = [];
      let c = initialNet;
      for (let y = 1; y <= duration; y++) {
        c = c * (1 + rate);
        values.push(Math.round(c)); // arrondi entier pour un rendu Excel-like
      }

      return { name, rate, initial, entryCost, initialNet, values };
    });

    // Durée "sur mesure" (Placement 1)
    let custom1 = null;
    if (series[0]) {
      let c = series[0].initialNet;
      for (let y = 1; y <= custom1Years; y++) c *= (1 + (products[0]?.rate || 0));
      custom1 = { years: custom1Years, final: Math.round(c) };
    }

    res.json({ years, series, custom1 });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message || 'invalid input' });
  }
});

module.exports = router;
