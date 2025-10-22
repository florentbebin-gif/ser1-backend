// seed_admin.js — Supabase v2 compatible
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ser1.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

(async () => {
  try {
    let userId = null;

    // 1) Tente de créer l'utilisateur
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true
    });

    if (createErr) {
      // Si l'utilisateur existe déjà, on va le retrouver via listUsers()
      if (createErr.message && createErr.message.toLowerCase().includes('already')) {
        console.log('User already exists, trying to fetch it...');
        const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (listErr) throw listErr;
        const found = (list?.users || []).find(u => (u.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase());
        if (!found) throw new Error('User already exists but could not be found via listUsers');
        userId = found.id;
        console.log('Found existing user:', ADMIN_EMAIL, 'id:', userId);
      } else {
        throw createErr;
      }
    } else {
      userId = created.user.id;
      console.log('Created user:', created.user.email, 'id:', userId);
    }

    // 2) Upsert du profil avec rôle admin
    const { error: upsertErr } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, email: ADMIN_EMAIL, role: 'admin' },
        { onConflict: 'id' }
      );

    if (upsertErr) throw upsertErr;

    console.log('Admin profile upserted successfully.');
    console.log('Done ✅');
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
})();
