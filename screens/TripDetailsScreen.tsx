import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { TravelPlan } from '../types';
import { travelPlanService, cityService, vaccineService, medicineService, symptomService } from '../services/firebaseService';
import { weatherService, WeatherResponse } from '../services/weatherService';
import { recommendationService, RecommendationResponse } from '../services/recommendationService';
import { useAuth } from '../contexts/AuthContext';

interface TripDetailsScreenProps {
  navigation: any;
  route: any;
}

interface CityData {
  id: string;
  nom: string;
  pays_id: string;
  code: string;
  image_ville?: string;
  vaccins: string[];
  medicaments: string[];
  ordonnances: string;
  test_vih: string;
  urgence: {
    numero: string;
    information_complementaire: string;
  };
  ambassade: string;
  auberges: string[];
  epidemies: string;
  fermetures: string;
  meteo: string;
  recommandations: string;
  created_at: any;
}

interface VaccineData {
  id: string;
  label: string;
  indication: string;
}

interface MedicineData {
  id: string;
  label: string;
  indication: string;
  symptomes?: string[];
}

interface SymptomData {
  id: string;
  label: string;
}

export default function TripDetailsScreen({ navigation, route }: TripDetailsScreenProps) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<TravelPlan | null>(null);
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [vaccines, setVaccines] = useState<VaccineData[]>([]);
  const [medicines, setMedicines] = useState<MedicineData[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [recommendationData, setRecommendationData] = useState<RecommendationResponse | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedMedicines, setExpandedMedicines] = useState<{ [key: string]: boolean }>({});
  const [expandedSymptoms, setExpandedSymptoms] = useState<{ [key: string]: boolean }>({});
  const [expandedRecommendations, setExpandedRecommendations] = useState<{ [key: string]: boolean }>({});
  const { user } = useAuth();

  useEffect(() => {
    loadTripDetails();
  }, [tripId]);

  useEffect(() => {
    if (trip && trip.city) {
      loadWeatherData();
      loadRecommendationData();
    }
  }, [trip]);

  const loadTripDetails = async () => {
    try {
      setLoading(true);
      
      // Charger les détails du voyage
      const tripData = await travelPlanService.getById(user?.uid || '', tripId);
      
      setTrip(tripData);

      // Si une ville est sélectionnée, charger ses données
      if (tripData && tripData.cityId) {
        const cityInfo = await cityService.getById(tripData.cityId);
        setCityData(cityInfo);

        // Charger les détails des vaccins
        if (cityInfo.vaccins && cityInfo.vaccins.length > 0) {
          const vaccinesData = await vaccineService.getByIds(cityInfo.vaccins);
          setVaccines(vaccinesData);
        }

        // Charger les détails des médicaments
        if (cityInfo.medicaments && cityInfo.medicaments.length > 0) {
          const medicinesData = await medicineService.getByIds(cityInfo.medicaments);
          setMedicines(medicinesData);
          
          // Extraire tous les IDs de symptômes uniques
          const allSymptomIds = new Set<string>();
          medicinesData.forEach(medicine => {
            if (medicine.symptomes && Array.isArray(medicine.symptomes)) {
              medicine.symptomes.forEach((symptomId: string) => allSymptomIds.add(symptomId));
            }
          });
          
          // Charger les détails des symptômes
          if (allSymptomIds.size > 0) {
            const symptomsData = await symptomService.getByIds(Array.from(allSymptomIds));
            setSymptoms(symptomsData);
          }
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les détails du voyage');
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async () => {
    if (!trip || !trip.city) return;
    
    try {
      setWeatherLoading(true);
      const weather = await weatherService.getWeatherForTrip({
        city: trip.city,
        startDate: trip.startDate,
        endDate: trip.endDate
      });
      setWeatherData(weather);
    } catch (error) {
      console.error('Erreur lors du chargement de la météo:', error);
      // Afficher un message d'erreur plus informatif
      if (error instanceof Error) {
        if (error.message.includes('Limite de requêtes')) {
          Alert.alert(
            'Limite API atteinte',
            'Le service météo est temporairement indisponible. Veuillez réessayer plus tard.',
            [{ text: 'OK' }]
          );
        } else if (error.message.includes('Clé API')) {
          Alert.alert(
            'Erreur de configuration',
            'Le service météo n\'est pas configuré correctement.',
            [{ text: 'OK' }]
          );
        }
      }
    } finally {
      setWeatherLoading(false);
    }
  };

  const loadRecommendationData = async () => {
    if (!trip || !trip.city) return;
    
    try {
      setRecommendationLoading(true);
      const recommendations = await recommendationService.getRecommendationsForTrip({
        city: trip.city,
        country: trip.country,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travelers: trip.travelers,
        travelType: trip.travelType,
        duration: trip.duration
      });
      setRecommendationData(recommendations);
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
      if (error instanceof Error) {
        if (error.message.includes('Limite de requêtes')) {
          Alert.alert(
            'Limite API atteinte',
            'Le service de recommandations est temporairement indisponible. Veuillez réessayer plus tard.',
            [{ text: 'OK' }]
          );
        } else if (error.message.includes('Clé API')) {
          Alert.alert(
            'Erreur de configuration',
            'Le service de recommandations n\'est pas configuré correctement.',
            [{ text: 'OK' }]
          );
        }
      }
    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleCallEmergency = () => {
    if (cityData?.urgence?.numero) {
      Linking.openURL(`tel:${cityData.urgence.numero}`);
    }
  };

  const handleOpenMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
  };

  const toggleMedicineExpansion = (medicineId: string) => {
    setExpandedMedicines(prev => ({
      ...prev,
      [medicineId]: !prev[medicineId]
    }));
  };

  const toggleSymptomExpansion = (symptomId: string) => {
    setExpandedSymptoms(prev => ({
      ...prev,
      [symptomId]: !prev[symptomId]
    }));
  };

  const toggleRecommendationExpansion = (section: string) => {
    setExpandedRecommendations(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getMedicinesForSymptom = (symptomId: string) => {
    return medicines.filter(medicine => 
      medicine.symptomes && medicine.symptomes.includes(symptomId)
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={async () => {
              
              // Lister tous les voyages de l'utilisateur
              try {
                const allTrips = await travelPlanService.getByUserId(user?.uid || '');
                
                // Chercher le voyage spécifique
                const foundInActive = allTrips.active.find(trip => trip.id === tripId);
                const foundInPast = allTrips.past.find(trip => trip.id === tripId);
                
              } catch (error) {
                console.error('Erreur lors du diagnostic:', error);
              }
            }}
          >
            <Text style={styles.testButtonText}>Diagnostic</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Voyage non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec image de la ville */}
        <View style={styles.header}>
          {cityData?.image_ville ? (
            <Image
              source={{ uri: cityData.image_ville }}
              style={styles.headerImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.headerGradient}
            />
          )}
          <View style={styles.headerOverlay}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.destinationText}>{trip.city || trip.country}</Text>
                <Text style={styles.countryText}>{trip.country}</Text>
              </View>
              <Ionicons name="airplane" size={40} color={colors.white} />
            </View>
          </View>
        </View>

        {/* Informations du voyage */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Informations du voyage</Text>
          </View>
          <View style={styles.tripInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                {trip.startDate.toLocaleDateString('fr-FR')} - {trip.endDate.toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={styles.infoText}>{trip.duration} jours</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={20} color={colors.primary} />
              <Text style={styles.infoText}>{trip.travelers} voyageur(s)</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="briefcase" size={20} color={colors.primary} />
              <Text style={styles.infoText}>{trip.travelType}</Text>
            </View>
          </View>
        </View>

        {/* Informations de la ville */}
        {cityData && (
          <>
            {/* Météo */}
            {/* Section Météo */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="partly-sunny" size={24} color={colors.info} style={{ marginRight: 10, marginTop: 2 }} />
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Météo</Text>
              </View>
              {weatherLoading ? (
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="partly-sunny" size={20} color={colors.info} />
                    <Text style={styles.infoTitle}>Chargement de la météo...</Text>
                  </View>
                  <Text style={styles.infoContent}>Récupération des informations météorologiques...</Text>
                </View>
              ) : weatherData ? (
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="partly-sunny" size={20} color={colors.info} />
                    <Text style={styles.infoTitle}>Météo pour {weatherData.city}</Text>
                  </View>
                  
                  <View style={styles.weatherContent}>
                    <View style={styles.weatherSection}>
                      <Text style={styles.weatherLabel}>Résumé</Text>
                      <Text style={styles.weatherText}>{weatherData.weather}</Text>
                    </View>
                    
                    <View style={styles.weatherSection}>
                      <Text style={styles.weatherLabel}>Températures</Text>
                      <Text style={styles.weatherText}>{weatherData.temperature}</Text>
                    </View>
                    
                    <View style={styles.weatherSection}>
                      <Text style={styles.weatherLabel}>Conditions</Text>
                      <Text style={styles.weatherText}>{weatherData.conditions}</Text>
                    </View>
                    
                    {weatherData.recommendations && weatherData.recommendations.length > 0 && (
                      <View style={styles.weatherSection}>
                        <Text style={styles.weatherLabel}>Recommandations</Text>
                        {weatherData.recommendations.map((rec, index) => (
                          <View key={index} style={styles.recommendationItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={styles.recommendationText}>{rec}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="partly-sunny" size={20} color={colors.gray[500]} />
                    <Text style={styles.infoTitle}>Météo non disponible</Text>
                  </View>
                  <Text style={styles.infoContent}>
                    Impossible de récupérer les informations météorologiques pour le moment.
                  </Text>
                </View>
              )}
            </View>

            {/* Recommandations IA */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles" size={24} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Recommandations IA</Text>
              </View>
              {recommendationLoading ? (
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="sparkles" size={20} color={colors.primary} />
                    <Text style={styles.infoTitle}>Génération des recommandations...</Text>
                  </View>
                  <Text style={styles.infoContent}>L'IA analyse votre voyage pour des conseils personnalisés...</Text>
                </View>
              ) : recommendationData ? (
                <>
                  {/* Conseils généraux */}
                  <View style={styles.infoCard}>
                    <TouchableOpacity
                      style={styles.recommendationHeader}
                      onPress={() => toggleRecommendationExpansion('general')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.recommendationHeaderContent}>
                        <Ionicons name="bulb" size={20} color={colors.primary} />
                        <Text style={styles.infoTitle}>Conseils généraux</Text>
                      </View>
                      <Ionicons 
                        name={expandedRecommendations['general'] ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.gray[600]} 
                      />
                    </TouchableOpacity>
                    {expandedRecommendations['general'] && (
                      <View style={styles.recommendationContent}>
                        <Text style={styles.infoContent}>{recommendationData.generalAdvice}</Text>
                      </View>
                    )}
                  </View>

                  {/* Conseils de santé */}
                  <View style={styles.infoCard}>
                    <TouchableOpacity
                      style={styles.recommendationHeader}
                      onPress={() => toggleRecommendationExpansion('health')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.recommendationHeaderContent}>
                        <Ionicons name="medical" size={20} color={colors.medicine} />
                        <Text style={styles.infoTitle}>Conseils de santé</Text>
                      </View>
                      <Ionicons 
                        name={expandedRecommendations['health'] ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.gray[600]} 
                      />
                    </TouchableOpacity>
                    {expandedRecommendations['health'] && (
                      <View style={styles.recommendationContent}>
                        <Text style={styles.infoContent}>{recommendationData.healthTips}</Text>
                      </View>
                    )}
                  </View>

                  {/* Conseils de sécurité */}
                  <View style={styles.infoCard}>
                    <TouchableOpacity
                      style={styles.recommendationHeader}
                      onPress={() => toggleRecommendationExpansion('safety')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.recommendationHeaderContent}>
                        <Ionicons name="shield-checkmark" size={20} color={colors.danger} />
                        <Text style={styles.infoTitle}>Conseils de sécurité</Text>
                      </View>
                      <Ionicons 
                        name={expandedRecommendations['safety'] ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.gray[600]} 
                      />
                    </TouchableOpacity>
                    {expandedRecommendations['safety'] && (
                      <View style={styles.recommendationContent}>
                        <Text style={styles.infoContent}>{recommendationData.safetyTips}</Text>
                      </View>
                    )}
                  </View>

                  {/* Conseils culturels */}
                  <View style={styles.infoCard}>
                    <TouchableOpacity
                      style={styles.recommendationHeader}
                      onPress={() => toggleRecommendationExpansion('cultural')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.recommendationHeaderContent}>
                        <Ionicons name="people" size={20} color={colors.secondary} />
                        <Text style={styles.infoTitle}>Conseils culturels</Text>
                      </View>
                      <Ionicons 
                        name={expandedRecommendations['cultural'] ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.gray[600]} 
                      />
                    </TouchableOpacity>
                    {expandedRecommendations['cultural'] && (
                      <View style={styles.recommendationContent}>
                        <Text style={styles.infoContent}>{recommendationData.culturalTips}</Text>
                      </View>
                    )}
                  </View>

                  {/* Conseils pour la valise */}
                  <View style={styles.infoCard}>
                    <TouchableOpacity
                      style={styles.recommendationHeader}
                      onPress={() => toggleRecommendationExpansion('packing')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.recommendationHeaderContent}>
                        <Ionicons name="bag" size={20} color={colors.info} />
                        <Text style={styles.infoTitle}>Conseils pour la valise</Text>
                      </View>
                      <Ionicons 
                        name={expandedRecommendations['packing'] ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.gray[600]} 
                      />
                    </TouchableOpacity>
                    {expandedRecommendations['packing'] && (
                      <View style={styles.recommendationContent}>
                        <Text style={styles.infoContent}>{recommendationData.packingTips}</Text>
                      </View>
                    )}
                  </View>

                  {/* Coutumes locales */}
                  <View style={styles.infoCard}>
                    <TouchableOpacity
                      style={styles.recommendationHeader}
                      onPress={() => toggleRecommendationExpansion('customs')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.recommendationHeaderContent}>
                        <Ionicons name="globe" size={20} color={colors.warning} />
                        <Text style={styles.infoTitle}>Coutumes locales</Text>
                      </View>
                      <Ionicons 
                        name={expandedRecommendations['customs'] ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={colors.gray[600]} 
                      />
                    </TouchableOpacity>
                    {expandedRecommendations['customs'] && (
                      <View style={styles.recommendationContent}>
                        <Text style={styles.infoContent}>{recommendationData.localCustoms}</Text>
                      </View>
                    )}
                  </View>

                  {/* Recommandations spécifiques */}
                  {recommendationData.recommendations && recommendationData.recommendations.length > 0 && (
                    <View style={styles.infoCard}>
                      <TouchableOpacity
                        style={styles.recommendationHeader}
                        onPress={() => toggleRecommendationExpansion('specific')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.recommendationHeaderContent}>
                          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                          <Text style={styles.infoTitle}>Recommandations spécifiques</Text>
                        </View>
                        <Ionicons 
                          name={expandedRecommendations['specific'] ? "chevron-up" : "chevron-down"} 
                          size={20} 
                          color={colors.gray[600]} 
                        />
                      </TouchableOpacity>
                      {expandedRecommendations['specific'] && (
                        <View style={styles.recommendationContent}>
                          {recommendationData.recommendations.map((rec, index) => (
                            <View key={index} style={styles.recommendationItem}>
                              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                              <Text style={styles.recommendationText}>{rec}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="sparkles" size={20} color={colors.gray[500]} />
                    <Text style={styles.infoTitle}>Recommandations non disponibles</Text>
                  </View>
                  <Text style={styles.infoContent}>
                    Impossible de générer des recommandations personnalisées pour le moment.
                  </Text>
                </View>
              )}
            </View>


            {/* Vaccins recommandés */}
            {vaccines.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="shield-checkmark" size={24} color={colors.vaccine} style={{ marginRight: 10, marginTop: 2 }} />
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Vaccins recommandés</Text>
                </View>
                {vaccines.map((vaccine, index) => (
                  <View key={vaccine.id} style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                      <Ionicons name="medical" size={20} color={colors.vaccine} />
                      <Text style={styles.infoTitle}>{vaccine.label}</Text>
                    </View>
                    <Text style={styles.infoContent}>{vaccine.indication}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Symptômes et médicaments associés */}
            {symptoms.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="medkit" size={24} color={colors.medicine} style={{ marginRight: 10, marginTop: 2 }} />
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Symptômes et traitements</Text>
                </View>
                {symptoms.map((symptom) => {
                  const symptomMedicines = getMedicinesForSymptom(symptom.id);
                  return (
                    <View key={symptom.id} style={styles.infoCard}>
                      <TouchableOpacity
                        style={styles.symptomHeader}
                        onPress={() => toggleSymptomExpansion(symptom.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.symptomHeaderContent}>
                          <Ionicons name="medical" size={20} color={colors.medicine} />
                          <Text style={styles.infoTitle}>{symptom.label}</Text>
                          <View style={styles.medicineCount}>
                            <Text style={styles.medicineCountText}>
                              {symptomMedicines.length} médicament(s)
                            </Text>
                          </View>
                        </View>
                        <Ionicons 
                          name={expandedSymptoms[symptom.id] ? "chevron-up" : "chevron-down"} 
                          size={20} 
                          color={colors.gray[600]} 
                        />
                      </TouchableOpacity>
                      {expandedSymptoms[symptom.id] && (
                        <View style={styles.symptomContent}>
                          {symptomMedicines.map((medicine) => (
                            <View key={medicine.id} style={styles.medicineItem}>
                              <View style={styles.medicineItemHeader}>
                                <Ionicons name="fitness" size={16} color={colors.medicine} />
                                <Text style={styles.medicineItemTitle}>{medicine.label}</Text>
                              </View>
                              <Text style={styles.medicineItemContent}>{medicine.indication}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Ordonnances */}
            {cityData.ordonnances && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="briefcase" size={24} color={colors.medicine} style={{ marginRight: 10, marginTop: 2 }} />
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Validité des ordonnances</Text>
                </View>
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="document-text" size={20} color={colors.info} />
                    <Text style={styles.infoTitle}>Ordonnances françaises</Text>
                  </View>
                  <Text style={styles.infoContent}>{cityData.ordonnances}</Text>
                </View>
              </View>
            )}

            {/* Test VIH */}
            {cityData.test_vih && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="heart" size={24} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Test VIH et PrEP</Text>
                </View>
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="medical" size={20} color={colors.primary} />
                    <Text style={styles.infoTitle}>Centres de test</Text>
                  </View>
                  <Text style={styles.infoContent}>{cityData.test_vih}</Text>
                </View>
              </View>
            )}

            {/* Ambassade */}
            {cityData.ambassade && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="business" size={24} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Ambassade de France</Text>
                </View>
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="business" size={20} color={colors.primary} />
                    <Text style={styles.infoTitle}>Adresse</Text>
                  </View>
                  <Text style={styles.infoContent}>{cityData.ambassade}</Text>
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => handleOpenMaps(cityData.ambassade)}
                  >
                    <Ionicons name="map" size={16} color={colors.primary} />
                    <Text style={styles.mapButtonText}>Voir sur la carte</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Auberges de jeunesse */}
            {cityData.auberges && cityData.auberges.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bed" size={24} color={colors.secondary} style={{ marginRight: 10, marginTop: 2 }} />
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Auberges de jeunesse</Text>
                </View>
                {cityData.auberges.map((auberge, index) => (
                  <View key={index} style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                      <Ionicons name="bed" size={20} color={colors.secondary} />
                      <Text style={styles.infoTitle}>Auberge {index + 1}</Text>
                    </View>
                    <Text style={styles.infoContent}>{auberge}</Text>
                    <TouchableOpacity
                      style={styles.mapButton}
                      onPress={() => handleOpenMaps(auberge)}
                    >
                      <Ionicons name="map" size={16} color={colors.primary} />
                      <Text style={styles.mapButtonText}>Voir sur la carte</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Alertes épidémies */}
            {cityData.epidemies && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="warning" size={24} color={colors.danger} style={{ marginRight: 10, marginTop: 2 }} />
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Alertes épidémies</Text>
                </View>
                <View style={[styles.infoCard, styles.alertCard]}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="warning" size={20} color={colors.danger} />
                    <Text style={styles.infoTitle}>Alertes locales</Text>
                  </View>
                  <Text style={styles.infoContent}>{cityData.epidemies}</Text>
                </View>
              </View>
            )}

            {/* Fermetures */}
            {cityData.fermetures && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="close-circle" size={24} color={colors.danger} style={{ marginRight: 10, marginTop: 2 }} />
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Alertes fermetures</Text>
                </View>
                <View style={[styles.infoCard, styles.alertCard]}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="close-circle" size={20} color={colors.danger} />
                    <Text style={styles.infoTitle}>Fermetures locales</Text>
                  </View>
                  <Text style={styles.infoContent}>{cityData.fermetures}</Text>
                </View>
              </View>
            )}

            {/* Urgences */}
            {cityData.urgence && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="warning" size={24} color={colors.danger} style={{ marginRight: 10, marginTop: 2 }} />
                  <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Urgences</Text>
                </View>
                <View style={[styles.infoCard, styles.emergencyCard]}>
                  <View style={styles.infoHeader}>
                    <Ionicons name="call" size={20} color={colors.danger} />
                    <Text style={styles.infoTitle}>Numéro d'urgence</Text>
                  </View>
                  <Text style={styles.infoContent}>{cityData.urgence.numero}</Text>
                  {cityData.urgence.information_complementaire && (
                    <Text style={styles.infoSubtext}>{cityData.urgence.information_complementaire}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.emergencyButton}
                    onPress={handleCallEmergency}
                  >
                    <Ionicons name="call" size={16} color={colors.white} />
                    <Text style={styles.emergencyButtonText}>Appeler</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {/* Message si pas de données de ville */}
        {!cityData && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color={colors.info} style={{ marginRight: 10, marginTop: 2 }} />
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Informations de la ville</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
                <Text style={styles.infoTitle}>Informations de la ville</Text>
              </View>
              <Text style={styles.infoContent}>
                Aucune information spécifique disponible pour cette ville. 
                Les recommandations générales du pays s'appliquent.
              </Text>
            </View>
          </View>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
  },
  header: {
    position: 'relative',
    height: 200,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  countryText: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
  },
  tripInfo: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
  infoCard: {
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
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 8,
  },
  infoContent: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  infoSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  mapButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  emergencyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  testButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.info,
    borderRadius: 8,
  },
  testButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  weatherContent: {
    marginTop: 12,
  },
  weatherSection: {
    marginBottom: 16,
  },
  weatherLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 6,
  },
  weatherText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  medicineHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicineContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  symptomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  symptomHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicineCount: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  medicineCountText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  symptomContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  medicineItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  medicineItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  medicineItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 6,
  },
  medicineItemContent: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginLeft: 22,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  recommendationHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recommendationContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
});