# PER Simulator Backend (SER1)
Backend Express prêt à être connecté à Supabase.

## Installation
```
npm install
npm start
```

## Création d'un admin Supabase
```
export SUPABASE_URL="https://xyz.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="service_role_key"
export ADMIN_EMAIL="ton.email@domaine.fr"
export ADMIN_PASSWORD="MotDePasseFort123!"
node seed_admin.js
```
