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

// Démarrer serveur
app.listen(PORT, () => {
  console.log(`Mock Pertimm API server running on http://localhost:${PORT}`);
});
