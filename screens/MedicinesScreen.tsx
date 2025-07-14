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
import { Medicine } from '../types';

interface MedicinesScreenProps {
  navigation: any;
  route: any;
}

export default function MedicinesScreen({ navigation, route }: MedicinesScreenProps) {
  const { tripId } = route.params;
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    // Simuler le chargement des médicaments
    const mockMedicines: Medicine[] = [
      {
        id: '1',
        name: 'Paracétamol',
        category: 'antidouleur',
        description: 'Pour les maux de tête, fièvre et douleurs légères',
        prescription: false,
        dosage: '500-1000mg toutes les 4-6h',
      },
      {
        id: '2',
        name: 'Ibuprofène',
        category: 'antidouleur',
        description: 'Anti-inflammatoire pour douleurs et fièvre',
        prescription: false,
        dosage: '200-400mg toutes les 6-8h',
      },
      {
        id: '3',
        name: 'Antihistaminique',
        category: 'allergie',
        description: 'Pour les allergies et piqûres d\'insectes',
        prescription: false,
        dosage: '1 comprimé par jour',
      },
      {
        id: '4',
        name: 'Antipaludéens',
        category: 'prévention',
        description: 'Prévention du paludisme en zones endémiques',
        prescription: true,
        dosage: 'Selon prescription médicale',
      },
      {
        id: '5',
        name: 'Antidiarrhéique',
        category: 'digestion',
        description: 'Pour les diarrhées légères',
        prescription: false,
        dosage: '2 comprimés puis 1 après chaque selle',
      },
      {
        id: '6',
        name: 'Antinauséeux',
        category: 'digestion',
        description: 'Pour les nausées et vomissements',
        prescription: false,
        dosage: '1 comprimé avant les repas',
      },
      {
        id: '7',
        name: 'Antiseptique',
        category: 'premiers_soins',
        description: 'Pour désinfecter les petites plaies',
        prescription: false,
        dosage: 'Application locale',
      },
      {
        id: '8',
        name: 'Pansements',
        category: 'premiers_soins',
        description: 'Pansements stériles de différentes tailles',
        prescription: false,
        dosage: 'Selon besoin',
      },
      {
        id: '9',
        name: 'Crème solaire',
        category: 'protection',
        description: 'Protection solaire haute protection',
        prescription: false,
        dosage: 'Application toutes les 2h',
      },
      {
        id: '10',
        name: 'Répulsif anti-moustiques',
        category: 'protection',
        description: 'Protection contre les moustiques',
        prescription: false,
        dosage: 'Application toutes les 4-6h',
      },
    ];

    setMedicines(mockMedicines);
    setLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'antidouleur': return 'medical';
      case 'allergie': return 'leaf';
      case 'prévention': return 'shield-checkmark';
      case 'digestion': return 'restaurant';
      case 'premiers_soins': return 'bandage';
      case 'protection': return 'sunny';
      default: return 'help-circle';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'antidouleur': return colors.medicine;
      case 'allergie': return colors.success;
      case 'prévention': return colors.warning;
      case 'digestion': return colors.info;
      case 'premiers_soins': return colors.danger;
      case 'protection': return colors.secondary;
      default: return colors.gray[500];
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'antidouleur': return 'Antidouleurs';
      case 'allergie': return 'Allergies';
      case 'prévention': return 'Prévention';
      case 'digestion': return 'Digestion';
      case 'premiers_soins': return 'Premiers soins';
      case 'protection': return 'Protection';
      default: return 'Autre';
    }
  };

  const groupedMedicines = medicines.reduce((groups, medicine) => {
    if (!groups[medicine.category]) {
      groups[medicine.category] = [];
    }
    groups[medicine.category].push(medicine);
    return groups;
  }, {} as Record<string, Medicine[]>);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement de la trousse à pharmacie...</Text>
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
            <Ionicons name="fitness" size={32} color={colors.medicine} />
          </View>
          <Text style={styles.headerTitle}>Trousse à Pharmacie</Text>
          <Text style={styles.headerSubtitle}>
            Médicaments recommandés pour votre voyage
          </Text>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{medicines.length}</Text>
            <Text style={styles.statLabel}>Médicaments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{medicines.filter(m => m.prescription).length}</Text>
            <Text style={styles.statLabel}>Sur ordonnance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Object.keys(groupedMedicines).length}</Text>
            <Text style={styles.statLabel}>Catégories</Text>
          </View>
        </View>

        {/* Liste des médicaments par catégorie */}
        {Object.entries(groupedMedicines).map(([category, categoryMedicines]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons 
                name={getCategoryIcon(category) as any} 
                size={24} 
                color={getCategoryColor(category)} 
              />
              <Text style={styles.categoryTitle}>
                {getCategoryText(category)}
              </Text>
            </View>

            {categoryMedicines.map((medicine) => (
              <View key={medicine.id} style={styles.medicineCard}>
                <View style={styles.medicineHeader}>
                  <View style={styles.medicineInfo}>
                    <Text style={styles.medicineName}>{medicine.name}</Text>
                    {medicine.prescription && (
                      <View style={styles.prescriptionBadge}>
                        <Ionicons name="medical" size={12} color={colors.white} />
                        <Text style={styles.prescriptionText}>Ordonnance</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons name="fitness" size={24} color={colors.medicine} />
                </View>

                <Text style={styles.medicineDescription}>
                  {medicine.description}
                </Text>

                <View style={styles.medicineDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={16} color={colors.gray[600]} />
                    <Text style={styles.detailText}>{medicine.dosage}</Text>
                  </View>
                </View>

                <View style={styles.medicineActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="information-circle" size={20} color={colors.info} />
                    <Text style={styles.actionText}>Plus d'infos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="add-circle" size={20} color={colors.primary} />
                    <Text style={styles.actionText}>Ajouter à ma liste</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Section conseils */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="bulb" size={24} color={colors.warning} />
              <Text style={styles.infoTitle}>Conseils pour votre trousse</Text>
            </View>
            <Text style={styles.infoText}>
              • Vérifiez les dates de péremption avant le départ{'\n'}
              • Gardez les médicaments dans leur emballage d'origine{'\n'}
              • Emportez une copie de vos ordonnances{'\n'}
              • Adaptez la quantité à la durée de votre séjour{'\n'}
              • Consultez un médecin pour les médicaments sur ordonnance
            </Text>
          </View>
        </View>

        {/* Section checklist */}
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>Checklist Trousse à Pharmacie</Text>
          <View style={styles.checklistItems}>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.checklistText}>Médicaments de base (douleur, fièvre)</Text>
            </View>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.checklistText}>Produits de premiers soins</Text>
            </View>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.checklistText}>Protection solaire et anti-moustiques</Text>
            </View>
            <View style={styles.checklistItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.checklistText}>Médicaments spécifiques au voyage</Text>
            </View>
          </View>
        </View>

        {/* Bouton d'action */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="print" size={24} color={colors.white} />
            <Text style={styles.primaryButtonText}>Imprimer ma liste</Text>
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
  medicineCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  prescriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  prescriptionText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  medicineDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  medicineDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  medicineActions: {
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
  checklistSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  checklistItems: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistText: {
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