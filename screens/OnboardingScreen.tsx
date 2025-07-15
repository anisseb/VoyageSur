import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingScreenProps {
  navigation: any;
  route: any;
}

export default function OnboardingScreen({ navigation, route }: OnboardingScreenProps) {
  const { userId } = route.params;
  const { refreshUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      id: 0,
      title: 'Votre prénom',
      subtitle: 'Comment devons-nous vous appeler ?',
      icon: 'person',
      field: 'firstName',
      placeholder: 'Votre prénom',
      type: 'text',
    },
    {
      id: 1,
      title: 'Votre nom de famille',
      subtitle: 'Quel est votre nom de famille ?',
      icon: 'person',
      field: 'lastName',
      placeholder: 'Votre nom de famille',
      type: 'text',
    },
    {
      id: 2,
      title: 'Votre âge',
      subtitle: 'Cela nous aide à personnaliser vos recommandations',
      icon: 'calendar',
      field: 'age',
      placeholder: 'Votre âge',
      type: 'number',
    },
    {
      id: 3,
      title: 'Votre sexe',
      subtitle: 'Pour des recommandations médicales adaptées',
      icon: 'male-female',
      field: 'gender',
      placeholder: 'Sélectionnez votre sexe',
      type: 'select',
    },
  ];

  const currentStepData = steps[currentStep];

  const validateCurrentStep = () => {
    const value = formData[currentStepData.field as keyof typeof formData];
    
    if (!value || value.trim() === '') {
      Alert.alert('Erreur', `Veuillez saisir votre ${currentStepData.field === 'firstName' ? 'prénom' : currentStepData.field === 'lastName' ? 'nom de famille' : currentStepData.field === 'age' ? 'âge' : 'sexe'}`);
      return false;
    }

    if (currentStepData.field === 'age') {
      const age = parseInt(value);
      if (isNaN(age) || age < 1 || age > 120) {
        Alert.alert('Erreur', 'Veuillez saisir un âge valide');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Mettre à jour le document utilisateur dans Firestore
      await updateDoc(doc(db, 'users', userId), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        gender: formData.gender,
        onboarding: true, // L'onboarding est terminé
        updatedAt: new Date(),
      });

      // Rafraîchir le profil utilisateur pour déclencher la navigation automatique
      await refreshUserProfile();
      
      Alert.alert(
        'Profil créé !',
        'Votre profil a été créé avec succès. Bienvenue dans Voyage Sûr !',
        [
          {
            text: 'Commencer',
            onPress: () => {
              // La navigation sera gérée automatiquement par AuthContext
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      Alert.alert('Erreur', 'Impossible de créer votre profil. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [currentStepData.field]: value,
    }));
  };

  const renderStepContent = () => {
    switch (currentStepData.type) {
      case 'text':
      case 'number':
        return (
          <View style={styles.inputContainer}>
            <Ionicons name={currentStepData.icon as any} size={24} color={colors.primary} />
            <TextInput
              style={styles.textInput}
              placeholder={currentStepData.placeholder}
              value={formData[currentStepData.field as keyof typeof formData]}
              onChangeText={handleInputChange}
              keyboardType={currentStepData.type === 'number' ? 'numeric' : 'default'}
              autoFocus
            />
          </View>
        );
      
      case 'select':
        return (
          <View style={styles.selectContainer}>
            <TouchableOpacity
              style={[
                styles.selectOption,
                formData.gender === 'homme' && styles.selectOptionSelected
              ]}
              onPress={() => handleInputChange('homme')}
            >
              <Ionicons 
                name="male" 
                size={24} 
                color={formData.gender === 'homme' ? colors.white : colors.primary} 
              />
              <Text style={[
                styles.selectOptionText,
                formData.gender === 'homme' && styles.selectOptionTextSelected
              ]}>
                Homme
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.selectOption,
                formData.gender === 'femme' && styles.selectOptionSelected
              ]}
              onPress={() => handleInputChange('femme')}
            >
              <Ionicons 
                name="female" 
                size={24} 
                color={formData.gender === 'femme' ? colors.white : colors.primary} 
              />
              <Text style={[
                styles.selectOptionText,
                formData.gender === 'femme' && styles.selectOptionTextSelected
              ]}>
                Femme
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.selectOption,
                formData.gender === 'autre' && styles.selectOptionSelected
              ]}
              onPress={() => handleInputChange('autre')}
            >
              <Ionicons 
                name="person" 
                size={24} 
                color={formData.gender === 'autre' ? colors.white : colors.primary} 
              />
              <Text style={[
                styles.selectOptionText,
                formData.gender === 'autre' && styles.selectOptionTextSelected
              ]}>
                Autre
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header avec gradient */}
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Ionicons name="person-add" size={60} color={colors.white} />
              <Text style={styles.headerTitle}>Créer votre profil</Text>
              <Text style={styles.headerSubtitle}>
                Étape {currentStep + 1} sur {steps.length}
              </Text>
            </View>
          </LinearGradient>

          {/* Contenu de l'étape */}
          <View style={styles.contentContainer}>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{currentStepData.title}</Text>
              <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
              
              {renderStepContent()}
            </View>

            {/* Navigation */}
            <View style={styles.navigationContainer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={24} color={colors.primary} />
                  <Text style={styles.backButtonText}>Retour</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.nextButton, loading && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={loading}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>
                    {loading 
                      ? 'Création...' 
                      : currentStep === steps.length - 1 
                        ? 'Terminer' 
                        : 'Suivant'
                    }
                  </Text>
                  <Ionicons 
                    name={currentStep === steps.length - 1 ? "checkmark" : "arrow-forward"} 
                    size={24} 
                    color={colors.white} 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Indicateur de progression */}
            <View style={styles.progressContainer}>
              {steps.map((step, index) => (
                <View
                  key={step.id}
                  style={[
                    styles.progressDot,
                    index <= currentStep ? styles.progressDotActive : styles.progressDotInactive
                  ]}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.gray[50],
    width: '100%',
    maxWidth: 300,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: colors.text.primary,
    marginLeft: 12,
  },
  selectContainer: {
    width: '100%',
    maxWidth: 300,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  selectOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  selectOptionText: {
    fontSize: 18,
    color: colors.text.primary,
    marginLeft: 12,
    fontWeight: 'bold',
  },
  selectOptionTextSelected: {
    color: colors.white,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  nextButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressDotInactive: {
    backgroundColor: colors.gray[300],
  },
}); 