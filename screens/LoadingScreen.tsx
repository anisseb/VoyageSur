import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';

export default function LoadingScreen() {
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    console.log('LoadingScreen: État actuel -', {
      user: user ? `Connecté: ${user.uid}` : 'Non connecté',
      userProfile: userProfile ? `Profil chargé: ${userProfile.firstName}` : 'Aucun profil',
      loading
    });

    // Gérer le SplashScreen
    const handleSplashScreen = async () => {
      try {
        // Garder le SplashScreen visible pendant le chargement
        await SplashScreen.preventAutoHideAsync();
        
        // Si le chargement est terminé, masquer le SplashScreen
        if (!loading) {
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.warn('Erreur lors de la gestion du SplashScreen:', error);
      }
    };

    handleSplashScreen();

    // Nettoyer le SplashScreen quand le composant se démonte
    return () => {
      SplashScreen.hideAsync().catch(error => {
        console.warn('Erreur lors du masquage du SplashScreen:', error);
      });
    };
  }, [user, userProfile, loading]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Voyage Sûr</Text>
          <Text style={styles.subtitle}>Chargement...</Text>
          <ActivityIndicator 
            size="large" 
            color={colors.white} 
            style={styles.spinner}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 30,
  },
  spinner: {
    marginTop: 20,
  },
}); 