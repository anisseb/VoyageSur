import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AboutScreenProps {
  navigation: any;
}

export default function AboutScreen({ navigation }: AboutScreenProps) {
  const insets = useSafeAreaInsets();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Erreur lors de l\'ouverture du lien:', err));
  };

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
          <Text style={styles.headerTitle}>À propos</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Section Logo et Version */}
        <View style={styles.section}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="airplane" size={48} color={colors.primary} />
            </View>
            <Text style={styles.appName}>Voyage Sûr</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
            <Text style={styles.tagline}>Votre compagnon de voyage santé</Text>
          </View>
        </View>

        {/* Section Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre Mission</Text>
          <Text style={styles.description}>
            Voyage Sûr est une application innovante conçue pour assurer votre sécurité et votre bien-être lors de vos voyages. 
            Nous combinons technologie moderne et expertise médicale pour vous offrir une expérience de voyage sans stress.
          </Text>
        </View>

        {/* Section Fonctionnalités */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fonctionnalités Principales</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="medical" size={24} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Recommandations de Santé</Text>
              <Text style={styles.featureText}>
                Conseils personnalisés basés sur votre destination et votre profil médical
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Checklists Intelligentes</Text>
              <Text style={styles.featureText}>
                Listes de contrôle adaptées à chaque type de voyage
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="call" size={24} color={colors.emergency} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Contacts d'Urgence</Text>
              <Text style={styles.featureText}>
                Accès rapide aux services d'urgence locaux
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="notifications" size={24} color={colors.warning} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Alertes Personnalisées</Text>
              <Text style={styles.featureText}>
                Notifications pour vos vaccins et médicaments
              </Text>
            </View>
          </View>
        </View>

        {/* Section Équipe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre Équipe</Text>
          <Text style={styles.teamDescription}>
            Voyage Sûr est développé par une équipe passionnée de professionnels de la santé et de la technologie.
          </Text>
          
          <View style={styles.teamCard}>
            <View style={styles.teamMember}>
              <View style={styles.memberAvatar}>
                <Ionicons name="person" size={32} color={colors.primary} />
              </View>
              <Text style={styles.memberName}>Dr. Ammari Saphia</Text>
              <Text style={styles.memberRole}>CEO /Médecin généraliste</Text>
            </View>
            
            <View style={styles.teamMember}>
              <View style={styles.memberAvatar}>
                <Ionicons name="person" size={32} color={colors.secondary} />
              </View>
              <Text style={styles.memberName}>Anisse Bader</Text>
              <Text style={styles.memberRole}>CEO / Développeur mobile</Text>
            </View>
          </View>
        </View>

        {/* Section Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contactez-nous</Text>
          
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => openLink('mailto:contact@voyage-sur.fr')}
          >
            <Ionicons name="mail" size={24} color={colors.primary} />
            <Text style={styles.contactText}>contact@voyagessur.fr</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => openLink('https://voyage-sur.fr')}
          >
            <Ionicons name="globe" size={24} color={colors.primary} />
            <Text style={styles.contactText}>www.voyage-sur.fr</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Section Réseaux sociaux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suivez-nous</Text>
          <View style={styles.socialGrid}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://www.facebook.com/profile.php?id=61578110593354')}
            >
              <Ionicons name="logo-facebook" size={24} color={colors.white} />
            </TouchableOpacity>
                        
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://www.instagram.com/voyage.sur/')}
            >
              <Ionicons name="logo-instagram" size={24} color={colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://www.linkedin.com/company/voyage-sur')}
            >
              <Ionicons name="logo-linkedin" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Informations légales */}
        <View style={styles.section}>
          <View style={styles.legalCard}>
            <Text style={styles.legalTitle}>Informations Légales</Text>
            <Text style={styles.legalText}>
              © 2025 Voyage Sûr. Tous droits réservés.{'\n'}
              Développé avec ❤️ en France, à Marseille.
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: colors.primary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  teamDescription: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  teamCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teamMember: {
    alignItems: 'center',
    marginBottom: 20,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
    marginLeft: 12,
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  legalCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  legalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  legalText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 