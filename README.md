# IndieForge

C'est mon projet étudiant pour faire un outil de gestion pour les petits studios de jeux vidéo indépendants. Ça permet de suivre les tâches, les bugs à corriger et l'avancement des assets (les dessins et les sons du jeu).

## Structure des dossiers

Le projet est séparé proprement en deux grands dossiers :
- Un dossier pour le frontend (HTML, CSS, JavaScript pur)
- Un dossier backend (L'API avec Express et la base de données PostgreSQL)

## Comment lancer le projet en local

1. Installer PostgreSQL sur votre machine.
2. Prendre le script qui est dans `init.sql` pour créer les tables (user, workspace, tache, bug, asset) et mettre les premières données de test.
3. Aller dans le dossier du backend avec le terminal et faire un `npm install` pour télécharger les modules (Express, cors, pg, dotenv).
4. Créer un fichier `.env` à côté du serveur avec vos propres accès à la base de données (DB_USER, DB_PASSWORD, etc.).
5. Lancer le serveur avec la commande `node serveur.js`.
6. Il suffit d'ouvrir le fichier `index.html` du frontend dans un navigateur pour tester l'application.