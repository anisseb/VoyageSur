import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Vaccine } from '../types';

interface VaccinesScreenProps {
  navigation: any;
  route: any;
}

export default function VaccinesScreen({ navigation, route }: VaccinesScreenProps) {
  const { tripId } = route.params;
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVaccines();
  }, []);

  const loadVaccines = async () => {
    // Simuler le chargement des vaccins
    const mockVaccines: Vaccine[] = [
      {
        id: '1',
        name: 'Fièvre jaune',
        description: 'Vaccin obligatoire pour les voyages en Afrique subsaharienne et Amérique du Sud',
        required: true,
        recommended: true,
        duration: '10 jours avant le départ',
        cost: 45,
      },
      {
        id: '2',
        name: 'Hépatite A',
        description: 'Recommandé pour tous les voyages internationaux',
        required: false,
        recommended: true,
        duration: '2 semaines avant le départ',
        cost: 35,
      },
      {
        id: '3',
        name: 'Hépatite B',
        description: 'Recommandé pour les séjours prolongés ou expositions fréquentes',
        required: false,
        recommended: true,
        duration: '1 mois avant le départ',
        cost: 25,
      },
      {
        id: '4',
        name: 'Typhoïde',
        description: 'Recommandé pour les voyages en Asie, Afrique, Amérique latine',
        required: false,
        recommended: true,
        duration: '2 semaines avant le départ',
        cost: 30,
      },
      {
        id: '5',
        name: 'Rage',
        description: 'Recommandé pour les voyages en zones rurales ou contact avec animaux',
        required: false,
        recommended: false,
        duration: '1 mois avant le départ',
        cost: 120,
      },
      {
        id: '6',
        name: 'Encéphalite japonaise',
        description: 'Recommandé pour les voyages en Asie du Sud-Est',
        required: false,
        recommended: false,
        duration: '1 mois avant le départ',
        cost: 150,
      },
    ];

    setVaccines(mockVaccines);
    setLoading(false);
  };

  const getVaccineStatus = (vaccine: Vaccine) => {
    if (vaccine.required) return 'required';
    if (vaccine.recommended) return 'recommended';
    return 'optional';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'required': return colors.danger;
      case 'recommended': return colors.warning;
      case 'optional': return colors.info;
      default: return colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'required': return 'Obligatoire';
      case 'recommended': return 'Recommandé';
      case 'optional': return 'Optionnel';
      default: return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des vaccins...</Text>
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
            <Ionicons name="medical" size={32} color={colors.vaccine} />
          </View>
          <Text style={styles.headerTitle}>Vaccins Recommandés</Text>
          <Text style={styles.headerSubtitle}>
            Basé sur les recommandations OMS pour votre destination
          </Text>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{vaccines.filter(v => v.required).length}</Text>
            <Text style={styles.statLabel}>Obligatoires</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{vaccines.filter(v => v.recommended).length}</Text>
            <Text style={styles.statLabel}>Recommandés</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{vaccines.filter(v => !v.required && !v.recommended).length}</Text>
            <Text style={styles.statLabel}>Optionnels</Text>
          </View>
        </View>

        {/* Liste des vaccins */}
        <View style={styles.vaccinesList}>
          {vaccines.map((vaccine) => {
            const status = getVaccineStatus(vaccine);
            return (
              <View key={vaccine.id} style={styles.vaccineCard}>
                <View style={styles.vaccineHeader}>
                  <View style={styles.vaccineInfo}>
                    <Text style={styles.vaccineName}>{vaccine.name}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusText(status)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="medical" size={24} color={colors.vaccine} />
                </View>

                <Text style={styles.vaccineDescription}>
                  {vaccine.description}
                </Text>

                <View style={styles.vaccineDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={16} color={colors.gray[600]} />
                    <Text style={styles.detailText}>{vaccine.duration}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="card" size={16} color={colors.gray[600]} />
                    <Text style={styles.detailText}>~{vaccine.cost}€</Text>
                  </View>
                </View>

                <View style={styles.vaccineActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="information-circle" size={20} color={colors.info} />
                    <Text style={styles.actionText}>Plus d'infos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <Text style={styles.actionText}>Centres de vaccination</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Section informations importantes */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="warning" size={24} color={colors.warning} />
              <Text style={styles.infoTitle}>Informations importantes</Text>
            </View>
            <Text style={styles.infoText}>
              • Certains vaccins nécessitent plusieurs injections espacées dans le temps{'\n'}
              • Consultez votre médecin traitant pour un avis personnalisé{'\n'}
              • Gardez votre carnet de vaccination à jour{'\n'}
              • Les prix sont donnés à titre indicatif
            </Text>
          </View>
        </View>

        {/* Bouton d'action */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="calendar" size={24} color={colors.white} />
            <Text style={styles.primaryButtonText}>Prendre RDV vaccination</Text>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  vaccinesList: {
    paddingHorizontal: 20,
  },
  vaccineCard: {
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
  vaccineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  vaccineDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  vaccineDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  vaccineActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 4,
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