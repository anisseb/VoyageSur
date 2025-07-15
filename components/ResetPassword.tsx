import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { showErrorAlert, showSuccessAlert } from '../utils/alerts';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ResetPasswordProps {
  visible: boolean;
  onClose: () => void;
}

export default function ResetPassword({ visible, onClose }: ResetPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      showErrorAlert('Erreur', 'Veuillez saisir votre adresse email');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showSuccessAlert(
        'Email envoyé',
        'Un email de réinitialisation a été envoyé à votre adresse email'
      );
      onClose();
      setEmail('');
    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue lors de l\'envoi de l\'email';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cette adresse email';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
          break;
      }
      
      showErrorAlert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>🔑 Réinitialiser le mot de passe</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Saisissez votre adresse email pour recevoir un lien de réinitialisation
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📧 Email</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@email.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Envoyer l'email</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: -15,
    top: -15,
    zIndex: 10,
    padding: 8,
    backgroundColor: '#444',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 30,
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    backgroundColor: '#60a5fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonDisabled: {
    backgroundColor: '#4a5568',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 