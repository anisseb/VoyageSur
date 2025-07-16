# Voyage Sur - Check Santé de Voyage

Une application mobile React Native/Expo qui vous aide à préparer votre santé avant un voyage en vous donnant toutes les informations nécessaires : vaccins recommandés, médicaments utiles, contacts d'urgence, et plus encore.

## 🎯 Fonctionnalités

### ✅ Fonctionnalités Principales
- **Authentification complète** avec Google Sign-In, Apple Sign-In et email/mot de passe
- **Onboarding personnalisé** avec collecte des informations utilisateur (prénom, nom, âge, sexe)
- **Création de plans de voyage** avec destination, durée et type de séjour
- **Recommandations de vaccins** basées sur les données OMS
- **Gestion des symptômes et traitements** avec médicaments recommandés
- **Contacts d'urgence** locaux et ambassade de France
- **Checklist de préparation** style "checklist d'avion"
- **Interface moderne** avec codes couleur (vert OK, orange warning, rouge danger)
- **Pages d'information** : Confidentialité, À propos, Aide & Support
- **Formulaire de contact** intégré avec sauvegarde Firestore
- **Système de suppression de données** pour la conformité RGPD

### 💰 Modèle Freemium avec RevenueCat
- **Gratuit** : 1 voyage complet avec toutes les fonctionnalités de base
- **Voyage à l'unité** : 2,99€ pour un voyage supplémentaire
- **Premium Mensuel** : 4,99€/mois pour voyages illimités + fonctionnalités avancées
- **Premium Annuel** : 29,99€/an (économisez 40%) pour voyages illimités + fonctionnalités avancées

**Fonctionnalités Premium :**
- Voyages illimités
- Fiches de premiers secours
- Météo et conseils locaux
- Recommandations IA personnalisées
- Notifications avancées

## 🚀 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI
- Un compte Firebase
- Compte développeur Apple (pour iOS)
- Compte développeur Google (pour Android)

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

3. **Configurer les variables d'environnement**
   - Créez un fichier `.env` à la racine du projet
   - Ajoutez vos clés de configuration :
```env
# Google Sign-In
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id

# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=your_revenuecat_ios_api_key
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=your_revenuecat_android_api_key
```

4. **Configurer Firebase**
   - Créez un projet Firebase
   - Activez Firestore Database
   - Activez Authentication (Google, Apple, Email/Password)
   - Copiez vos clés de configuration dans `config/firebase.ts`

5. **Configurer Google Sign-In**
   - Configurez les URL schemes dans `app.config.ts`
   - Ajoutez les certificats SHA-1 pour Android
   - Configurez les Client IDs dans les fichiers de configuration

6. **Configurer RevenueCat (optionnel pour le développement)**
   - Suivez le guide `REVENUECAT_SETUP.md` pour configurer les achats intégrés
   - Ajoutez les clés API RevenueCat dans le fichier `.env`

7. **Lancer l'application**
```bash
npm start
```

## 🔧 Configuration Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez Firestore Database
4. Activez Authentication avec les providers suivants :
   - Google Sign-In
   - Apple Sign-In
   - Email/Password
