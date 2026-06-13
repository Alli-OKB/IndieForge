DROP TABLE IF EXISTS asset CASCADE;
DROP TABLE IF EXISTS bug CASCADE;
DROP TABLE IF EXISTS tache CASCADE;
DROP TABLE IF EXISTS workspace CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

CREATE TABLE workspace (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE tache (
    id SERIAL PRIMARY KEY,
    id_workspace INT REFERENCES workspace(id) ON DELETE CASCADE,
    id_user INT REFERENCES "user"(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    status_tache VARCHAR(50) DEFAULT 'À faire'
);

CREATE TABLE bug (
    id SERIAL PRIMARY KEY,
    id_workspace INT REFERENCES workspace(id) ON DELETE CASCADE,
    id_user INT REFERENCES "user"(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    statut_bug VARCHAR(50) DEFAULT 'À faire'
);

CREATE TABLE asset (
    id SERIAL PRIMARY KEY,
    id_workspace INT REFERENCES workspace(id) ON DELETE CASCADE,
    id_user INT REFERENCES "user"(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    statut_asset VARCHAR(50) DEFAULT 'À faire'
);

INSERT INTO "user" (nom) VALUES 
('Alex (Gameplay Prog)'),
('Chloé (Lead UI/UX)'),
('Max (Sound Designer)'),
('Thomas (3D Artist)');

INSERT INTO workspace (name, description) VALUES 
('Project: CyberRogue', 'Un rogue-lite cyberpunk en vue top-down avec génération procédurale.'),
('Project: CozyMeadow', 'Un jeu de simulation de ferme relaxant en pixel-art.');

INSERT INTO tache (id_workspace, id_user, title, status_tache) VALUES 
(1, 1, 'Implémenter le dash du joueur avec frames d''invulnérabilité', 'En cours'),
(1, 2, 'Créer la maquette de l''arbre de compétences (UI)', 'À faire'),
(1, 1, 'Génération procédurale des salles du premier biome', 'Terminé'),
(2, 4, 'Dessiner les sprites d''animation de marche du personnage principal', 'En cours'),
(2, 2, 'Créer le système d''inventaire à cases (Drag & Drop)', 'À faire'),
(2, 3, 'Mettre en place le gestionnaire d''ambiance musicale dynamique', 'Terminé');

INSERT INTO bug (id_workspace, id_user, title, statut_bug) VALUES 
(1, 1, 'CRITIQUE : Le joueur traverse le sol lors d''une collision avec le boss', 'Critique'),
(1, 2, 'Le menu Pause ne bloque pas les inputs du jeu en arrière-plan', 'En cours'),
(1, NULL, 'Fuite de mémoire suspecte lors du changement de niveau', 'À faire'),
(1, 1, 'Bug d''affichage du HUD sur les résolutions 21:9', 'Résolu'),
(2, 3, 'Le son de cueillette de légume se joue en boucle infinie', 'Critique'),
(2, 4, 'Clipping visuel sur les tuiles d''eau du biome de la rivière', 'En cours');

INSERT INTO asset (id_workspace, id_user, name, statut_asset) VALUES 
(1, 4, 'Modèle 3D du Boss de fin (.fbx)', 'En création'),
(1, 3, 'Effet sonore de tir de pistolet laser (.wav)', 'Intégré'),
(1, 4, 'Texture de néon émissif pour les murs de la ville', 'À faire'),
(2, 4, 'Feuille de sprites des légumes (Carotte, Navet, Tomate)', 'Intégré'),
(2, 3, 'Musique relaxante pour le thème principal (.wav)', 'En création'),
(2, NULL, 'Bruitage d''ambiance du vent et des oiseaux (.mp3)', 'À faire');