import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './theme/colors';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Services
import { cleanupService } from './services/cleanupService';
import { weatherService } from './services/weatherService';
import { recommendationService } from './services/recommendationService';

// Écrans d'authentification
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoadingScreen from './screens/LoadingScreen';

// Écrans principaux
import HomeScreen from './screens/HomeScreen';
import NewTripScreen from './screens/NewTripScreen';
import TripDetailsScreen from './screens/TripDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChecklistScreen from './screens/ChecklistScreen';
import VaccinesScreen from './screens/VaccinesScreen';
import MedicinesScreen from './screens/MedicinesScreen';
import EmergencyScreen from './screens/EmergencyScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

// Stack pour l'authentification
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Auth" component={AuthScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    </AuthStack.Navigator>
  );
}

// Stack pour les voyages
function TripStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="NewTrip" 
        component={NewTripScreen} 
        options={{ title: 'Nouveau Voyage' }}
      />
            <Stack.Screen 
        name="TripDetails" 
        component={TripDetailsScreen} 
        options={{ 
          title: 'Détails du Voyage',
          headerBackTitle: '',
          headerLeftContainerStyle: {
            paddingLeft: 10
          }
        }}
      />
      <Stack.Screen 
        name="Checklist" 
        component={ChecklistScreen} 
        options={{ title: 'Checklist' }}
      />
      <Stack.Screen 
        name="Vaccines" 
        component={VaccinesScreen} 
        options={{ title: 'Vaccins' }}
      />
      <Stack.Screen 
        name="Medicines" 
        component={MedicinesScreen} 
        options={{ title: 'Médicaments' }}
      />
      <Stack.Screen 
        name="Emergency" 
        component={EmergencyScreen} 
        options={{ title: 'Contacts d\'Urgence' }}
      />
    </Stack.Navigator>
  );
}

// Navigation principale avec tabs
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Trips') {
            iconName = focused ? 'airplane' : 'airplane-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Trips" 
        component={TripStack} 
        options={{ title: 'Mes Voyages' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

// Composant principal de navigation
function Navigation() {
  const { user, userProfile, loading } = useAuth();

  // Démarrer le service de nettoyage automatique quand l'utilisateur est connecté
  useEffect(() => {
    if (user && !loading) {
      // Nettoyer immédiatement les voyages expirés de l'utilisateur
      cleanupService.performCleanup(user.uid);
      
      // Démarrer le nettoyage automatique
      cleanupService.startAutomaticCleanup(user.uid);
    }

    // Arrêter le service quand le composant se démonte
    return () => {
      cleanupService.stopAutomaticCleanup();
    };
  }, [user, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthStackNavigator />;
  }

  // Si l'utilisateur n'a pas terminé l'onboarding
  if (userProfile && !userProfile.onboarding) {
    return <OnboardingScreen navigation={{ replace: () => {} }} route={{ params: { userId: user.uid } }} />;
  }

  // L'utilisateur est connecté et a terminé l'onboarding
  return <TabNavigator />;
}

export default function App() {
  useEffect(() => {
    // Empêcher le SplashScreen de se masquer automatiquement
    SplashScreen.preventAutoHideAsync();
    
    // Initialiser les services
    const initializeServices = async () => {
      try {
        await weatherService.cleanExpiredCache();
        await recommendationService.cleanExpiredCache();
        console.log('Services initialisés');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des services:', error);
      }
    };
    
    initializeServices();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={colors.primary} />
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}
