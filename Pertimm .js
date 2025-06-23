const axios = require('axios');

const BASE_URL = 'https://hire-game.pertimm.dev';
const email = 'med_abbad@outlook.fr';
const password = 'MotDePasseFort123!'
const first_name = 'Mohamed';
const last_name = 'Abbad'

(async () => {
  try {
    // 1.Register
    console.log('➡️ POST Register...');
    await axios.post(`${BASE_URL}/api/v1.1/auth/register/`, {
      email,
      password1: password,
      password2: password,
      // url_format optionnel, j'ai pas ajouté pour l'instant :)
    });
    console.log('✅ Étape 1 : Register OK');

    // 2. Login
    console.log('➡️ POST Login...');
    const loginRes = await axios.post(`${BASE_URL}/api/v1.1/auth/login/`, {
      email,
      password,
    });
    const token = loginRes.data.token;
    console.log('✅ Étape 2 : Login OK, token reçu')

    const headers = { Authorization: `Token ${token}` }

    // 3. Create application
    console.log('➡️ POST job-application-request...');
    const createRes = await axios.post(`${BASE_URL}/api/v1.1/job-application-request/`, {
      email,
      first_name,
      last_name,
    }, { headers });

    const statusUrl = createRes.data.url;
    console.log(`✅ Étape 3 : Application créée, status URL: ${statusUrl}`);

   // 4. Polling status (max 10 essais, 1s d'intervalle
console.log('🔁 Attente que status soit COMPLETED...');
let confirmationUrl = null;
for (let i = 0; i < 10; i++) {
  // Prendre en compte que statusUrl est déjà une URL complète!
  const urlToFetch = statusUrl.startsWith('http') ? statusUrl : BASE_URL + statusUrl;

  const statusRes = await axios.get(urlToFetch, { headers });
  console.log(`⏳ Status: ${statusRes.data.status}`);
  if (statusRes.data.status === 'COMPLETED') {
    confirmationUrl = statusRes.data.confirmation_url;
    console.log('✅ Status COMPLETED');
    break;
  }
  await new Promise(r => setTimeout(r, 1000));
}
if (!confirmationUrl) throw new Error('⛔ Timeout: status jamais COMPLETED');

// 5. Confirm application
console.log('➡️ PATCH confirmation...');
const urlToConfirm = confirmationUrl.startsWith('http') ? confirmationUrl : BASE_URL + confirmationUrl;
const confirmRes = await axios.patch(urlToConfirm, {
  confirmed: true
}, { headers });
console.log('✅ Étape 5 : Confirmation réussie')
console.log(confirmRes.data)
  } catch (err) {
    console.error('❌ Erreur:', err.response?.data || err.message);
  }
})();
