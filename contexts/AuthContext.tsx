import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureGoogleSignIn } from '../config/googleSignIn';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  age?: string;
  emergencyContact?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  gender?: string;
  isPremium: boolean;
  onboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  forceReconnect: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sauvegarder l'ID utilisateur dans AsyncStorage
  const saveUserIdToStorage = async (userId: string | null) => {
    try {
      if (userId) {
        await AsyncStorage.setItem('userId', userId);
        console.log('AuthContext: ID utilisateur sauvegardé dans AsyncStorage:', userId);
      } else {
        await AsyncStorage.removeItem('userId');
        console.log('AuthContext: ID utilisateur supprimé d\'AsyncStorage');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'ID utilisateur:', error);
    }
  };

  // Charger l'ID utilisateur depuis AsyncStorage
  const loadUserIdFromStorage = async (): Promise<string | null> => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        console.log('AuthContext: ID utilisateur chargé depuis AsyncStorage:', userId);
        return userId;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'ID utilisateur depuis AsyncStorage:', error);
    }
    return null;
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('AuthContext: Récupération du profil pour l\'utilisateur:', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('AuthContext: Profil trouvé:', data);
        setUserProfile({
          id: userDoc.id,
          email: data.email,
          firstName: data.firstName || '',
          lastName: data.lastName,

          age: data.age,
          emergencyContact: data.emergencyContact,
          gender: data.gender,
          isPremium: data.isPremium || false,
          onboarding: data.onboarding || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      } else {
        console.log('AuthContext: Aucun profil trouvé pour l\'utilisateur:', userId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil utilisateur:', error);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      console.error('AuthContext: Utilisateur non connecté ou profil non chargé, impossible de mettre à jour le profil.');
      return;
    }

    try {
      const userRef = doc(db, 'users', userProfile.id);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      console.log('AuthContext: Profil utilisateur mis à jour avec succès:', updates);
      await refreshUserProfile(); // Rafraîchir le profil après la mise à jour
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil utilisateur:', error);
    }
  };

  const clearSavedCredentials = async () => {
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync('userEmail');
      await SecureStore.deleteItemAsync('userPassword');
      await SecureStore.deleteItemAsync('userDisplayName');
      await SecureStore.deleteItemAsync('authMethod');
      console.log('AuthContext: Identifiants sauvegardés nettoyés');
    } catch (error) {
      console.error('Erreur lors du nettoyage des identifiants:', error);
    }
  };

  const forceReconnect = async () => {
    try {
      console.log('AuthContext: Tentative de reconnexion forcée...');
      const storedUserId = await loadUserIdFromStorage();
      if (storedUserId) {
        // Vérifier si l'utilisateur est déjà connecté
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === storedUserId) {
          console.log('AuthContext: Utilisateur déjà connecté:', currentUser.uid);
          setUser(currentUser);
          await fetchUserProfile(currentUser.uid);
        } else {
          console.log('AuthContext: Aucun utilisateur connecté, nettoyage des données');
          setUser(null);
          setUserProfile(null);
          await saveUserIdToStorage(null);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la reconnexion forcée:', error);
    }
  };

  // Fonction pour vérifier si l'utilisateur est connecté
  const checkUserConnection = async () => {
    try {
      const storedUserId = await loadUserIdFromStorage();
      if (storedUserId) {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === storedUserId) {
          console.log('AuthContext: Utilisateur vérifié comme connecté:', currentUser.uid);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de connexion:', error);
      return false;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      await saveUserIdToStorage(null);
      await clearSavedCredentials();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  useEffect(() => {
    console.log('AuthContext: Initialisation de l\'écouteur d\'état d\'authentification');
    
    // Configurer Google Sign-In de manière sécurisée
    try {
      configureGoogleSignIn();
    } catch (error) {
      console.error('Erreur lors de la configuration Google Sign-In:', error);
    }
    
    let unsubscribe: (() => void) | null = null;
    
    const initializeAuth = async () => {
      // Charger l'ID utilisateur depuis AsyncStorage pour savoir s'il y avait une session
      const storedUserId = await loadUserIdFromStorage();
      if (storedUserId) {
        console.log('AuthContext: ID utilisateur trouvé dans AsyncStorage:', storedUserId);
      }
      
      // Écouter les changements d'état d'authentification Firebase
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('AuthContext: État Firebase changé:', firebaseUser ? `Utilisateur connecté: ${firebaseUser.uid}` : 'Aucun utilisateur');
        
        if (firebaseUser) {
          // Si Firebase détecte un utilisateur, l'utiliser
          await saveUserIdToStorage(firebaseUser.uid);
          setUser(firebaseUser);
          console.log('AuthContext: Chargement du profil utilisateur...');
          await fetchUserProfile(firebaseUser.uid);
          setLoading(false);
        } else {
          // Si Firebase ne détecte pas d'utilisateur mais qu'on a un ID stocké
          if (storedUserId) {
            console.log('AuthContext: Tentative de reconnexion avec l\'ID stocké...');
            // Vérifier immédiatement si l'utilisateur est connecté
            const currentUser = auth.currentUser;
            if (currentUser && currentUser.uid === storedUserId) {
              console.log('AuthContext: Utilisateur déjà connecté:', currentUser.uid);
              setUser(currentUser);
              await fetchUserProfile(currentUser.uid);
              setLoading(false);
            } else {
              console.log('AuthContext: Aucune reconnexion automatique, nettoyage des données');
              setUser(null);
              setUserProfile(null);
              await saveUserIdToStorage(null);
              setLoading(false);
            }
          } else {
            // Si Firebase ne détecte pas d'utilisateur et qu'on n'avait pas d'ID stocké
            console.log('AuthContext: Aucun utilisateur détecté');
            setUser(null);
            setUserProfile(null);
            setLoading(false);
          }
        }
      });
    };

    initializeAuth().catch(error => {
      console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signOutUser,
    refreshUserProfile,
    forceReconnect,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 