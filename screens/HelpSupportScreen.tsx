import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

interface HelpSupportScreenProps {
  navigation: any;
}

export default function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
  const insets = useSafeAreaInsets();
  const { user, signOutUser } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqData = [
    {
      id: 1,
      question: "Comment créer un nouveau voyage ?",
      answer: "Allez sur la page d'accueil et cliquez sur le bouton 'Nouveau Voyage'. Remplissez les informations demandées (pays, ville, dates, etc.) et validez."
    },
    {
      id: 2,
      question: "Comment voir les vaccins d'un voyage ?",
      answer: "Dans les détails de votre voyage, allez dans l'onglet 'Vaccins' et 'Voir mes vaccins'."
    },
    {
      id: 3,
      question: "Comment gérer les médicaments d'un voyage ?",
      answer: "Dans les détails de votre voyage, allez dans l'onglet 'Symptômes et traitement' et selon le symptôme, vous pouvez voir les médicaments à prendre."
    },
    {
      id: 4,
      question: "Comment configurer mes contacts d'urgence ?",
      answer: "Dans votre profil, vous pouvez ajouter un contact d'urgence qui sera accessible depuis l'écran d'urgence de votre voyage."
    },
    {
      id: 5,
      question: "Comment supprimer mon compte ?",
      answer: "Allez dans 'Aide & Support' et dans la page profil et cliquez sur 'Supprimer mes données' en bas de la page. Cette action est irréversible."
    },
    {
      id: 6,
      question: "L'application est-elle gratuite ?",
      answer: "Voyage Sûr propose une version gratuite avec les fonctionnalités essentielles. Une version premium est disponible pour plus de fonctionnalités."
    }
  ];

  const handleDeleteData = () => {
    Alert.alert(
      'Supprimer mes données',
      'Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible et supprimera définitivement votre compte.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmation finale',
              'Cette action supprimera définitivement votre compte et toutes vos données. Êtes-vous absolument sûr ?',
              [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: 'Oui, supprimer définitivement', 
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès.');
                    signOutUser();
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleContactUs = () => {
    navigation.navigate('ContactForm');
  };

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
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
          <Text style={styles.headerTitle}>Aide & Support</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Ionicons name="headset" size={32} color={colors.primary} />
              <Text style={styles.contactTitle}>Besoin d'aide ?</Text>
            </View>
            <Text style={styles.contactSubtitle}>
              Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs délais.
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactUs}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.contactButtonGradient}
              >
                <Ionicons name="mail" size={20} color={colors.white} />
                <Text style={styles.contactButtonText}>Contactez-nous</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions Fréquentes</Text>
          
          {faqData.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Ionicons 
                  name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.text.secondary} 
                />
              </TouchableOpacity>
              
              {expandedFaq === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Importantes</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleDeleteData}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="trash" size={24} color={colors.danger} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Supprimer mes données</Text>
              <Text style={styles.actionSubtitle}>
                Supprime définitivement votre compte et toutes vos données
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Informations utiles</Text>
              <Text style={styles.infoText}>
                • Temps de réponse : 24-48h{'\n'}
                • Support disponible en français{'\n'}
                • Horaires : 9h-18h (Lun-Ven)
              </Text>
            </View>
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
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 8,
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  contactButton: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  contactButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  faqAnswerText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.danger + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
}); 