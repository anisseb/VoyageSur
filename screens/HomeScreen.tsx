import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { TravelPlan } from '../types';
import { travelPlanService, cityService } from '../services/firebaseService';
import { purchaseService } from '../services/purchaseService';
import { useAuth } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const [activeTrips, setActiveTrips] = useState<TravelPlan[]>([]);
  const [pastTrips, setPastTrips] = useState<TravelPlan[]>([]);
  const [cityData, setCityData] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [hasFreeTripAccess, setHasFreeTripAccess] = useState(true);
  const [singleTripQuantity, setSingleTripQuantity] = useState(0);
  const insets = useSafeAreaInsets();

  // Recharger les voyages quand l'écran devient actif
  useFocusEffect(
    React.useCallback(() => {
      loadTrips();
      checkSubscriptionStatus();
    }, [])
  );

  // Recharger les informations d'achat quand l'écran devient actif
  useFocusEffect(
    React.useCallback(() => {
      checkSubscriptionStatus();
    }, [])
  );

  // Vérifier le statut d'abonnement
  const checkSubscriptionStatus = async () => {
    try {
      const purchaseInfo = await purchaseService.getPurchaseInfo();
      setIsPremium(purchaseInfo.isPremium);
      setHasFreeTripAccess(purchaseInfo.hasFreeTripAccess);
      
      // Récupérer la quantité d'achat unique
      if (purchaseInfo.singleTrip && purchaseInfo.singleTrip.quantity) {
        setSingleTripQuantity(purchaseInfo.singleTrip.quantity);
      } else {
        setSingleTripQuantity(0);
      }
      
      console.log('Purchase info:', purchaseInfo);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const loadTrips = async () => {
    try {
      if (user) {
        const trips = await travelPlanService.getByUserId(user.uid);
        setActiveTrips(trips.active || []);
        setPastTrips(trips.past || []);
        
        // Charger les données de ville pour tous les voyages
        const allTrips = [...(trips.active || []), ...(trips.past || [])];
        const cityDataMap: { [key: string]: any } = {};
        
        for (const trip of allTrips) {
          if (trip.cityId) {
            try {
              const cityInfo = await cityService.getById(trip.cityId);
              cityDataMap[trip.cityId] = cityInfo;
            } catch (error) {
              console.error(`Erreur lors du chargement des données de ville ${trip.cityId}:`, error);
            }
          }
        }
        
        setCityData(cityDataMap);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des voyages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return colors.success;
      case 'medium': return colors.warning;
      case 'high': return colors.danger;
      default: return colors.gray[500];
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'Faible';
      case 'medium': return 'Modéré';
      case 'high': return 'Élevé';
      default: return 'Inconnu';
    }
  };

  const isTripExpired = (trip: TravelPlan) => {
    return new Date() > trip.endDate;
  };

  const getTripStatus = (trip: TravelPlan) => {
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);

    if (now < startDate) {
      return { status: 'upcoming', text: 'À venir', color: colors.success };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'ongoing', text: 'En cours', color: colors.info };
    } else {
      return { status: 'completed', text: 'Terminé', color: colors.gray[500] };
    }
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
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Bonjour !</Text>
              <Text style={styles.subtitleText}>
                Prêt pour votre prochain voyage ?
              </Text>
            </View>
            <Ionicons name="medical" size={40} color={colors.white} />
          </View>
        </LinearGradient>

        {/* Bouton Nouveau Voyage */}
        <TouchableOpacity
          style={[styles.newTripButton, !hasFreeTripAccess && styles.disabledButton]}
          onPress={() => navigation.navigate('NewTrip')}
          disabled={!hasFreeTripAccess}
        >
          <LinearGradient
            colors={hasFreeTripAccess ? [colors.primary, colors.secondary] : [colors.gray[400], colors.gray[500]]}
            style={styles.newTripGradient}
          >
            <Ionicons name="add-circle" size={24} color={colors.white} />
            <Text style={styles.newTripText}>
              Nouveau Voyage
              {!isPremium && hasFreeTripAccess && singleTripQuantity > 0 && (
                <Text style={styles.tripCountText}> ({singleTripQuantity})</Text>
              )}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Message sur le voyage gratuit et options d'achat */}
        {!isPremium && (
          <View style={styles.section}>
            <View style={styles.freeTripCard}>
              <View style={styles.freeTripHeader}>
                <Ionicons 
                  name={hasFreeTripAccess ? "gift" : "information-circle"} 
                  size={24} 
                  color={hasFreeTripAccess ? colors.success : colors.warning} 
                />
                              <Text style={styles.freeTripTitle}>
                {hasFreeTripAccess 
                  ? (isPremium ? 'Premium Actif' : `Voyage${singleTripQuantity > 1 ? 's' : ''} Disponible${singleTripQuantity > 1 ? 's' : ''}`)
                  : 'Check santé non disponible'
                }
              </Text>
              </View>
              <Text style={styles.freeTripDescription}>
                {hasFreeTripAccess 
                  ? (isPremium 
                      ? 'Vous avez un accès premium illimité à tous les voyages et fonctionnalités.'
                      : `Vous avez accès à ${singleTripQuantity} voyage${singleTripQuantity > 1 ? 's' : ''} avec toutes les fonctionnalités de base. Pour plus de voyages, choisissez une option ci-dessous.`
                    )
                  : 'Vous n\'avez plus de voyages disponibles. Si vous voulez nous soutenir et en faire d\'autres, choisissez une option ci-dessous.'
                }
              </Text>
              <View style={styles.freeTripOptions}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => navigation.navigate('Subscription')}
                >
                  <Ionicons name="star" size={20} color={colors.primary} />
                  <Text style={styles.optionButtonText}>Passer à Premium</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, styles.secondaryOption]}
                  onPress={() => navigation.navigate('Subscription')}
                >
                  <Ionicons name="airplane" size={20} color={colors.info} />
                  <Text style={[styles.optionButtonText, styles.secondaryOptionText]}>
                    Acheter un voyage
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Section Voyages Actifs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voyages Actifs</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : activeTrips.length > 0 ? (
            activeTrips.map((trip) => {
              const status = getTripStatus(trip);
              const cityInfo = trip.cityId ? cityData[trip.cityId] : null;
              const cityImage = cityInfo?.image_ville;
              
              return (
                <TouchableOpacity
                  key={trip.id}
                  style={styles.tripCard}
                  onPress={() => navigation.navigate('TripDetails', { tripId: trip.id })}
                >
                  {/* Image de la ville en header */}
                  {cityImage && (
                    <View style={styles.tripImageContainer}>
                      <Image
                        source={{ uri: cityImage }}
                        style={styles.tripImage}
                        resizeMode="cover"
                      />
                      <View style={styles.imageOverlay}>
                        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                          <Text style={styles.statusText}>{status.text}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.tripContent}>
                    <View style={styles.tripHeader}>
                      <View>
                        <Text style={styles.tripDestination}>{trip.city}</Text>
                        <Text style={styles.tripCountry}>{trip.country}</Text>
                      </View>
                      {!cityImage && (
                        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                          <Text style={styles.statusText}>{status.text}</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.tripDetails}>
                      <View style={styles.tripInfo}>
                        <Ionicons name="calendar" size={16} color={colors.gray[600]} />
                        <Text style={styles.tripDate}>
                          {trip.startDate.toLocaleDateString('fr-FR')} - {trip.endDate.toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      
                      <View style={styles.tripInfo}>
                        <Ionicons name="people" size={16} color={colors.gray[600]} />
                        <Text style={styles.tripTravelers}>
                          {trip.travelers} voyageur(s)
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="airplane-outline" size={48} color={colors.gray[400]} />
              <Text style={styles.emptyText}>Aucun voyage actif</Text>
              <Text style={styles.emptySubtext}>
                Créez votre premier voyage pour commencer
              </Text>
            </View>
          )}
        </View>

        {/* Section Voyages Passés */}
        {pastTrips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voyages passés</Text>
            {pastTrips.map((trip) => {
              const cityInfo = trip.cityId ? cityData[trip.cityId] : null;
              const cityImage = cityInfo?.image_ville;
              
              return (
                <TouchableOpacity
                  key={trip.id}
                  style={[styles.tripCard, styles.pastTripCard]}
                  onPress={() => navigation.navigate('TripDetails', { tripId: trip.id })}
                >
                  {/* Image de la ville en header */}
                  {cityImage && (
                    <View style={styles.tripImageContainer}>
                      <Image
                        source={{ uri: cityImage }}
                        style={[styles.tripImage, { opacity: 0.7 }]}
                        resizeMode="cover"
                      />
                      <View style={styles.imageOverlay}>
                        <View style={[styles.statusBadge, { backgroundColor: colors.gray[500] }]}>
                          <Text style={styles.statusText}>Terminé</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.tripContent}>
                    <View style={styles.tripHeader}>
                      <View>
                        <Text style={[styles.tripDestination, styles.pastTripText]}>{trip.city}</Text>
                        <Text style={[styles.tripCountry, styles.pastTripText]}>{trip.country}</Text>
                      </View>
                      {!cityImage && (
                        <View style={[styles.statusBadge, { backgroundColor: colors.gray[500] }]}>
                          <Text style={styles.statusText}>Terminé</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.tripDetails}>
                      <View style={styles.tripInfo}>
                        <Ionicons name="calendar" size={16} color={colors.gray[500]} />
                        <Text style={[styles.tripDate, styles.pastTripText]}>
                          {trip.startDate.toLocaleDateString('fr-FR')} - {trip.endDate.toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      
                      <View style={styles.tripInfo}>
                        <Ionicons name="people" size={16} color={colors.gray[500]} />
                        <Text style={[styles.tripTravelers, styles.pastTripText]}>
                          {trip.travelers} voyageur(s)
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
    paddingTop: 50, // Augmenter le padding pour compenser la status bar
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  newTripButton: {
    marginHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newTripGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  newTripText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: colors.gray[600],
    fontSize: 16,
  },
  tripCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  tripImageContainer: {
    position: 'relative',
    height: 120,
    width: '100%',
  },
  tripImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  tripContent: {
    padding: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripDestination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  tripCountry: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tripDetails: {
    marginBottom: 12,
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 6,
  },
  tripTravelers: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 6,
  },
  tripProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginRight: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  progressPercent: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text.primary,
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  pastTripCard: {
    opacity: 0.7,
    backgroundColor: colors.gray[100],
  },
  pastTripText: {
    color: colors.text.secondary,
  },
  // Styles pour le message de voyage gratuit
  freeTripCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  freeTripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  freeTripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 8,
  },
  freeTripDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  freeTripOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  secondaryOption: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.info,
  },
  secondaryOptionText: {
    color: colors.info,
  },
  disabledButton: {
    opacity: 0.6,
  },
  tripCountText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'normal',
    opacity: 0.9,
  },
}); 