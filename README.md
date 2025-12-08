# Système de Gestion des Absences

Application complète de gestion des absences avec authentification, dashboard et système de justifications pour étudiants et enseignants.

## 📋 Structure du Projet

```
absence-management-node-22/
├── Backend/          # API Node.js/Express/TypeScript
├── Frontend/         # Application React/Vite
└── docker-compose.yml
```

## 🚀 Prérequis

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **Docker** et **Docker Compose** (pour le backend)
- **MongoDB** (via Docker ou MongoDB Atlas)

## 🏃 Lancement de l'Application

### Option 1 : Lancement avec Docker (Recommandé pour le Backend)

#### 1. Démarrer le Backend et MongoDB

À la racine du projet, exécutez :

```bash
docker-compose up --build
```

Cette commande va :
- Construire l'image Docker du backend
- Lancer le conteneur MongoDB (port 27017)
- Lancer le conteneur Backend (port 3000)

**Backend API** : `http://localhost:3000`

#### 2. Lancer le Frontend

Dans un **nouveau terminal**, naviguez vers le dossier Frontend :

```bash
cd Frontend
npm install
npm run dev
```

**Frontend** : `http://localhost:5173` (ou le port affiché dans le terminal)

---

### Option 2 : Lancement sans Docker
### 🔑 Configuration de l'environnement (`.env`)

1. **Créer un fichier `.env` dans le dossier `Backend/`**  
   À la racine du dossier `Backend`, créez un fichier nommé `.env` contenant au minimum :
   ```
   PORT=3000
   MONGO_URI=VOTRE_URI_MONGODB_ATLAS
   ```
   > Remplacez `VOTRE_URI_MONGODB_ATLAS` par votre propre URI fourni par MongoDB Atlas.

2. **Créer un cluster sur MongoDB Atlas**  
   Si vous n'avez pas encore d'URI, créez un cluster gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) puis copiez votre URI de connexion pour l'utiliser dans le `.env`.

3. **Adapter si besoin le code et la configuration docker :**
   - Dans le fichier `Backend/src/config/db.ts`, remplacez la valeur de `MONGO_URI` par votre propre URI si elle est codée en dur.
   - Si vous utilisez Docker, changez la variable d'environnement `MONGO_URI` directement dans `docker-compose.yml` pour pointer vers votre URI personnel Atlas au lieu de MongoDB local.

---

#### 1. Lancer le Backend

```bash
cd Backend
npm install
npm run dev
```

Le backend sera accessible sur `http://localhost:3000`

**Note** : Assurez-vous que MongoDB est en cours d'exécution et que la variable d'environnement `MONGO_URI` est configurée.

#### 2. Lancer le Frontend

Dans un **nouveau terminal** :

```bash
cd Frontend
npm install
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

---

## 📱 Utilisation

### ⚠️ Configuration Initiale (Important)

**Avant de créer des comptes utilisateurs, vous devez d'abord créer des classes et des modules via Postman ou un autre outil API.**

#### 1. Créer des Classes

Utilisez Postman pour créer des classes via l'API :

```http
POST http://localhost:3000/api/classes
Content-Type: application/json

{
  "nom_classe": "L3 Info",
  "niveau": "Licence 3",
  "departement": "Informatique",
  "filiere": "Informatique"
}
```

#### 2. Créer des Modules

Créez des modules via l'API :

```http
POST http://localhost:3000/api/modules
Content-Type: application/json

{
  "nom_module": "Base de données",
  "coefficient": 3
}
```

**Pourquoi ?** 
- Les étudiants doivent être assignés à une classe lors de l'inscription
- Les séances nécessitent un module pour être créées
- Les enseignants peuvent être assignés à des classes (optionnel)

---

### Utilisation de l'Application

1. **Créer un compte** : Accédez à `/signup` pour créer un compte étudiant ou enseignant
2. **Se connecter** : Utilisez `/` (page de login) pour vous connecter
3. **Dashboard** : Après connexion, vous serez redirigé vers le dashboard

### Pour les Étudiants :
- Voir leurs propres absences
- Justifier leurs absences
- Consulter l'état de leurs justifications

### Pour les Enseignants :
- Gérer les absences de leurs classes
- Valider/refuser les justifications
- Voir les statistiques des absences

---

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** avec **Express**
- **TypeScript**
- **MongoDB** avec **Mongoose**
- **Docker**

### Frontend
- **React 19**
- **Vite**
- **React Router**
- **CSS3**

---

## 📚 API Endpoints

Toutes les routes sont préfixées par `/api`.

### Authentification
- `POST /api/etudiants/login` - Connexion étudiant
- `POST /api/enseignants/login` - Connexion enseignant

### Classes
- `GET /api/classes` - Liste des classes
- `POST /api/classes` - Créer une classe

### Modules
- `GET /api/modules` - Liste des modules
- `POST /api/modules` - Créer un module

### Étudiants
- `GET /api/etudiants` - Liste des étudiants
- `POST /api/etudiants` - Créer un étudiant
- `GET /api/etudiants/:id` - Détails d'un étudiant

### Enseignants
- `GET /api/enseignants` - Liste des enseignants
- `POST /api/enseignants` - Créer un enseignant

### Séances
- `GET /api/seances` - Liste des séances
- `POST /api/seances` - Créer une séance

### Absences
- `GET /api/absences` - Liste des absences
- `GET /api/absences?etudiant=ID` - Absences d'un étudiant spécifique
- `POST /api/absences` - Créer une absence
- `PUT /api/absences/:id` - Mettre à jour une absence

### Justifications
- `GET /api/justifications` - Liste des justifications
- `POST /api/justifications` - Créer une justification
- `PUT /api/justifications/:id` - Mettre à jour une justification (valider/refuser)

---

## 🐳 Arrêter l'Application

Pour arrêter les conteneurs Docker :

```bash
docker-compose down
```

---

## 📝 Notes

- Le frontend utilise un proxy Vite pour rediriger les requêtes `/api` vers `http://localhost:3000`
- Les étudiants ne voient que leurs propres absences (filtrage côté backend)
- Les enseignants voient les absences de leurs classes assignées
- Les justifications ne peuvent être créées que pour les absences (statut: 'absent')

---

## 🔧 Configuration

### Variables d'environnement Backend

Le backend utilise les variables suivantes (définies dans `docker-compose.yml`) :
- `PORT=3000`
- `MONGO_URI` - URI de connexion MongoDB

---


## 📄 Licence

ISC
