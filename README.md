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


