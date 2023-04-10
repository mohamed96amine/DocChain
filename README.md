# Projet de Diagnostics Immobiliers sur Blockchain

## Présentation

Ce projet vise à résoudre les problèmes de transparence, d'exactitude et de falsification des diagnostics immobiliers en utilisant la technologie blockchain. Il permet également de gérer les documents immobiliers en général.

## Démo

lien : https://www.youtube.com/watch?v=d3HO6NFzQHk

## Table des matières

- [Installation](#installation)
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Déploiement](#déploiement)
- [Améliorations futures](#améliorations-futures)
- [License](#license)

## Installation

Clonez ce dépôt, puis installez les dépendances :

```bash
git clone https://github.com/votre-username/projet-diagnostics-immobiliers-blockchain.git
cd projet-diagnostics-immobiliers-blockchain
npm install
```

## Fonctionnalités

- Gestion des diagnostics immobiliers
- Transparence et sécurité des données grâce à la blockchain
- Gestion des documents immobiliers en général

## Technologies utilisées

- Solidity
- Truffle
- React
- Material-UI
- Firestore (pour le stockage hors chaîne)
- IPFS
- MochaJS
- Chai
- Leaflet
- Axios
- API Adresse Gouv

## Déploiement

1. Compilez et migrez les contrats intelligents :

```bash
truffle compile
truffle migrate --reset --network <réseau-cible>
```


2. Lancez le serveur de développement React :

```bash
cd client
npm start
```

3. Ouvrez votre navigateur et accédez à http://localhost:3000.


## Améliorations futures
- Améliorer la conception des contrats intelligents
- Étendre la portée de l'application pour gérer d'autres types de documents immobiliers

## Licence
Ce projet est sous licence MIT.