# RESTAPI

## Documentation de l’API Restaurant

### Introduction

Ce projet est une API REST permettant de gérer des items, des catégories et des formules pour un restaurant. L’API est construite avec Node.js, Express, et MySQL. Elle inclut un contrôle d’accès basé sur les rôles et utilise l’authentification basique pour certaines opérations. Elle permet aussi de filtrer les requêtes GET et de réaliser des opérations CRUD (Création, Lecture, Mise à jour, Suppression), certaines étant réservées aux administrateurs.

### Prérequis

1.	Docker : La base de données et phpMyAdmin sont configurés via Docker. Assurez-vous que Docker est installé sur votre machine. Vous pouvez télécharger Docker [ici](https://www.docker.com/products/docker-desktop/)
2.	Node.js : L’API est construite avec Node.js. Installez Node.js depuis [ici](https://nodejs.org/en).
3.	Postman : Pour tester l’API, vous pouvez utiliser Postman. Toutes les routes sont déjà configurées.

### Installation et Configuration

Étape 1 : Installer les dépendances Node.js

Exécutez la commande suivante pour installer toutes les dépendances nécessaires :

npm init -y

npm install express

npm install mysql2

Étape 2 : Configuration de MySQL et phpMyAdmin avec Docker

Pour configurer la base de données MySQL et phpMyAdmin, nous allons utiliser Docker.

1.	Télécharger le fichier docker-compose.yml dans le répertoire racine.

2.	Lancez Docker pour démarrer MySQL et phpMyAdmin :

docker-compose up -d


3.	Vous pouvez accéder à phpMyAdmin via http://localhost:6060 et vous connecter avec :
•	Nom d’utilisateur : root
•	Mot de passe : teo
La base de données restaurantapi est déjà créée. Vous pouvez gérer vos tables et données via l’interface phpMyAdmin.

Étape3 : Démarrer le Serveur API

Une fois la base de données opérationnelle, démarrez le serveur API :

node index.js

L’API sera accessible sur http://localhost:3000.

## Authentification

L’API utilise une Authentification Basique pour certaines routes protégées par les droits d’administrateur.

Deux comptes utilisateurs sont déjà configurés :

•	Admin :
•	Nom d’utilisateur : admin
•	Mot de passe : admin1234
•	Rôle : admin
    
•	Client :
•	Nom d’utilisateur : client
•	Mot de passe : client1234
•	Rôle : client

Vous devez utiliser ces identifiants pour accéder aux routes réservées aux administrateurs.

## Points de Terminaison (Endpoints) de l’API

Items

•	GET /items : Récupérer tous les items, avec possibilité de filtrage par nom, prix, description et catégorie.

•	GET /items/id : Récupérer un item par son ID.

•	POST /items : Ajouter un nouvel item (Admin uniquement).

•	PUT /items/id : Mettre à jour un item existant par son ID (Admin uniquement).

•	DELETE /items/id : Supprimer un item par son ID (Admin uniquement).

Catégories

•	GET /categories : Récupérer toutes les catégories.

•	GET /categories/id : Récupérer une catégorie par son ID.

•	POST /categories : Ajouter une nouvelle catégorie (Admin uniquement).

•	PUT /categories/id : Mettre à jour une catégorie existante par son ID (Admin uniquement).

•	DELETE /categories/:id : Supprimer une catégorie par son ID (Admin uniquement).

Formules

•	GET /formulas : Récupérer toutes les formules, avec possibilité de filtrage par nom, prix et catégories.

•	GET /formulas/id : Récupérer une formule par son ID.

•	POST /formulas : Ajouter une nouvelle formule (Admin uniquement).

•	PUT /formulas/id : Mettre à jour une formule existante par son ID (Admin uniquement).

•	DELETE /formulas/id : Supprimer une formule par son ID (Admin uniquement).

Pour tester les routes sur l'application Postman, utilisez http://localhost:3000 suivi de la commande que vous souhaitez exécuter.

### Authentification dans Postman

Dans Postman, lors de l’exécution de requêtes vers des routes protégées par un rôle administrateur, utilisez les étapes suivantes pour inclure l’en-tête d’authentification :

1.	Allez dans l’onglet Authorization.
2.	Sélectionnez Basic Auth.
3.	Entrez les identifiants en fonction du rôle utilisateur que vous souhaitez tester.


