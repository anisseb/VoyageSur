import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PrivacyScreenProps {
  navigation: any;
}

export default function PrivacyScreen({ navigation }: PrivacyScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header avec gradient */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confidentialité</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>Politique de Confidentialité</Text>
          <Text style={styles.lastUpdated}>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>1. Collecte des Données</Text>
          <Text style={styles.text}>
            Voyage Sûr collecte uniquement les informations nécessaires au bon fonctionnement de l'application :
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Informations de profil (nom, prénom, âge, email)</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Données de voyage (destinations, dates, type de voyage)</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>2. Utilisation des Données</Text>
          <Text style={styles.text}>
            Vos données sont utilisées exclusivement pour :
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Personnaliser vos recommandations de santé</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Gérer vos voyages et checklists</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Vous contacter en cas d'urgence</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Améliorer nos services</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Informations médicales (vaccins, médicaments, contacts d'urgence)</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>3. Protection des Données</Text>
          <Text style={styles.text}>
            Nous mettons en place des mesures de sécurité strictes :
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Chiffrement des données en transit et au repos</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Authentification sécurisée</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Accès limité aux données personnelles</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Sauvegardes sécurisées</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>4. Partage des Données</Text>
          <Text style={styles.text}>
            Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers, sauf :
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Avec votre consentement explicite</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>En cas d'urgence médicale</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Si requis par la loi</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>5. Vos Droits</Text>
          <Text style={styles.text}>
            Conformément au RGPD, vous avez le droit de :
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Accéder à vos données personnelles</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Rectifier vos informations</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Supprimer votre compte</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Exporter vos données</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Retirer votre consentement</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>6. Contact</Text>
          <Text style={styles.text}>
            Pour toute question concernant cette politique de confidentialité, contactez-nous :
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>Email : contact@voyage-sur.fr</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <Text style={styles.infoText}>
              Cette politique peut être mise à jour. Nous vous informerons de tout changement important.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    fontWeight: 'bold',
  },
  bulletText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
    flex: 1,
  },
  contactInfo: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  contactText: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 4,
  },
  infoCard: {
    backgroundColor: colors.info + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
}); 