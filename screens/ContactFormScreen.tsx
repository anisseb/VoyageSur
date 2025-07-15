import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ContactFormScreenProps {
  navigation: any;
}

export default function ContactFormScreen({ navigation }: ContactFormScreenProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: '',
  });

  const categories = [
    { label: 'Problème technique', value: 'technical' },
    { label: 'Question sur l\'application', value: 'app_question' },
    { label: 'Suggestion d\'amélioration', value: 'suggestion' },
    { label: 'Signalement de bug', value: 'bug_report' },
    { label: 'Demande de fonctionnalité', value: 'feature_request' },
    { label: 'Autre', value: 'other' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.subject.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un sujet');
      return false;
    }
    if (!formData.message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre message');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const contactData = {
        userId: user?.uid,
        userEmail: user?.email,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        category: formData.category,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Sauvegarder dans Firestore avec l'ID utilisateur comme clé de document
      await setDoc(doc(db, 'contact-us-app', user?.uid || ''), contactData);

      Alert.alert(
        'Message envoyé !',
        'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer votre message. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.headerTitle}>Contactez-nous</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={colors.info} />
              <Text style={styles.infoText}>
                Remplissez ce formulaire et nous vous répondrons dans les plus brefs délais.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre message</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Catégorie *</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryButton,
                      formData.category === category.value && styles.categoryButtonSelected
                    ]}
                    onPress={() => handleInputChange('category', category.value)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.category === category.value && styles.categoryButtonTextSelected
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sujet *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.subject}
                onChangeText={(text) => handleInputChange('subject', text)}
                placeholder="Résumez votre problème en quelques mots"
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.textInput, styles.messageInput]}
                value={formData.message}
                onChangeText={(text) => handleInputChange('message', text)}
                placeholder="Décrivez votre problème ou votre question en détail..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text style={styles.characterCount}>
                {formData.message.length}/1000 caractères
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.submitButtonGradient}
              >
                <Ionicons name="send" size={20} color={colors.white} />
                <Text style={styles.submitButtonText}>
                  {loading ? 'Envoi...' : 'Envoyer le message'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactInfoTitle}>Autres moyens de contact</Text>
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={20} color={colors.primary} />
                <Text style={styles.contactItemText}>contact@voyage-sur.fr</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <Text style={styles.contactItemText}>Réponse sous 24-48h</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  categoryButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: colors.white,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.white,
  },
  messageInput: {
    height: 120,
  },
  characterCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contactInfo: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactItemText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
  },
}); 