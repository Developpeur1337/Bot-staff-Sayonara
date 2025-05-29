# Bot Staff Sayonara

![License](https://img.shields.io/badge/license-MIT-green)

## Description

**Bot Staff Sayonara** est un bot Discord orienté gestion staff conçu pour faciliter la modération et l’administration des serveurs.
Il propose un panel complet de commandes utiles à la gestion des utilisateurs, notamment la gestion des mutes, warns, bans, et d’autres actions modératrices.

Le bot intègre aussi des commandes utilitaires pratiques comme la gestion des avatars, bannières, ainsi qu’un système de snipe pour récupérer les derniers messages supprimés.

Sa philosophie repose sur la simplicité et l’efficacité via des commandes slash intuitives pour tous les rôles modérateurs et administrateurs.

Le bot utilise exclusivement des **commandes slash** (full slash commands) pour une meilleure intégration et ergonomie.

---

## Fonctionnalités principales

- Gestion complète des sanctions :  
  - `mute`, `tempmute`, `warn`, `ban` et leurs annulations  
  - Liste des membres mute (`mutelist`)  
  - Modification des pseudos avec `nick`  
  - Nettoyage de messages (`clear`)  
- Commandes utilitaires :  
  - Affichage d’avatar (`pic`)  
  - Affichage de la bannière d’un utilisateur (`banner`)  
  - Récupération des messages supprimés ou édités (`snipe`)  
- Système de logs pour garder un historique clair des actions de modération  
- Interface 100% en commandes slash pour une meilleure intégration Discord et une prise en main rapide  
- Sauvegarde des données en local dans des fichiers JSON pour une configuration simple et transparente  


## Crédits & Contact
Développé par Developpeur1337
Pour toute question, suggestion ou aide supplémentaire, contacte moi sur Discord : @developpeur1337

---

## Installation

1. Clone ce dépôt :

```bash
git clone https://github.com/Developpeur1337/Bot-staff-Sayonara.git
cd Bot-staff-Sayonara
npm install && node index.js
