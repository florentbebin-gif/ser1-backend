const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const bareme = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/ir_2025.json'), 'utf-8'));

function arrondiEuro(x){ return Math.round(Number(x) || 0); }

function impotBarème(quotient, tranches){
  let imp = 0, details = [];
  for(const t of tranches){
    const lo = t.borne_inf;
    const hi = (t.borne_sup ?? Infinity);
    if(quotient > lo){
      const base = Math.max(0, Math.min(quotient, hi) - lo);
      const part = base * t.taux;
      details.push({ borne_inf: lo, borne_sup: t.borne_sup, taux: t.taux, base: arrondiEuro(base), impot: arrondiEuro(part) });
      imp += part;
      if(quotient <= hi) break;
    }
  }
  return { imp: arrondiEuro(imp), details };
}

function calcDecote(ir_brut, couple){
  const d = bareme.decote;
  if(!d) return 0;
  const seuil = couple ? d.seuil_couple : d.seuil_celib;
  const montant = couple ? d.montant_couple : d.montant_celib;
  if(ir_brut <= 0) return 0;
  if(ir_brut < seuil) return Math.max(0, arrondiEuro(montant - ir_brut));
  return 0;
}

function plafonnementQF(avantage_calcule, nb_parts){
  const p = bareme.plaf_qf;
  if(!p || !p.avantage_max_par_demi_part) return 0;
  const parts_de_base = nb_parts > 2 ? 2 : 1; // simplifié
  const demi_parts_sup = Math.max(0, (nb_parts - parts_de_base) * 2) / 2;
  const plafond = demi_parts_sup * p.avantage_max_par_demi_part;
  return Math.max(0, arrondiEuro(Math.max(0, avantage_calcule - plafond)));
}

router.post('/', (req, res) => {
  try{
    const {
      revenu_imposable = 0,
      nb_parts = 1.0,
      situation = 'celibataire',
      rfr = 0,
      charges_deductibles = 0,
      reductions = 0,
      credits = 0,
      annee = 2025
    } = req.body || {};

    const couple = (situation === 'marie' || situation === 'pacs');
    const base = Math.max(0, revenu_imposable - charges_deductibles);
    const quotient = base / (nb_parts || 1);

    const bar = impotBarème(quotient, bareme.tranches);
    const ir_brut_quotient = bar.imp;
    const ir_brut = arrondiEuro(ir_brut_quotient * (nb_parts || 1));

    const decote = calcDecote(ir_brut, couple);
    const ir_apres_decote = Math.max(0, ir_brut - decote);

    const avantage_qf_calcule = 0; // TODO
    const plaf_qf = plafonnementQF(avantage_qf_calcule, nb_parts);

    const ir_avant_credits = Math.max(0, ir_apres_decote + plaf_qf);
    const ir_apres_reductions = Math.max(0, ir_avant_credits - (reductions || 0));
    const ir_net = Math.max(0, ir_apres_reductions - (credits || 0));

    const taux_marginal = (bar.details.filter(d => d.base > 0).slice(-1)[0]?.taux) ?? 0;

    return res.json({
      inputs: { revenu_imposable, nb_parts, situation, rfr, charges_deductibles, reductions, credits, annee },
      ir_brut,
      decote,
      plafonnement_qf: plaf_qf,
      ir_net_avant_credits: ir_apres_reductions,
      credits_imputes: credits,
      ir_net,
      taux_marginal,
      details: { quotient: Math.round(quotient), tranches: bar.details }
    });
  }catch(e){
    console.error(e);
    return res.status(500).json({ error: 'Erreur serveur', details: String(e) });
  }
});

module.exports = router;
