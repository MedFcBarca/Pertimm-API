const express = require('express')
const app = express()
app.use(express.json())

// Middleware pour logger mes requetes :)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  console.log('Headers:', req.headers)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

const PORT = 3000;

// stockge mémoire
let users = [];
let applications = {};
let tokens = {};

// les helpers pour mes tokens
function generateToken(email) {
  return Buffer.from(email).toString('base64');
}
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Register
app.post('/api/v1.1/register/', (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).json({ error: 'Champs manquants' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Utilisateur déjà existant' });
  }
  users.push({ email, first_name, last_name, password });
  res.status(201).json({ message: 'Inscription réussie' });
})

// Login
app.post('/api/v1.1/login/', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Identifiants invalides' });
  const token = generateToken(email);
  tokens[token] = email;
  res.json({ token });
});

// Middleware auth ! ! !
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Token ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = auth.split(' ')[1];
  if (!tokens[token]) return res.status(401).json({ error: 'Token invalide' });
  req.userEmail = tokens[token];
  next();
}

// Create application :
app.post('/api/v1.1/job-application-request/', authMiddleware, (req, res) => {
  const { email, first_name, last_name } = req.body;
  if (!email || !first_name || !last_name) {
    return res.status(400).json({ error: 'Champs manquants' })
  }
  const id = generateId();
  applications[id] = {
    email,
    first_name,
    last_name,
    status: 'PENDING',
    confirmation_url: null,
  }

  //Simuler le changement de statut en COMPLETED apres 5 secondes
  setTimeout(() => {
    applications[id].status = 'COMPLETED';
    applications[id].confirmation_url = `/api/v1.1/job-application-confirm/${id}`;
  }, 5000);

  res.json({
    url: `/api/v1.1/job-application-status/${id}`
  });
});

// Confirmer la candidature :
app.patch('/api/v1.1/job-application-confirm/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const appData = applications[id];
  if (!appData) return res.status(404).json({ error: 'Application non trouvée' });

  // je dois vérifier le champ confirmed
  if (req.body.confirmed !== true) {
    return res.status(400).json({ error: 'Confirmation doit être true' });
  }

  // Ici on accepte toujours (pas de timeout strict)
  res.json({ message: 'Confirmation réussie' });
});



// Démarrer serveur
app.listen(PORT, () => {
  console.log(`Mock Pertimm API server running on http://localhost:${PORT}`);
});
