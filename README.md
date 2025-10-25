# SER1 – Backend (Express on Render)

API Node/Express exposant :
- `GET /health` : état
- `POST /api/placement` : calculs placement (et autres routes à venir)
- `POST /api/export-pptx` : placeholder export PowerPoint

## 1) Dossier / Fichiers clés
routes/
placement.js
calc.js
export-pptx.js
config/
ir_2025.json
index.js # bootstrap Express, CORS, routes

shell
Copier le code

## 2) Variables d'environnement (Render → Settings → Environment)
PORT=10000
NODE_ENV=production
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE=... # si besoin d'actions server-side
ALLOWED_ORIGINS=https://ser1-site-frontend.vercel.app,https://app.ser1.app

shell
Copier le code

## 3) Lancer en local
```bash
npm i
npm run dev    # ou: node index.js
# http://localhost:10000/health
4) Déploiement Render
Connecté au repo GitHub ser1-backend

Branch main, Auto Deploy = ON

Free instance → cold start (+~50s). Option : passer en instance payante pour supprimer la latence.

5) CORS
Dans index.js, autoriser les origines définies par ALLOWED_ORIGINS (séparées par des virgules).
Exemple :

js
Copier le code
const allow = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
app.use(require('cors')({
  origin: (origin, cb) => {
    if (!origin || allow.includes(origin)) return cb(null, true)
    return cb(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
6) Santé & Observabilité
/health doit renvoyer { ok: true, time: ... }

Sur Render : onglet Logs pour suivre les déploiements

7) Supabase
Table profiles (ex : id uuid, email text, role text, created_at timestamptz)

RLS désactivé pour l’admin actuel (à sécuriser plus tard)

perl
Copier le code

---

# Checklist Dev → Prod

Colle ce bloc dans un fichier `CHECKLIST.md` (dans chaque repo ou dans un repo « meta » au besoin) :

```md
# Checklist SER1

## Pré-requis
- [ ] Comptes créés : GitHub, Vercel, Render, Supabase, Registrar (Nom de domaine)
- [ ] Deux repos : `ser1-site-frontend` (React) et `ser1-backend` (Express)

## Supabase
- [ ] Projet créé + Region choisie
- [ ] Table `profiles` créée (id/email/role/created_at)
- [ ] RLS (Row Level Security) configurée selon besoins
- [ ] Récupérer `SUPABASE_URL` et `ANON KEY` (+ `SERVICE_ROLE` si nécessaire)

## Backend (Render)
- [ ] Connecter Render au repo `ser1-backend`
- [ ] Variables d'env : `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `ALLOWED_ORIGINS`
- [ ] Déployer et vérifier `GET /health`
- [ ] Tester `/api/placement` en local et en prod
- [ ] (Option) Ajouter **Custom Domain** `api.ser1.app` → CNAME → `xxxx.onrender.com`

## Frontend (Vercel)
- [ ] Connecter Vercel au repo `ser1-site-frontend`
- [ ] Variables d'env : `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Déployer la branche `main`
- [ ] Vérifier que l'app appelle bien l'API Render (CORS OK)
- [ ] (Option) Ajouter le domaine `app.ser1.app` sur Vercel

## DNS / Domaines
- [ ] Acheter/posséder `ser1.app` (ou autre)
- [ ] Configurer `app.ser1.app` → Vercel
- [ ] Configurer `api.ser1.app` → Render
- [ ] Mettre à jour `VITE_API_BASE_URL=https://api.ser1.app`
- [ ] Vérifier HTTPS (certificats auto via Vercel/Render)

## Finitions
- [ ] README, ARCHITECTURE.md, CHECKLIST.md présents et à jour
- [ ] Liens de prod : `https://app.ser1.app` (FE), `https://api.ser1.app` (BE)
- [ ] Comptes admin créés dans Supabase
