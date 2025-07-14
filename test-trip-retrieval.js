// Script de test pour vérifier la création et récupération des voyages
import { travelPlanService } from './services/firebaseService';

const testTripRetrieval = async () => {
  try {
    console.log('=== Test de création et récupération de voyage ===');
    
    // Créer un voyage de test
    const testTrip = {
      userId: 'test-user-123',
      destination: 'Bangkok',
      country: 'Thaïlande',
      countryId: 'thailand-id',
      city: 'Bangkok',
      cityId: 'bangkok-id',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-07'),
      duration: 7,
      travelType: 'leisure',
      travelers: 2,
    };

    console.log('Création du voyage de test...');
    const tripId = await travelPlanService.create(testTrip);
    console.log('Voyage créé avec ID:', tripId);

    // Récupérer le voyage
    console.log('Récupération du voyage...');
    const retrievedTrip = await travelPlanService.getById('test-user-123', tripId);
    console.log('Voyage récupéré:', retrievedTrip);

    if (retrievedTrip) {
      console.log('✅ Test réussi ! Le voyage a été créé et récupéré correctement.');
    } else {
      console.log('❌ Test échoué ! Le voyage n\'a pas été trouvé.');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
};

// Exporter pour utilisation dans l'app
export { testTripRetrieval }; 