import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { EmergencyContact } from '../types';

interface EmergencyScreenProps {
  navigation: any;
  route: any;
}

export default function EmergencyScreen({ navigation, route }: EmergencyScreenProps) {
  const { tripId } = route.params;
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    // Simuler le chargement des contacts d'urgence
    const mockContacts: EmergencyContact[] = [
      {
        id: '1',
        name: 'Ambulance',
        phone: '112',
        type: 'ambulance',
        address: 'Service d\'urgence national',
      },
      {
        id: '2',
        name: 'Police',
        phone: '17',
        type: 'police',
        address: 'Police nationale',
      },
      {
        id: '3',
        name: 'Pompiers',
        phone: '18',
        type: 'ambulance',
        address: 'Sapeurs-pompiers',
      },
      {
        id: '4',
        name: 'SAMU',
        phone: '15',
        type: 'ambulance',
        address: 'Service d\'aide médicale urgente',
      },
      {
        id: '5',
        name: 'Ambassade de France',
        phone: '+33 1 43 17 43 17',
        type: 'embassy',
        address: '37 Quai d\'Orsay, 75007 Paris',
      },
      {
        id: '6',
        name: 'Hôpital Principal',
        phone: '+33 1 42 16 00 00',
        type: 'hospital',
        address: 'Hôpital de la Pitié-Salpêtrière, Paris',
      },
    ];

    setEmergencyContacts(mockContacts);
    setLoading(false);
  };

  const handleCall = (phone: string, name: string) => {
    Alert.alert(
      'Appeler',
      `Voulez-vous appeler ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Appeler', 
          onPress: () => {
            Linking.openURL(`tel:${phone}`);
          }
        },
      ]
    );
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'ambulance': return 'medical';
      case 'police': return 'shield';
      case 'embassy': return 'business';
      case 'hospital': return 'medical-outline';
      default: return 'call';
    }
  };

  const getContactColor = (type: string) => {
    switch (type) {
      case 'ambulance': return colors.danger;
      case 'police': return colors.info;
      case 'embassy': return colors.primary;
      case 'hospital': return colors.medicine;
      default: return colors.gray[500];
    }
  };

  const getContactTypeText = (type: string) => {
    switch (type) {
      case 'ambulance': return 'Urgence médicale';
      case 'police': return 'Sécurité';
      case 'embassy': return 'Représentation française';
      case 'hospital': return 'Établissement médical';
      default: return 'Contact';
    }
  };

  const groupedContacts = emergencyContacts.reduce((groups, contact) => {
    if (!groups[contact.type]) {
      groups[contact.type] = [];
    }
    groups[contact.type].push(contact);
    return groups;
  }, {} as Record<string, EmergencyContact[]>);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des contacts d'urgence...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header informatif */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="call" size={32} color={colors.emergency} />
          </View>
          <Text style={styles.headerTitle}>Contacts d'Urgence</Text>
          <Text style={styles.headerSubtitle}>
            Numéros importants pour votre sécurité
          </Text>
        </View>

        {/* Numéros d'urgence principaux */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>Numéros d'Urgence</Text>
          <View style={styles.emergencyGrid}>
            <TouchableOpacity
              style={[styles.emergencyCard, { backgroundColor: colors.danger }]}
              onPress={() => handleCall('112', 'Urgences')}
            >
              <Ionicons name="medical" size={32} color={colors.white} />
              <Text style={styles.emergencyNumber}>112</Text>
              <Text style={styles.emergencyLabel}>Urgences</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emergencyCard, { backgroundColor: colors.info }]}
              onPress={() => handleCall('17', 'Police')}
            >
              <Ionicons name="shield" size={32} color={colors.white} />
              <Text style={styles.emergencyNumber}>17</Text>
              <Text style={styles.emergencyLabel}>Police</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emergencyCard, { backgroundColor: colors.warning }]}
              onPress={() => handleCall('18', 'Pompiers')}
            >
              <Ionicons name="flame" size={32} color={colors.white} />
              <Text style={styles.emergencyNumber}>18</Text>
              <Text style={styles.emergencyLabel}>Pompiers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emergencyCard, { backgroundColor: colors.medicine }]}
              onPress={() => handleCall('15', 'SAMU')}
            >
              <Ionicons name="medical-outline" size={32} color={colors.white} />
              <Text style={styles.emergencyNumber}>15</Text>
              <Text style={styles.emergencyLabel}>SAMU</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contacts par catégorie */}
        {Object.entries(groupedContacts).map(([type, contacts]) => (
          <View key={type} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons 
                name={getContactIcon(type) as any} 
                size={24} 
                color={getContactColor(type)} 
              />
              <Text style={styles.categoryTitle}>
                {getContactTypeText(type)}
              </Text>
            </View>

            {contacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactCard}
                onPress={() => handleCall(contact.phone, contact.name)}
              >
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.address && (
                    <Text style={styles.contactAddress}>{contact.address}</Text>
                  )}
                </View>
                
                <View style={styles.contactActions}>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  <View style={[styles.callButton, { backgroundColor: getContactColor(type) }]}>
                    <Ionicons name="call" size={20} color={colors.white} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Section informations importantes */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="warning" size={24} color={colors.warning} />
              <Text style={styles.infoTitle}>En cas d'urgence</Text>
            </View>
            <Text style={styles.infoText}>
              • Restez calme et donnez des informations claires{'\n'}
              • Précisez votre localisation exacte{'\n'}
              • Décrivez les symptômes ou la situation{'\n'}
              • Gardez votre téléphone chargé{'\n'}
              • Notez les informations importantes
            </Text>
          </View>
        </View>

        {/* Section conseils de sécurité */}
        <View style={styles.safetySection}>
          <Text style={styles.safetyTitle}>Conseils de Sécurité</Text>
          <View style={styles.safetyItems}>
            <View style={styles.safetyItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.safetyText}>Sauvegardez ces numéros hors ligne</Text>
            </View>
            <View style={styles.safetyItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.safetyText}>Partagez votre localisation avec vos proches</Text>
            </View>
            <View style={styles.safetyItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.safetyText}>Gardez une copie de vos documents importants</Text>
            </View>
            <View style={styles.safetyItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.safetyText}>Connaissez l'adresse de l'ambassade la plus proche</Text>
            </View>
          </View>
        </View>

        {/* Bouton d'action */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="share" size={24} color={colors.white} />
            <Text style={styles.primaryButtonText}>Partager mes contacts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emergencySection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emergencyCard: {
    width: '48%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emergencyNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 8,
    marginBottom: 4,
  },
  emergencyLabel: {
    fontSize: 14,
    color: colors.white,
    fontWeight: 'bold',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.gray[50],
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 12,
  },
  contactCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  contactAddress: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  contactActions: {
    alignItems: 'flex-end',
  },
  contactPhone: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  safetySection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  safetyItems: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 8,
  },
  actionSection: {
    padding: 20,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 