import AsyncStorage from '@react-native-async-storage/async-storage';

interface WeatherRequest {
  city: string;
  startDate: Date;
  endDate: Date;
}

interface WeatherResponse {
  city: string;
  startDate: string;
  endDate: string;
  weather: string;
  temperature: string;
  conditions: string;
  recommendations: string[];
}

interface CachedWeatherData {
  data: WeatherResponse;
  timestamp: number;
  lastUpdated: string; // Date de dernière mise à jour
}

class WeatherService {
  private apiKey: string;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 1000; // 1 seconde
  private readonly STORAGE_KEY_PREFIX = 'weather_cache_';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_MISTRAL_API_KEY || '';
  }

  async getWeatherForTrip(request: WeatherRequest): Promise<WeatherResponse | null> {
    try {
      if (!this.apiKey) {
        console.error('Clé API Mistral manquante');
        return null;
      }

      const startDateStr = request.startDate.toLocaleDateString('fr-FR');
      const endDateStr = request.endDate.toLocaleDateString('fr-FR');
      
      // Vérifier le cache AsyncStorage
      const cacheKey = `${this.STORAGE_KEY_PREFIX}${request.city}-${startDateStr}-${endDateStr}`;
      const cachedData = await this.getCachedData(cacheKey);
      
      if (cachedData && this.isCacheValid(cachedData.timestamp)) {
        console.log('Données météo récupérées du cache AsyncStorage');
        return cachedData.data;
      }

      const prompt = `Tu es un expert météorologue. Donne-moi les informations météorologiques pour ${request.city} du ${startDateStr} au ${endDateStr}.

    Réponds au format JSON suivant :
    {
      "city": "${request.city}",
      "startDate": "${startDateStr}",
      "endDate": "${endDateStr}",
      "weather": "Résumé général des conditions météo",
      "temperature": "Températures moyennes (min/max)",
      "conditions": "Conditions détaillées (pluie, soleil, vent, etc.)",
      "recommendations": [
          "Recommandation 1 pour les voyageurs",
          "Recommandation 2 pour les voyageurs",
          "Recommandation 3 pour les voyageurs"
      ]
    }

  Sois précis et donne des informations utiles pour les voyageurs.`;

      // Fonction pour faire l'appel API avec retry
      const makeApiCall = async (retryCount: number = 0): Promise<Response> => {
        try {
          const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model: 'mistral-large-latest',
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ],
              max_tokens: 10000,
              temperature: 0.3,
              response_format: { type: "json_object" }
            })
          });

          if (response.status === 429 && retryCount < this.MAX_RETRIES) {
            console.log(`Tentative ${retryCount + 1} échouée (429), nouvelle tentative dans ${this.RETRY_DELAY}ms`);
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * (retryCount + 1)));
            return makeApiCall(retryCount + 1);
          }

          return response;
        } catch (error) {
          if (retryCount < this.MAX_RETRIES) {
            console.log(`Erreur réseau, nouvelle tentative ${retryCount + 1}/${this.MAX_RETRIES}`);
            await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * (retryCount + 1)));
            return makeApiCall(retryCount + 1);
          }
          throw error;
        }
      };

      const response = await makeApiCall();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de requêtes API dépassée. Veuillez réessayer plus tard.');
        } else if (response.status === 401) {
          throw new Error('Clé API invalide ou manquante.');
        } else if (response.status === 403) {
          throw new Error('Accès refusé à l\'API.');
        } else {
          throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Réponse API invalide');
      }

      // Essayer de parser le JSON de la réponse
      try {
        const weatherData = JSON.parse(content);
        
        // Mettre en cache les données dans AsyncStorage
        await this.saveCachedData(cacheKey, weatherData);
        
        return weatherData as WeatherResponse;
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError);
        // Si le parsing échoue, créer une réponse basique
        const fallbackData = {
          city: request.city,
          startDate: startDateStr,
          endDate: endDateStr,
          weather: content,
          temperature: 'Information non disponible',
          conditions: 'Information non disponible',
          recommendations: ['Consultez un service météo local pour des informations précises']
        };
        
        // Mettre en cache même les données de fallback
        await this.saveCachedData(cacheKey, fallbackData);
        
        return fallbackData;
      }

    } catch (error) {
      console.error('Erreur lors de la récupération de la météo:', error);
      return null;
    }
  }

  // Méthode pour récupérer les données du cache AsyncStorage
  private async getCachedData(key: string): Promise<CachedWeatherData | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }

  // Méthode pour sauvegarder les données dans le cache AsyncStorage
  private async saveCachedData(key: string, data: WeatherResponse): Promise<void> {
    try {
      const cachedData: CachedWeatherData = {
        data,
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem(key, JSON.stringify(cachedData));
      console.log('Données météo sauvegardées dans AsyncStorage');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error);
    }
  }

  // Méthode pour vérifier si le cache est encore valide
  private isCacheValid(timestamp: number): boolean {
    return (Date.now() - timestamp) < this.CACHE_DURATION;
  }

  // Méthode pour formater les données météo pour l'affichage
  formatWeatherForDisplay(weatherData: WeatherResponse) {
    return {
      summary: weatherData.weather,
      temperature: weatherData.temperature,
      conditions: weatherData.conditions,
      recommendations: weatherData.recommendations
    };
  }

  // Méthode pour vider le cache
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const weatherKeys = keys.filter(key => key.startsWith(this.STORAGE_KEY_PREFIX));
      await AsyncStorage.multiRemove(weatherKeys);
      console.log('Cache météo vidé');
    } catch (error) {
      console.error('Erreur lors du vidage du cache:', error);
    }
  }

  // Méthode pour obtenir les statistiques du cache
  async getCacheStats(): Promise<{ size: number; keys: string[] }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const weatherKeys = keys.filter(key => key.startsWith(this.STORAGE_KEY_PREFIX));
      return {
        size: weatherKeys.length,
        keys: weatherKeys
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats du cache:', error);
      return { size: 0, keys: [] };
    }
  }

  // Méthode pour nettoyer le cache expiré
  async cleanExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const weatherKeys = keys.filter(key => key.startsWith(this.STORAGE_KEY_PREFIX));
      
      for (const key of weatherKeys) {
        const cachedData = await this.getCachedData(key);
        if (cachedData && !this.isCacheValid(cachedData.timestamp)) {
          await AsyncStorage.removeItem(key);
          console.log(`Cache expiré supprimé: ${key}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
    }
  }
}

export const weatherService = new WeatherService();
export type { WeatherRequest, WeatherResponse }; 