5. Dans les paramètres du projet, récupérez la configuration
6. Remplacez les valeurs dans `config/firebase.ts` :

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
├── App.tsx                 # Point d'entrée principal avec navigation
├── config/
│   └── firebase.ts        # Configuration Firebase
├── contexts/
│   └── AuthContext.tsx    # Contexte d'authentification
├── services/
│   ├── firebaseService.ts # Services de base de données
│   ├── cleanupService.ts  # Service de nettoyage automatique
│   ├── weatherService.ts  # Service météo
│   ├── recommendationService.ts # Service de recommandations
│   └── purchaseService.ts # Service d'achats intégrés RevenueCat
├── config/
│   ├── firebase.ts        # Configuration Firebase
│   └── revenueCat.ts      # Configuration RevenueCat
├── screens/
│   ├── AuthScreen.tsx     # Écran d'authentification
│   ├── OnboardingScreen.tsx # Onboarding utilisateur
│   ├── LoadingScreen.tsx  # Écran de chargement
│   ├── HomeScreen.tsx     # Écran d'accueil
│   ├── NewTripScreen.tsx  # Création de voyage
│   ├── TripDetailsScreen.tsx # Détails du voyage
│   ├── ChecklistScreen.tsx   # Checklist de préparation
│   ├── VaccinesScreen.tsx    # Recommandations vaccins
│   ├── MedicinesScreen.tsx   # Symptômes et traitements
│   ├── EmergencyScreen.tsx   # Contacts d'urgence
│   ├── ProfileScreen.tsx     # Profil utilisateur
│   ├── PrivacyScreen.tsx     # Politique de confidentialité
│   ├── AboutScreen.tsx       # Page À propos
│   ├── HelpSupportScreen.tsx # Aide et support
│   ├── ContactFormScreen.tsx # Formulaire de contact
│   └── SubscriptionScreen.tsx # Écran d'abonnements et achats
├── components/
│   └── ResetPassword.tsx  # Composant de réinitialisation de mot de passe
├── types/
│   └── index.ts           # Types TypeScript
├── theme/
│   └── colors.ts          # Système de couleurs
├── utils/
│   └── alerts.ts          # Utilitaires pour les alertes
├── firestore.rules        # Règles de sécurité Firestore
├── REVENUECAT_SETUP.md    # Guide de configuration RevenueCat
└── .env                   # Variables d'environnement (non commité)
```

## 🎨 Design System

### Couleurs
- **Vert (#4CAF50)** : OK, succès
- **Orange (#FF9800)** : Warning, attention
- **Rouge (#F44336)** : Danger, urgent
- **Bleu (#2196F3)** : Info, médical
- **Violet (#9C27B0)** : Premium, spécial

### Icônes
- Icônes claires façon "trousse de secours"
- Utilisation d'Ionicons pour la cohérence
- Gradients pour les éléments premium

## 🔄 Fonctionnalités Implémentées

### ✅ Phase 1 (Complétée)
- ✅ Interface utilisateur complète avec design moderne
- ✅ Navigation entre écrans avec React Navigation
- ✅ Intégration Firebase complète
- ✅ Système de couleurs et thème cohérent
- ✅ Authentification Google Sign-In et Apple Sign-In
- ✅ Onboarding utilisateur personnalisé
- ✅ Contexte d'authentification global
- ✅ Gestion des voyages (création, modification, suppression)
- ✅ Système de rafraîchissement automatique
- ✅ Pages d'information (Confidentialité, À propos)
- ✅ Système d'aide et support avec FAQ
- ✅ Formulaire de contact avec sauvegarde Firestore
- ✅ Système de suppression de données utilisateur
- ✅ Gestion des dates multi-plateforme (iOS/Android)
- ✅ Sécurisation des variables d'environnement

### ✅ Phase 2 (Complétée)
- ✅ Synchronisation des données en temps réel
- ✅ Système de nettoyage automatique des données
- ✅ Gestion des erreurs et validation
- ✅ Interface responsive et accessible
- ✅ Intégration RevenueCat pour les achats intégrés
- ✅ Système d'abonnements et achats à l'unité
- ✅ Écran d'abonnements avec offres premium
- ✅ Message de voyage gratuit sur la page d'accueil

### 🔄 Phase 3 (Planifiée)
- [ ] API OMS pour données vaccins
- [ ] Géolocalisation pour contacts locaux
- [ ] Mode hors ligne complet
- [ ] Partage de plans de voyage
- [ ] Notifications push avancées
- [ ] Analytics et métriques d'utilisation

## 📊 Base de Données Firestore

### Collections principales
- **users** : Profils utilisateurs avec onboarding
- **travelPlans** : Plans de voyage des utilisateurs
- **countries** : Données des pays
- **cities** : Données des villes
- **contact-us-app** : Messages de support utilisateur

### Structure des données
```typescript
// User
{
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  onboarding: boolean;
  emergencyContact?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// TravelPlan
{
  id: string;
  userId: string;
  destination: string;
  country: string;
  city?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  duration: number;
  travelType: string;
  travelers: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 📈 Stratégie de Monétisation

### Gratuit
- 1 pays/semaine
- Fonctionnalités de base
- Support communautaire

### Premium (2,99€/mois)
- Voyages illimités
- Sauvegarde de profils famille
- Notifications avancées
- Export PDF des plans
- Support prioritaire
- Fonctionnalités exclusives

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

## 🔒 Sécurité

- Variables d'environnement sécurisées
- Authentification Firebase sécurisée
- Règles Firestore strictes
- Conformité RGPD avec suppression de données
- Chiffrement des données sensibles

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
- Email : contact@voyage-sur.fr
- Site web : www.voyage-sur.fr
- Issues GitHub : [Créer une issue](https://github.com/anisseb/VoyageSur/issues)

## 👥 Équipe

- **Dr. Ammari Saphia** - CEO / Médecin généraliste
- **Anisse Bader** - CEO / Développeur mobile

## 🙏 Remerciements

- Données OMS pour les recommandations vaccinales
- Communauté React Native/Expo
- Firebase pour l'infrastructure backend
- Tous les contributeurs du projet

---

**Voyage Sur** - Votre compagnon santé pour des voyages en toute sérénité ! ✈️🏥 