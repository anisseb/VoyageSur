import { countryService, cityService } from './services/firebaseService';

// Test des services de pays et villes
const testFirebaseData = async () => {
  console.log('=== Test des services Firebase ===');
  
  try {
    // Test 1: Récupérer tous les pays
    console.log('\n1. Récupération de tous les pays...');
    const countries = await countryService.getAll();
    console.log(`✅ ${countries.length} pays trouvés:`);
    countries.slice(0, 5).forEach(country => {
      console.log(`   - ${country.name} (ID: ${country.id}, Code: ${country.code})`);
    });
    if (countries.length > 5) {
      console.log(`   ... et ${countries.length - 5} autres pays`);
    }

    // Test 2: Si des pays existent, tester les villes du premier pays
    if (countries.length > 0) {
      const firstCountry = countries[0];
      console.log(`\n2. Récupération des villes pour ${firstCountry.name} (ID: ${firstCountry.id})...`);
      
      const cities = await cityService.getByCountryId(firstCountry.id);
      console.log(`✅ ${cities.length} villes trouvées pour ${firstCountry.name}:`);
      cities.slice(0, 5).forEach(city => {
        console.log(`   - ${city.name} (ID: ${city.id})`);
      });
      if (cities.length > 5) {
        console.log(`   ... et ${cities.length - 5} autres villes`);
      }
    }

    // Test 3: Test avec un ID de pays spécifique (exemple)
    console.log('\n3. Test avec un ID de pays spécifique...');
    const testCountryId = 'france'; // Remplacez par un ID réel de votre base
    const testCities = await cityService.getByCountryId(testCountryId);
    console.log(`✅ ${testCities.length} villes trouvées pour l'ID "${testCountryId}"`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Détails de l\'erreur:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 Suggestion: Vérifiez vos règles Firestore pour les collections "pays" et "villes"');
    }
  }
};

// Exporter la fonction pour l'utiliser dans l'app
export { testFirebaseData };

// Si ce fichier est exécuté directement
if (typeof window !== 'undefined') {
  // Dans un environnement React Native
  window.testFirebaseData = testFirebaseData;
} 