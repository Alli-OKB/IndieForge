const express = require('express');
const cors = require('cors');
const pool = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/workspaces', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workspace ORDER BY id DESC;'); 
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur de connexion à la base de données");
  }
});

app.get('/api/workspaces/:id/dashboard', async (req, res) => {
  const workspaceId = req.params.id;
  try {
    const tachePromise = pool.query(
      `SELECT t.*, u.nom as responsable_nom 
       FROM tache t 
       LEFT JOIN "user" u ON t.id_user = u.id 
       WHERE t.id_workspace = $1`, 
      [workspaceId]
    );

    const bugPromise = pool.query(
      `SELECT b.*, u.nom as responsable_nom 
       FROM bug b 
       LEFT JOIN "user" u ON b.id_user = u.id 
       WHERE b.id_workspace = $1`, 
      [workspaceId]
    );

    const assetPromise = pool.query(
      `SELECT a.*, u.nom as responsable_nom 
       FROM asset a 
       LEFT JOIN "user" u ON a.id_user = u.id 
       WHERE a.id_workspace = $1`, 
      [workspaceId]
    );

    const [tacheRes, bugRes, assetRes] = await Promise.all([tachePromise, bugPromise, assetPromise]);

    res.json({
      backlog: tacheRes.rows,
      bugs: bugRes.rows,
      assets: assetRes.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur lors de la récupération des modules");
  }
});

app.listen(PORT, () => {
  console.log(`Serveur IndieForge connecté sur le port ${PORT}`);
});