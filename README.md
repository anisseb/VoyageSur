# Voyage Sur - Check Santé de Voyage

Une application mobile React Native/Expo qui vous aide à préparer votre santé avant un voyage en vous donnant toutes les informations nécessaires : vaccins recommandés, médicaments utiles, contacts d'urgence, et plus encore.

## 🎯 Fonctionnalités

### ✅ Fonctionnalités Principales
- **Authentification complète** avec email/mot de passe et onboarding
- **Création de plans de voyage** avec destination, durée et type de séjour
- **Recommandations de vaccins** basées sur les données OMS
- **Trousse à pharmacie idéale** avec médicaments recommandés
- **Contacts d'urgence** locaux et ambassade de France
- **Checklist de préparation** style "checklist d'avion"
- **Alertes épidémiques** en temps réel
- **Interface moderne** avec codes couleur (vert OK, orange warning, rouge danger)

### 💰 Modèle Freemium
- **Gratuit** : 1 pays/semaine
- **Premium (2,99€/mois)** : Voyages illimités + profils famille + notifications avancées

## 🚀 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI
- Un compte Firebase

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd VoyageSur
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Firebase**
   - Créez un projet Firebase
   - Activez Firestore Database
   - Copiez vos clés de configuration dans `config/firebase.ts`

4. **Lancer l'application**
```bash
npm start
```

## 🔧 Configuration Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez Firestore Database
4. Dans les paramètres du projet, récupérez la configuration
5. Remplacez les valeurs dans `config/firebase.ts` :

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "voyage-sur.firebaseapp.com",
  projectId: "voyage-sur",
  storageBucket: "voyage-sur.appspot.com",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

## 📱 Structure de l'Application

```
VoyageSur/
├── App.tsx                 # Point d'entrée principal
├── config/
│   └── firebase.ts        # Configuration Firebase
├── contexts/
│   └── AuthContext.tsx    # Contexte d'authentification
├── services/
│   └── firebaseService.ts # Services de base de données
├── screens/
│   ├── AuthScreen.tsx     # Écran d'authentification
│   ├── OnboardingScreen.tsx # Onboarding utilisateur
│   ├── LoadingScreen.tsx  # Écran de chargement
│   ├── HomeScreen.tsx     # Écran d'accueil
│   ├── NewTripScreen.tsx  # Création de voyage
│   ├── TripDetailsScreen.tsx # Détails du voyage
│   ├── ChecklistScreen.tsx   # Checklist de préparation
│   ├── VaccinesScreen.tsx    # Recommandations vaccins
│   ├── MedicinesScreen.tsx   # Trousse à pharmacie
│   ├── EmergencyScreen.tsx   # Contacts d'urgence
│   └── ProfileScreen.tsx     # Profil utilisateur
├── types/
│   └── index.ts           # Types TypeScript
├── theme/
│   └── colors.ts          # Système de couleurs
└── firestore.rules        # Règles de sécurité Firestore
```

## 🎨 Design System

### Couleurs
- **Vert (#4CAF50)** : OK, succès
- **Orange (#FF9800)** : Warning, attention
- **Rouge (#F44336)** : Danger, urgent
- **Bleu (#2196F3)** : Info, médical

### Icônes
- Icônes claires façon "trousse de secours"
- Utilisation d'Ionicons pour la cohérence

## 📊 Base de Données

### Collections Firestore
- `travelPlans` : Plans de voyage des utilisateurs
- `vaccines` : Base de données des vaccins par pays
- `medicines` : Médicaments recommandés
- `emergencyContacts` : Contacts d'urgence par pays
- `epidemicAlerts` : Alertes épidémiques
- `users` : Profils utilisateurs
- `travelProfiles` : Profils de voyageurs

## 🔄 Fonctionnalités à Implémenter

### Phase 1 (Actuelle)
- ✅ Interface utilisateur complète
- ✅ Navigation entre écrans
- ✅ Intégration Firebase
- ✅ Système de couleurs
- ✅ Authentification complète
- ✅ Onboarding utilisateur
- ✅ Contexte d'authentification

### Phase 2 (Prochaine)
- [ ] Synchronisation des données en temps réel
- [ ] Notifications push
- [ ] Système de paiement premium
- [ ] Validation des données côté serveur

### Phase 3 (Future)
- [ ] API OMS pour données vaccins
- [ ] Géolocalisation pour contacts locaux
- [ ] Mode hors ligne
- [ ] Partage de plans de voyage

## 📈 Stratégie de Monétisation

### Gratuit
- 1 pays/semaine
- Fonctionnalités de base
- Publicités non-intrusives

### Premium (2,99€/mois)
- Voyages illimités
- Sauvegarde de profils famille
- Notifications avancées
- Export PDF des plans
- Support prioritaire

## 🚀 Déploiement

### App Store / Play Store
1. Configurez votre compte développeur
2. Générez les certificats de signature
3. Utilisez EAS Build pour créer les builds
4. Soumettez à Apple/Google

### Commandes utiles
```bash
# Build pour iOS
eas build --platform ios

# Build pour Android
eas build --platform android

# Soumettre à l'App Store
eas submit --platform ios

# Soumettre au Play Store
eas submit --platform android
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Email : support@voyagesur.app
- Issues GitHub : [Créer une issue](https://github.com/votre-repo/issues)

## 🙏 Remerciements

- Données OMS pour les recommandations vaccinales
- Communauté React Native/Expo
- Tous les contributeurs du projet

---

**Voyage Sur** - Votre compagnon santé pour des voyages en toute sérénité ! ✈️🏥 