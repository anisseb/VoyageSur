import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecommendationRequest {
  city: string;
  country: string;
  startDate: Date;
  endDate: Date;
  travelers: number;
  travelType: string;
  duration: number;
}

export interface RecommendationResponse {
  city: string;
  country: string;
  generalAdvice: string;
  healthTips: string;
  safetyTips: string;
  culturalTips: string;
  packingTips: string;
  localCustoms: string;
  emergencyInfo: string;
  recommendations: string[];
  timestamp: number;
}

class RecommendationService {
  private readonly API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY;
  private readonly BASE_URL = 'https://api.mistral.ai/v1/chat/completions';
  private readonly CACHE_PREFIX = 'recommendation_cache_';
  private readonly CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 jours en millisecondes

  /**
   * Génère une clé de cache unique pour une demande de recommandation
   */
  private generateCacheKey(request: RecommendationRequest): string {
    const key = `${request.city}_${request.country}_${request.startDate.toISOString().split('T')[0]}_${request.duration}_${request.travelType}`;
    return this.CACHE_PREFIX + key.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Vérifie si les données en cache sont encore valides
   */
  private isCacheValid(timestamp: number): boolean {
    const now = Date.now();
    return (now - timestamp) < this.CACHE_DURATION;
  }

  /**
   * Nettoie le cache expiré
   */
  async cleanExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (!this.isCacheValid(parsed.timestamp)) {
            await AsyncStorage.removeItem(key);
            console.log(`Cache expiré supprimé: ${key}`);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
    }
  }

  /**
   * Génère le prompt pour l'IA Mistral
   */
  private generatePrompt(request: RecommendationRequest): string {
    return `Tu es un expert en voyages et santé internationale. Génère des recommandations personnalisées pour un voyage à ${request.city}, ${request.country}.

Détails du voyage:
- Ville: ${request.city}, ${request.country}
- Dates: ${request.startDate.toLocaleDateString('fr-FR')} au ${request.endDate.toLocaleDateString('fr-FR')}
- Durée: ${request.duration} jours
- Nombre de voyageurs: ${request.travelers}
- Type de voyage: ${request.travelType}

Génère une réponse JSON structurée avec les sections suivantes:

{
  "generalAdvice": "Conseils généraux pour ce voyage",
  "healthTips": "Conseils de santé spécifiques à cette destination",
  "safetyTips": "Conseils de sécurité pour ${request.city}",
  "culturalTips": "Conseils culturels et bonnes pratiques locales",
  "packingTips": "Conseils pour la valise selon la durée et le type de voyage",
  "localCustoms": "Coutumes locales importantes à connaître",
  "emergencyInfo": "Informations d'urgence spécifiques à la région",
  "recommendations": [
    "Recommandation 1",
    "Recommandation 2",
    "Recommandation 3"
  ]
}

Sois précis, pratique et adapté au contexte du voyage. Inclus des conseils spécifiques à la destination et au type de voyage.`;
  }

  /**
   * Appelle l'API Mistral pour obtenir des recommandations
   */
  private async callMistralAPI(prompt: string): Promise<RecommendationResponse> {
    if (!this.API_KEY) {
      throw new Error('Clé API Mistral non configurée. Veuillez définir EXPO_PUBLIC_MISTRAL_API_KEY.');
    }

    const response = await fetch(this.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Limite de requêtes API atteinte. Veuillez réessayer plus tard.');
      } else if (response.status === 401) {
        throw new Error('Clé API Mistral invalide.');
      } else {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Réponse API invalide');
    }

    try {
      // Essayer de parser le JSON de la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          city: '',
          country: '',
          timestamp: Date.now()
        };
      } else {
        // Si pas de JSON valide, créer une réponse structurée
        return {
          city: '',
          country: '',
          generalAdvice: content,
          healthTips: 'Recommandations de santé génériques',
          safetyTips: 'Conseils de sécurité génériques',
          culturalTips: 'Conseils culturels génériques',
          packingTips: 'Conseils de valise génériques',
          localCustoms: 'Coutumes locales génériques',
          emergencyInfo: 'Informations d\'urgence génériques',
          recommendations: ['Recommandation générique'],
          timestamp: Date.now()
        };
      }
    } catch (parseError) {
      console.error('Erreur lors du parsing de la réponse:', parseError);
      throw new Error('Format de réponse invalide de l\'API');
    }
  }

  /**
   * Obtient des recommandations pour un voyage (avec cache)
   */
  async getRecommendationsForTrip(request: RecommendationRequest): Promise<RecommendationResponse> {
    try {
      const cacheKey = this.generateCacheKey(request);
      
      // Vérifier le cache
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (this.isCacheValid(parsed.timestamp)) {
          console.log('Recommandations récupérées depuis le cache');
          return {
            ...parsed,
            city: request.city,
            country: request.country
          };
        }
      }

      // Générer de nouvelles recommandations
      console.log('Génération de nouvelles recommandations via Mistral API');
      const prompt = this.generatePrompt(request);
      const recommendations = await this.callMistralAPI(prompt);
      
      // Ajouter les informations du voyage
      const fullResponse: RecommendationResponse = {
        ...recommendations,
        city: request.city,
        country: request.country,
        timestamp: Date.now()
      };

      // Sauvegarder en cache
      await AsyncStorage.setItem(cacheKey, JSON.stringify(fullResponse));
      console.log('Recommandations sauvegardées en cache');

      return fullResponse;
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      
      // En cas d'erreur, retourner des recommandations par défaut
      return {
        city: request.city,
        country: request.country,
        generalAdvice: 'Consultez votre médecin avant le départ et vérifiez les recommandations sanitaires pour cette destination.',
        healthTips: 'Emportez une trousse de premiers soins et vos médicaments habituels.',
        safetyTips: 'Informez-vous sur la situation locale et gardez vos documents en sécurité.',
        culturalTips: 'Respectez les coutumes locales et habillez-vous de manière appropriée.',
        packingTips: 'Adaptez votre valise à la durée du séjour et au climat local.',
        localCustoms: 'Renseignez-vous sur les usages locaux avant votre départ.',
        emergencyInfo: 'Notez les numéros d\'urgence locaux et l\'adresse de l\'ambassade.',
        recommendations: [
          'Consultez les recommandations sanitaires officielles',
          'Vérifiez la validité de vos documents de voyage',
          'Souscrivez une assurance voyage adaptée'
        ],
        timestamp: Date.now()
      };
    }
  }

  /**
   * Supprime le cache pour une destination spécifique
   */
  async clearCacheForDestination(city: string, country: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const targetKeys = keys.filter(key => 
        key.includes(city.replace(/[^a-zA-Z0-9]/g, '_')) && 
        key.includes(country.replace(/[^a-zA-Z0-9]/g, '_'))
      );
      
      for (const key of targetKeys) {
        await AsyncStorage.removeItem(key);
        console.log(`Cache supprimé pour: ${key}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
    }
  }

  /**
   * Supprime tout le cache des recommandations
   */
  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      for (const key of cacheKeys) {
        await AsyncStorage.removeItem(key);
      }
      console.log('Tout le cache des recommandations a été supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
    }
  }
}

export const recommendationService = new RecommendationService(); 