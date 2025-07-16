import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface EmergencyCard {
  id: string;
  label: string;
  description: string;
  symptomes?: string[];
  actions?: string[];
  prevention?: string[];
  urgence?: boolean;
  categorie?: string;
}

interface EmergencyCardsScreenProps {
  navigation: any;
}

export default function EmergencyCardsScreen({ navigation }: EmergencyCardsScreenProps) {
  const [emergencyCards, setEmergencyCards] = useState<EmergencyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadEmergencyCards();
  }, []);

  const loadEmergencyCards = async () => {
    try {
      setLoading(true);
      const emergencyCollection = collection(db, 'fiches_urgence');
      const emergencySnapshot = await getDocs(emergencyCollection);
      
      const cards: EmergencyCard[] = [];
      emergencySnapshot.forEach((doc) => {
        const data = doc.data();
        cards.push({
          id: doc.id,
          label: data.label || 'Fiche sans titre',
          description: data.description || '',
          symptomes: data.symptomes || [],
          actions: data.actions || [],
          prevention: data.prevention || [],
          urgence: data.urgence || false,
        });
      });

      // Trier par urgence puis par titre
      cards.sort((a, b) => {
        if (a.urgence && !b.urgence) return -1;
        if (!a.urgence && b.urgence) return 1;
        return a.label.localeCompare(b.label);
      });

      setEmergencyCards(cards);
    } catch (error) {
      console.error('Erreur lors du chargement des fiches d\'urgence:', error);
      Alert.alert('Erreur', 'Impossible de charger les fiches d\'urgence');
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    const categories = [...new Set(emergencyCards.map(card => card.categorie).filter(Boolean))];
    return categories.sort();
  };

  const getFilteredCards = () => {
    if (!selectedCategory) return emergencyCards;
    return emergencyCards.filter(card => card.categorie === selectedCategory);
  };

  const renderEmergencyCard = (card: EmergencyCard) => (
    <TouchableOpacity
      key={card.id}
      style={[styles.emergencyCard, card.urgence && styles.urgentCard]}
      onPress={() => navigation.navigate('EmergencyCardDetail', { card })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons 
            name={card.urgence ? "warning" : "medical"} 
            size={24} 
            color={card.urgence ? colors.danger : colors.primary} 
          />
          <Text style={[styles.cardTitle, card.urgence && styles.urgentTitle]}>
            {card.label}
          </Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {card.urgence && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>URGENT</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </View>
      </View>
      
      <Text style={styles.cardDescription} numberOfLines={2}>
        {card.description}
      </Text>
      
      {card.categorie && (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{card.categorie}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
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
            <Text style={styles.headerTitle}>Fiches d'Urgence</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des fiches d'urgence...</Text>
        </View>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Fiches d'Urgence</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Liste des fiches d'urgence */}
        <View style={styles.content}>
          {getFilteredCards().length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={64} color={colors.gray[400]} />
              <Text style={styles.emptyTitle}>Aucune fiche d'urgence</Text>
              <Text style={styles.emptySubtext}>
                {selectedCategory 
                  ? `Aucune fiche trouvée dans la catégorie "${selectedCategory}"`
                  : 'Aucune fiche d\'urgence disponible pour le moment'
                }
              </Text>
            </View>
          ) : (
            getFilteredCards().map(renderEmergencyCard)
          )}
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
  filtersContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  filtersScroll: {
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: colors.white,
  },
  content: {
    padding: 20,
  },
  emergencyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 8,
    flex: 1,
  },
  urgentTitle: {
    color: colors.danger,
  },
  urgentBadge: {
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
}); 