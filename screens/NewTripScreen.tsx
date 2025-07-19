import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { travelPlanService, countryService, cityService } from '../services/firebaseService';
import { purchaseService } from '../services/purchaseService';
import { useAuth } from '../contexts/AuthContext';

interface NewTripScreenProps {
  navigation: any;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

interface City {
  id: string;
  name: string;
  countryId: string;
}

export default function NewTripScreen({ navigation }: NewTripScreenProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    countryId: '',
    countryName: '',
    cityId: '',
    cityName: '',
    startDate: new Date(),
    endDate: new Date(),
    travelType: 'leisure',
    travelers: 1,
  });

  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [countrySearchText, setCountrySearchText] = useState('');

  // États pour les modals
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showTravelTypeModal, setShowTravelTypeModal] = useState(false);
  const [showTravelersModal, setShowTravelersModal] = useState(false);

  // États pour les DatePickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const travelTypes = [
    { label: 'Tourisme', value: 'tourism' },
    { label: 'Affaires', value: 'business' },
    { label: 'Backpacking', value: 'backpacking' },
    { label: 'Voyage de noces', value: 'wedding' },
    { label: 'Voyage de famille', value: 'family' },
    { label: 'Voyage de groupe', value: 'group' },
    { label: 'Voyage de couple', value: 'couple' },
    { label: 'Voyage de solitaire', value: 'solitary' },
    { label: 'Voyage de jeunesse', value: 'youth' },
    { label: 'Voyage de seniors', value: 'seniors' },
  ];

  const travelersOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Charger les pays au montage du composant
  useEffect(() => {
    loadCountries();
  }, []);

  // Charger les villes quand un pays est sélectionné
  useEffect(() => {
    if (formData.countryId) {
      loadCities(formData.countryId);
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, cityId: '', cityName: '' }));
    }
  }, [formData.countryId]);

  // Filtrer les pays quand le texte de recherche change
  useEffect(() => {
    if (countrySearchText.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(countrySearchText.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [countrySearchText, countries]);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      const countriesData = await countryService.getAll();
      // Trier les pays par ordre alphabétique
      const sortedCountries = countriesData.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      setCountries(sortedCountries);
      setFilteredCountries(sortedCountries);
    } catch (error) {
      console.error('Erreur lors du chargement des pays:', error);
      Alert.alert('Erreur', 'Impossible de charger les pays. Veuillez réessayer.');
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadCities = async (countryId: string) => {
    try {
      setLoadingCities(true);
      const citiesData = await cityService.getByCountryId(countryId);
      setCities(citiesData);
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error);
      Alert.alert('Erreur', 'Impossible de charger les villes. Veuillez réessayer.');
    } finally {
      setLoadingCities(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCountrySelect = (country: Country) => {
    setFormData(prev => ({
      ...prev,
      countryId: country.id,
      countryName: country.name,
      cityId: '',
      cityName: '',
    }));
    setShowCountryModal(false);
    setCountrySearchText(''); // Réinitialiser la recherche
  };

  const handleCitySelect = (city: City) => {
    setFormData(prev => ({
      ...prev,
      cityId: city.id,
      cityName: city.name,
    }));
    setShowCityModal(false);
  };

  const handleTravelTypeSelect = (type: { label: string; value: string }) => {
    setFormData(prev => ({
      ...prev,
      travelType: type.value,
    }));
    setShowTravelTypeModal(false);
  };

  const handleTravelersSelect = (count: number) => {
    setFormData(prev => ({
      ...prev,
      travelers: count,
    }));
    setShowTravelersModal(false);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        startDate: selectedDate,
      }));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        endDate: selectedDate,
      }));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR');
  };

  const validateForm = () => {
    if (!formData.countryId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un pays');
      return false;
    }

    // Validation des dates
    const startDate = formData.startDate;
    const endDate = formData.endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      Alert.alert('Erreur', 'La date de départ ne peut pas être dans le passé');
      return false;
    }
    if (endDate <= startDate) {
      Alert.alert('Erreur', 'La date de retour doit être après la date de départ');
      return false;
    }

    return true;
  };

  const handleCreateTrip = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const startDate = formData.startDate;
      const endDate = formData.endDate;
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      const newTrip = {
        userId: user?.uid || '',
        destination: formData.cityName || formData.countryName, // Utilise la ville ou le pays comme destination
        country: formData.countryName,
        countryId: formData.countryId,
        city: formData.cityName,
        cityId: formData.cityId,
        startDate,
        endDate,
        duration,
        travelType: formData.travelType as any,
        travelers: formData.travelers,
      };

      const tripId = await travelPlanService.create(newTrip);
      
      // Décrémenter la quantité d'achat unique si l'utilisateur n'est pas premium
      const isPremium = await purchaseService.isPremium();
      if (!isPremium) {
        await purchaseService.decrementSingleTripQuantity();
      }
      
      Alert.alert(
        'Succès',
        'Voyage créé avec succès !',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('TripDetails', { tripId, fromNewTrip: true }),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la création du voyage:', error);
      Alert.alert('Erreur', 'Impossible de créer le voyage. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderModalItem = ({ item, onPress, isSelected }: { item: any; onPress: () => void; isSelected: boolean }) => (
    <TouchableOpacity
      style={[styles.modalItem, isSelected && styles.modalItemSelected]}
      onPress={onPress}
    >
      <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
        {item.label || item.name || item.toString()}
      </Text>
      {isSelected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Check santé de voyage</Text>
          <Text style={styles.subtitle}>
            Remplissez les informations de votre voyage pour acceder a votre plan de santé
          </Text>
        </View>

        <View style={styles.form}>
          {/* Pays */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pays *</Text>
            <TouchableOpacity
              style={styles.selectorContainer}
              onPress={() => setShowCountryModal(true)}
              disabled={loadingCountries}
            >
              {loadingCountries ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Chargement des pays...</Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.selectorText, !formData.countryName && styles.selectorPlaceholder]}>
                    {formData.countryName || 'Sélectionnez un pays'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Ville */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ville (optionnel)</Text>
            <TouchableOpacity
              style={[styles.selectorContainer, !formData.countryId && styles.selectorDisabled]}
              onPress={() => formData.countryId && setShowCityModal(true)}
              disabled={!formData.countryId || loadingCities}
            >
              {!formData.countryId ? (
                <Text style={styles.selectorPlaceholder}>Sélectionnez d'abord un pays</Text>
              ) : loadingCities ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Chargement des villes...</Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.selectorText, !formData.cityName && styles.selectorPlaceholder]}>
                    {formData.cityName || 'Sélectionnez une ville (optionnel)'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Dates */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date de départ *</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={formData.startDate}
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                  minimumDate={new Date()}
                />
              ) : (
                <TouchableOpacity
                  style={styles.dateSelectorContainer}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateSelectorText}>
                    {formatDate(formData.startDate)}
                  </Text>
                  <Ionicons name="calendar" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date de retour *</Text>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={formData.endDate}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                  minimumDate={formData.startDate}
                />
              ) : (
                <TouchableOpacity
                  style={styles.dateSelectorContainer}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateSelectorText}>
                    {formatDate(formData.endDate)}
                  </Text>
                  <Ionicons name="calendar" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Type de voyage */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type de voyage</Text>
            <TouchableOpacity
              style={styles.selectorContainer}
              onPress={() => setShowTravelTypeModal(true)}
            >
              <Text style={styles.selectorText}>
                {travelTypes.find(t => t.value === formData.travelType)?.label || 'Sélectionnez un type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Nombre de voyageurs */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de voyageurs</Text>
            <TouchableOpacity
              style={styles.selectorContainer}
              onPress={() => setShowTravelersModal(true)}
            >
              <Text style={styles.selectorText}>
                {formData.travelers.toString()}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Bouton de création */}
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateTrip}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={24} color={colors.white} />
            <Text style={styles.createButtonText}>
              {loading ? 'Création...' : 'Créer le Voyage'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Pays */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner un pays</Text>
              <TouchableOpacity onPress={() => {
                setShowCountryModal(false);
                setCountrySearchText(''); // Réinitialiser la recherche
              }}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            {/* Champ de recherche */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.text.secondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un pays..."
                value={countrySearchText}
                onChangeText={setCountrySearchText}
                placeholderTextColor={colors.text.secondary}
              />
              {countrySearchText.length > 0 && (
                <TouchableOpacity onPress={() => setCountrySearchText('')}>
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderModalItem({
                item,
                onPress: () => handleCountrySelect(item),
                isSelected: formData.countryId === item.id
              })}
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Ville */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une ville</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={cities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderModalItem({
                item,
                onPress: () => handleCitySelect(item),
                isSelected: formData.cityId === item.id
              })}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Modal Type de voyage */}
      <Modal
        visible={showTravelTypeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTravelTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Type de voyage</Text>
              <TouchableOpacity onPress={() => setShowTravelTypeModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={travelTypes}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => renderModalItem({
                item,
                onPress: () => handleTravelTypeSelect(item),
                isSelected: formData.travelType === item.value
              })}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Modal Nombre de voyageurs */}
      <Modal
        visible={showTravelersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTravelersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nombre de voyageurs</Text>
              <TouchableOpacity onPress={() => setShowTravelersModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={travelersOptions}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => renderModalItem({
                item,
                onPress: () => handleTravelersSelect(item),
                isSelected: formData.travelers === item
              })}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* DatePickers - Android uniquement */}
      {Platform.OS === 'android' && showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {Platform.OS === 'android' && showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={formData.startDate}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  form: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: colors.white,
    height: 45,
  },
  selectorContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 45,
  },
  selectorText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  selectorPlaceholder: {
    color: colors.text.secondary,
  },
  selectorDisabled: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  createButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 10,
    color: colors.text.secondary,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    width: '90%',
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.gray[50],
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 8,
  },
  modalList: {
    maxHeight: 300,
    minHeight: 100,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemSelected: {
    backgroundColor: colors.gray[100],
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  modalItemTextSelected: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  dateSelectorContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 45,
  },
  dateSelectorText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
}); 