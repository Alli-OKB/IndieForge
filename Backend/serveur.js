const express = require('express');
const cors = require('cors');
const pool = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/workspace', async (req, res) => {
  try {
    console.log("Tentative de lecture de la base de données...");
    const result = await pool.query('SELECT * FROM workspace;'); 
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SQL détectée :", err.message);
    res.status(500).send("Erreur de connexion à la base de données");
  }
});

app.get('/api/workspace/:id/dashboard', async (req, res) => {
  const workspaceId = req.params.id;

  try {
    console.log(`Lecture du dashboard pour le workspace ID : ${workspaceId}`);

    const tacheResult = await pool.query(
      'SELECT * FROM tache WHERE id_workspace = $1', 
      [workspaceId]
    );

    const bugResult = await pool.query(
      'SELECT * FROM bug WHERE id_workspace= $1', 
      [workspaceId]
    );

    const assetResult = await pool.query(
      'SELECT * FROM asset WHERE id_workspace = $1', 
      [workspaceId]
    );

    res.json({
      tache: tacheResult.rows,
      bug: bugResult.rows,
      asset: assetResult.rows
    });

  } catch (err) {
    console.error("Erreur lors du chargement du dashboard :", err.message);
    res.status(500).send("Erreur serveur lors de la récupération du dashboard");
  }
});

app.post('/api/workspace', async (req, res) => {

  const { name, description } = req.body; 

  try {
    console.log(`Tentative de création du projet : ${name}`);
    
    const result = await pool.query(
      'INSERT INTO workspace (name, description) VALUES ($1, $2) RETURNING *;',
      [name, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de la création du projet :", err.message);
    res.status(500).send("Erreur serveur lors de la création");
  }
});

app.post('/api/workspace/:id/tache', async (req, res) => {
  const workspaceId = req.params.id;
  const { title, description, status, priority } = req.body;

  try {
    console.log(`Ajout d'une tâche pour le workspace ID : ${workspaceId}`);
    
  
    const result = await pool.query(
      'INSERT INTO tache (id_workspace, title, description, status, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [workspaceId, title, description, status || 'To Do', priority || 'Medium']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de l'ajout de la tâche :", err.message);
    res.status(500).send("Erreur serveur lors de l'ajout de la tâche");
  }
});

app.post('/api/workspace/:id/bug', async (req, res) => {
  const workspaceId = req.params.id;
  const { title, description, status, severity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO bug (id_workspace, title, description, status, severity) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [workspaceId, title, description, status || 'Open', severity || 'Medium']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur ajout bug :", err.message);
    res.status(500).send("Erreur serveur");
  }
});

app.post('/api/workspace/:id/asset', async (req, res) => {
  const workspaceId = req.params.id;
  const { name, type, url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO asset (id_workspace, name, type, url) VALUES ($1, $2, $3, $4) RETURNING *;',
      [workspaceId, name, type, url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur ajout asset :", err.message);
    res.status(500).send("Erreur serveur");
  }
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Le serveur IndieForge tourne sur http://localhost:${PORT}`);
  console.log(`En attente de connexions... Ne fermez pas ce terminal.`);
  console.log(`==================================================`);
});