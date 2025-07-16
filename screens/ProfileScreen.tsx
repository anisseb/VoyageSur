import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { userProfile, signOutUser, updateUserProfile } = useAuth();
  const [isPremium, setIsPremium] = useState(userProfile?.isPremium || false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const insets = useSafeAreaInsets();
  // États pour les champs éditables
  const [editForm, setEditForm] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    email: userProfile?.email || '',
    age: userProfile?.age ? String(userProfile.age) : '',
    emergencyContact: {
      firstName: userProfile?.emergencyContact?.firstName || '',
      lastName: userProfile?.emergencyContact?.lastName || '',
      phone: userProfile?.emergencyContact?.phone || '',
    },
  });



  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(editForm);
      setShowEditModal(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    }
  };

  const handleEditProfile = () => {
    setEditForm({
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
      age: userProfile?.age ? String(userProfile.age) : '',
      emergencyContact: {
        firstName: userProfile?.emergencyContact?.firstName || '',
        lastName: userProfile?.emergencyContact?.lastName || '',
        phone: userProfile?.emergencyContact?.phone || '',
      },
    });
    setShowEditModal(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec gradient */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color={colors.white} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userProfile?.firstName || 'Utilisateur'} {userProfile?.lastName || 'Voyage Sûr'}
              </Text>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={16} color={colors.white} />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="create" size={30} color={colors.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Section Informations personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          {/* Carte Nom complet */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="person-circle" size={24} color={colors.primary} />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Nom complet</Text>
                <Text style={styles.infoCardValue}>
                  {userProfile?.firstName || 'Non renseigné'} {userProfile?.lastName || ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Carte Email */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="mail" size={24} color={colors.secondary} />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Email</Text>
                <Text style={styles.infoCardValue}>{userProfile?.email || 'Non renseigné'}</Text>
              </View>
            </View>
          </View>

          {/* Carte Âge */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.info + '20' }]}>
                <Ionicons name="calendar" size={24} color={colors.info} />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Âge</Text>
                <Text style={styles.infoCardValue}>
                  {userProfile?.age ? `${userProfile.age} ans` : 'Non renseigné'}
                </Text>
              </View>
            </View>
          </View>

          {/* Carte Contact d'urgence */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.emergency + '20' }]}>
                <Ionicons name="medical" size={24} color={colors.emergency} />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Contact d'urgence</Text>
                {userProfile?.emergencyContact ? (
                  <View style={styles.emergencyContactInfo}>
                    <Text style={styles.infoCardValue}>
                      {userProfile.emergencyContact.firstName} {userProfile.emergencyContact.lastName}
                    </Text>
                    <Text style={styles.emergencyContactPhone}>
                      {userProfile.emergencyContact.phone}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.infoCardValue}>Non renseigné</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Section Premium */}
        {!isPremium && (
          <View style={styles.section}>
            <View style={styles.premiumCard}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.premiumGradient}
              >
                <View style={styles.premiumHeader}>
                  <Ionicons name="star" size={32} color={colors.white} />
                  <Text style={styles.premiumTitle}>Passez à Premium</Text>
                </View>
                <Text style={styles.premiumSubtitle}>
                  Débloquez toutes les fonctionnalités
                </Text>
                <View style={styles.premiumFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                    <Text style={styles.featureText}>Création de voyage illimité ( recommandations de vaccins, gestions des symptômes et traitement, contacts d'urgence, checklist de préparation etc...)</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                    <Text style={styles.featureText}>Accès aux fiches urgences de premier secours</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                    <Text style={styles.featureText}>Accès à la météo et aux conseils météorologique local en fonction des dates du voyage sélectionné</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                    <Text style={styles.featureText}>Accès aux recommandations IA ( conseils culturels, conseils pour la valise, coutumes locales etc ..)</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                    <Text style={styles.featureText}>Notifications avancées</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => navigation.navigate('Subscription')}
                >
                  <Text style={styles.upgradeButtonText}>Voir les offres</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Section Accès rapide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accès rapide</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('EmergencyCards')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="medical" size={24} color={colors.primary} />
                <Text style={styles.settingText}>Fiches d'urgence</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Paramètres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications" size={24} color={colors.primary} />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('Privacy')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                <Text style={styles.settingText}>Confidentialité</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle" size={24} color={colors.primary} />
                <Text style={styles.settingText}>Aide & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('About')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle" size={24} color={colors.primary} />
                <Text style={styles.settingText}>À propos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Déconnexion',
                'Êtes-vous sûr de vouloir vous déconnecter ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Se déconnecter', onPress: signOutUser, style: 'destructive' },
                ]
              );
            }}
          >
            <Ionicons name="log-out" size={24} color={colors.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal d'édition du profil */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Modifier le profil</Text>
                  <TouchableOpacity onPress={() => setShowEditModal(false)}>
                    <Ionicons name="close" size={24} color={colors.text.primary} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.modalBodyContent}
                >
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Prénom *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editForm.firstName}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, firstName: text }))}
                      placeholder="Votre prénom"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Nom</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editForm.lastName}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, lastName: text }))}
                      placeholder="Votre nom"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editForm.email}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                      placeholder="votre@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Âge</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editForm.age}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, age: text }))}
                      placeholder="Votre âge"
                      keyboardType="numeric"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Contact d'urgence - Prénom</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editForm.emergencyContact.firstName}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, firstName: text } }))}
                      placeholder="Prénom"
                      returnKeyType="next"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Contact d'urgence - Nom</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editForm.emergencyContact.lastName}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, lastName: text } }))}
                      placeholder="Nom"
                      returnKeyType="next"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Contact d'urgence - Téléphone</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editForm.emergencyContact.phone}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, phone: text } }))}
                      placeholder="+33 6 12 34 56 78"
                      keyboardType="phone-pad"
                      returnKeyType="done"
                    />
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                  >
                    <Text style={styles.saveButtonText}>Sauvegarder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50, // Augmenter le padding pour compenser la status bar
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
    marginLeft: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  emergencyContactInfo: {
    marginTop: 4,
  },
  emergencyContactPhone: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  premiumCard: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  premiumGradient: {
    borderRadius: 12,
    padding: 20,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 8,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  premiumFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: colors.white,
    fontSize: 14,
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: colors.text.primary,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  settingsList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutText: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalBody: {
    padding: 16,
  },
  modalBodyContent: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    backgroundColor: colors.gray[300],
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 