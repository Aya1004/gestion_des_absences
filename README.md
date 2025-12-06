# Backend de Gestion des Absences

Ceci est le backend Node.js pour une application de gestion des absences, construit avec TypeScript, Express et Mongoose.

## Prérequis

- Docker et Docker Compose

## Lancement de l'Application  

L'application entière  est conteneurisée. Vous n'avez pas besoin d'installer Node.js ou MongoDB localement pour la lancer.

### 1. Démarrer l'application

Exécutez la commande suivante à la racine du projet :

```bash
docker-compose up --build
```

Cette commande va :
1. Construire l'image Docker de l'application.
2. Lancer le conteneur MongoDB (sur le port 27018).
3. Lancer le conteneur de l'application Backend (sur le port 3000).

Une fois lancée :
- **API Backend** : Accessible sur `http://localhost:5000`
- **Base de données** : Accessible sur `mongodb://localhost:27018`

### 2. Arrêter l'application

Pour arrêter et supprimer les conteneurs :

```bash
docker-compose down
```

## Documentation de l'API

Toutes les routes sont préfixées par `/api`.

### 1. Classes (`/api/classes`)
- `GET /` : Récupérer toutes les classes
- `POST /` : Créer une nouvelle classe
  - Body: `{ "nom_classe": "String", "niveau": "String", "departement": "String", "filiere": "String" }`
- `GET /:id` : Récupérer une classe par ID
- `PUT /:id` : Mettre à jour une classe
- `DELETE /:id` : Supprimer une classe

### 2. Modules (`/api/modules`)
- `GET /` : Récupérer tous les modules
- `POST /` : Créer un nouveau module
  - Body: `{ "nom_module": "String", "coefficient": Number }`
- `GET /:id` : Récupérer un module par ID
- `PUT /:id` : Mettre à jour un module
- `DELETE /:id` : Supprimer un module

### 3. Étudiants (`/api/etudiants`)
- `GET /` : Récupérer tous les étudiants (avec détails de la classe)
- `POST /` : Créer un nouvel étudiant
  - Body: `{ "nom": "String", "prenom": "String", "email": "String", "password": "String", "classe": "ObjectId" }`
- `GET /:id` : Récupérer un étudiant par ID
- `PUT /:id` : Mettre à jour un étudiant
- `DELETE /:id` : Supprimer un étudiant

### 4. Enseignants (`/api/enseignants`)
- `GET /` : Récupérer tous les enseignants (avec détails des classes)
- `POST /` : Créer un nouvel enseignant
  - Body: `{ "nom": "String", "prenom": "String", "email": "String", "password": "String", "telephone": "String", "classes": ["ObjectId"] }`
- `GET /:id` : Récupérer un enseignant par ID
- `PUT /:id` : Mettre à jour un enseignant
- `DELETE /:id` : Supprimer un enseignant

### 5. Séances (`/api/seances`)
- `GET /` : Récupérer toutes les séances (peuplées avec enseignant, module, classe)
- `POST /` : Créer une nouvelle séance
  - Body: `{ "date_seance": "Date", "heure_debut": "String", "heure_fin": "String", "enseignant": "ObjectId", "module": "ObjectId", "classe": "ObjectId" }`
- `GET /:id` : Récupérer une séance par ID
- `PUT /:id` : Mettre à jour une séance
- `DELETE /:id` : Supprimer une séance

### 6. Absences (`/api/absences`)
- `GET /` : Récupérer toutes les absences
- `POST /` : Signaler une absence
  - Body: `{ "etudiant": "ObjectId", "seance": "ObjectId", "statut": "absent" | "present", "motif": "String" (optionnel) }`
- `GET /:id` : Récupérer une absence par ID
- `PUT /:id` : Mettre à jour une absence (ex: changer le statut)
- `DELETE /:id` : Supprimer une absence

### 7. Justifications (`/api/justifications`)
- `GET /` : Récupérer toutes les justifications
- `POST /` : Soumettre une justification
  - Body: `{ "absence": "ObjectId", "fichier": "String", "commentaire": "String" }`
- `GET /:id` : Récupérer une justification par ID
- `PUT /:id` : Mettre à jour une justification (ex: valider/refuser)
  - Body: `{ "etat": "en attente" | "validé" | "refusé" }`
- `DELETE /:id` : Supprimer une justification

## Structure du Projet

- `src/config` : Configuration de la base de données
- `src/controllers` : Logique métier pour chaque entité
- `src/models` : Schémas Mongoose et interfaces TypeScript
- `src/routes` : Définition des routes Express
- `src/app.ts` : Configuration de l'application Express
- `src/server.ts` : Point d'entrée du serveur
