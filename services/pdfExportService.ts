import { TravelPlan } from '../types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface TripDetailsData {
  trip: TravelPlan;
  cityData: {
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
  } | null;
  vaccines: Array<{
    id: string;
    label: string;
    indication: string;
  }>;
  medicines: Array<{
    id: string;
    label: string;
    indication: string;
    symptomes?: string[];
  }>;
  symptoms: Array<{
    id: string;
    label: string;
  }>;
  weatherData: {
    city: string;
    weather: string;
    temperature: string;
    conditions: string;
    recommendations?: string[];
  } | null;
  recommendationData: {
    generalAdvice: string;
    safetyTips: string;
    culturalTips: string;
    packingTips: string;
    localCustoms: string;
    recommendations?: string[];
  } | null;
}

class PDFExportService {
  /**
   * Exporte toutes les données du voyage en PDF
   */
  async exportTripToPDF(tripData: TripDetailsData): Promise<string> {
    try {
      console.log('Début de l\'export PDF pour le voyage:', tripData.trip.id);
      
      // Créer le contenu HTML du PDF
      const htmlContent = this.generateHTMLContent(tripData);
      
      // Générer le nom du fichier : pays-ville-date
      const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      };
      
      const fileName = `${tripData.trip.country}-${tripData.cityData?.nom || tripData.trip.city}-${formatDate(new Date())}`;
      
      // Générer le PDF avec expo-print
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      
      console.log('PDF généré avec succès:', uri);
      return uri;
      
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }

  /**
   * Génère le contenu HTML pour le PDF
   */
  private generateHTMLContent(tripData: TripDetailsData): string {
    const { trip, cityData, vaccines, medicines, symptoms, weatherData, recommendationData } = tripData;
    
    const formatDate = (date: any): string => {
      if (!date) return 'Date non disponible';
      if (typeof date === 'string') {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleDateString('fr-FR');
        }
        return date;
      }
      if (date instanceof Date) {
        return date.toLocaleDateString('fr-FR');
      }
      if (typeof date === 'number') {
        return new Date(date).toLocaleDateString('fr-FR');
      }
      return 'Date non disponible';
    };

    const getTravelTypeLabel = (travelType: string): string => {
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
      
      const found = travelTypes.find(t => t.value === travelType);
      return found ? found.label : travelType;
    };

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <title>Détails du voyage - ${cityData?.nom || trip.city || trip.country}</title>
    <style>
        @page {
            margin: 0;
            @top-left {
                content: element(header);
            }
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
            margin-top: 80px;
        }
        .header {
            position: running(header);
            text-align: left;
            padding: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 100%;
            height: 60px;
            display: table;
            table-layout: fixed;
            border-collapse: collapse;
            border-spacing: 0;
        }
        .header-row {
            display: table-row;
        }
        .header-cell {
            display: table-cell;
            vertical-align: middle;
            padding: 10px;
            margin: 0;
            width: 40px;
        }
        .header-text {
            display: table-cell;
            vertical-align: middle;
            padding: 0;
            margin: 0;
            text-align: left;
            font-size: 14px;
            color: white;
        }
        .header img {
            width: 100px;
            height: 100px;
            margin-right: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
            color: #667eea;
        }
        .main-title {
            font-size: 36px;
            font-weight: bold;
            margin: 30px 0;
            text-align: center;
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .info-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #667eea;
        }
        .info-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .info-content {
            color: #666;
            white-space: normal;
            word-wrap: break-word;
        }
        .trip-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        .trip-info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .trip-info-label {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        .vaccine-list, .medicine-list, .symptom-list {
            list-style: none;
            padding: 0;
        }
        .vaccine-list li, .medicine-list li, .symptom-list li {
            background: #f8f9fa;
            margin-bottom: 10px;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
            white-space: normal;
            word-wrap: break-word;
        }
        .emergency-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
        }
        .emergency-title {
            color: #856404;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .weather-info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
        }
        .recommendation-section {
            background: #e2e3e5;
            border: 1px solid #d6d8db;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
        }
        .key-points {
            margin-top: 12px;
            margin-left: 20px;
        }
        .key-point {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            white-space: normal;
            word-wrap: break-word;
        }
        .key-point::before {
            content: "•";
            color: #667eea;
            margin-right: 8px;
        }
        .page-break {
            page-break-before: always;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        p {
            margin: 0;
            padding: 0;
            display: inline;
            white-space: normal;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-cell">
            <img src="https://voyage-sur.fr/wp-content/uploads/2025/07/Voyage-Sur-logo-1024-x-1024-px-120-x-120-px-512-x-512-px.png" alt="VoyageSur Logo" />
        </div>
    </div>

    <div class="main-title">Voyage Sûr</div>
    <div class="title">Détails du voyage - ${cityData?.nom || trip.city || trip.country}</div>

    <!-- Informations du voyage -->
    <div class="section">
        <h2 class="section-title">📋 Informations du voyage</h2>
        <div class="trip-info">
            <div class="trip-info-item">
                <div class="trip-info-label">📅 Dates</div>
                <div class="info-content">${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</div>
            </div>
            <div class="trip-info-item">
                <div class="trip-info-label">⏱️ Durée</div>
                <div class="info-content">${trip.duration} jours</div>
            </div>
            <div class="trip-info-item">
                <div class="trip-info-label">👥 Voyageurs</div>
                <div class="info-content">${trip.travelers} personne(s)</div>
            </div>
            <div class="trip-info-item">
                <div class="trip-info-label">💼 Type de voyage</div>
                <div class="info-content">${getTravelTypeLabel(trip.travelType)}</div>
            </div>
        </div>
    </div>

    ${cityData ? `
    <!-- Météo -->
    ${weatherData ? `
    <div class="section">
        <h2 class="section-title">🌤️ Météo</h2>
        <div class="weather-info">
            <div class="info-title">Météo pour ${weatherData.city}</div>
            <div class="info-content">
                <strong>Résumé:</strong> ${weatherData.weather}<br>
                <strong>Températures:</strong> ${weatherData.temperature}<br>
                <strong>Conditions:</strong> ${weatherData.conditions}
            </div>
            ${weatherData.recommendations && weatherData.recommendations.length > 0 ? `
            <div class="key-points">
                <strong>Recommandations météo:</strong>
                ${weatherData.recommendations.map(rec => `
                <div class="key-point">${rec}</div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    <!-- Recommandations IA -->
    ${recommendationData ? `
    <div class="page-break"></div>
    <div class="header">
        <div class="header-cell">
            <img src="https://voyage-sur.fr/wp-content/uploads/2025/07/Voyage-Sur-logo-1024-x-1024-px-120-x-120-px-512-x-512-px.png" alt="VoyageSur Logo" />
        </div>
    </div>
    
    <div class="main-title">Voyage Sûr</div>
    
    <div class="section">
        <h2 class="section-title">🤖 Recommandations IA</h2>
        
        <div class="recommendation-section">
            <div class="info-title">💡 Conseils généraux</div>
            <div class="info-content">${recommendationData.generalAdvice}</div>
        </div>
        
        <div class="recommendation-section">
            <div class="info-title">🛡️ Conseils de sécurité</div>
            <div class="info-content">${recommendationData.safetyTips}</div>
        </div>
        
        <div class="recommendation-section">
            <div class="info-title">👥 Conseils culturels</div>
            <div class="info-content">${recommendationData.culturalTips}</div>
        </div>
        
        <div class="recommendation-section">
            <div class="info-title">🧳 Conseils pour la valise</div>
            <div class="info-content">${recommendationData.packingTips}</div>
        </div>
        
        <div class="recommendation-section">
            <div class="info-title">🌍 Coutumes locales</div>
            <div class="info-content">${recommendationData.localCustoms}</div>
        </div>
        
        ${recommendationData.recommendations && recommendationData.recommendations.length > 0 ? `
        <div class="recommendation-section">
            <div class="info-title">✅ Recommandations spécifiques</div>
            <div class="key-points">
                ${recommendationData.recommendations.map(rec => `
                <div class="key-point">${rec}</div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <!-- Vaccins recommandés -->
    ${vaccines.length > 0 ? `
    <div class="page-break"></div>
    <div class="header">
        <div class="header-cell">
            <img src="https://voyage-sur.fr/wp-content/uploads/2025/07/Voyage-Sur-logo-1024-x-1024-px-120-x-120-px-512-x-512-px.png" alt="VoyageSur Logo" />
        </div>
    </div>
    
    <div class="main-title">Voyage Sûr</div>
    
    <div class="section">
        <h2 class="section-title">💉 Vaccins recommandés</h2>
        <ul class="vaccine-list">
            ${vaccines.map(vaccine => `
            <li>
                <div class="info-title">${vaccine.label}</div>
                <div class="info-content">${vaccine.indication}</div>
            </li>
            `).join('')}
        </ul>
    </div>
    ` : ''}

    <!-- Symptômes et traitements -->
    ${symptoms.length > 0 ? `
    <div class="section">
        <h2 class="section-title">💊 Symptômes et traitements</h2>
        <ul class="symptom-list">
            ${symptoms.map(symptom => {
                const symptomMedicines = medicines.filter(medicine => 
                    medicine.symptomes && medicine.symptomes.includes(symptom.id)
                );
                return `
                <li>
                    <div class="info-title">${symptom.label}</div>
                    ${symptomMedicines.length > 0 ? `
                    <div style="margin-top: 10px;">
                        <strong>Médicaments associés:</strong>
                        ${symptomMedicines.map(medicine => `
                        <div style="margin-left: 20px; margin-top: 5px;">
                            <strong>${medicine.label}:</strong> ${medicine.indication}
                        </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </li>
                `;
            }).join('')}
        </ul>
    </div>
    ` : ''}

    <!-- Ordonnances -->
    ${cityData.ordonnances ? `
    <div class="section">
        <h2 class="section-title">📋 Validité des ordonnances</h2>
        <div class="info-card">
            <div class="info-title">Ordonnances françaises</div>
            <div class="info-content">${cityData.ordonnances}</div>
        </div>
    </div>
    ` : ''}

    <!-- Test VIH -->
    ${cityData.test_vih ? `
    <div class="section">
        <h2 class="section-title">❤️ Test VIH et PrEP</h2>
        <div class="info-card">
            <div class="info-title">Centres de test</div>
            <div class="info-content">${cityData.test_vih}</div>
        </div>
    </div>
    ` : ''}

    <!-- Ambassade -->
    ${cityData.ambassade ? `
    <div class="section">
        <h2 class="section-title">🏛️ Ambassade de France</h2>
        <div class="info-card">
            <div class="info-title">Adresse</div>
            <div class="info-content">${cityData.ambassade}</div>
        </div>
    </div>
    ` : ''}

    <!-- Auberges de jeunesse -->
    ${cityData.auberges && cityData.auberges.length > 0 ? `
    <div class="section">
        <h2 class="section-title">🏨 Auberges de jeunesse</h2>
        ${cityData.auberges.map((auberge, index) => `
        <div class="info-card">
            <div class="info-title">Auberge ${index + 1}</div>
            <div class="info-content">${auberge}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <!-- Alertes épidémies -->
    ${cityData.epidemies ? `
    <div class="section">
        <h2 class="section-title">⚠️ Alertes épidémies</h2>
        <div class="emergency-info">
            <div class="emergency-title">Alertes locales</div>
            <div class="info-content">${cityData.epidemies}</div>
        </div>
    </div>
    ` : ''}

    <!-- Fermetures -->
    ${cityData.fermetures ? `
    <div class="section">
        <h2 class="section-title">🚫 Alertes fermetures</h2>
        <div class="emergency-info">
            <div class="emergency-title">Fermetures locales</div>
            <div class="info-content">${cityData.fermetures}</div>
        </div>
    </div>
    ` : ''}

    <!-- Urgences -->
    ${cityData.urgence ? `
    <div class="section">
        <h2 class="section-title">🚨 Urgences</h2>
        <div class="emergency-info">
            <div class="emergency-title">Numéro d'urgence</div>
            <div class="info-content">
                <strong>${cityData.urgence.numero}</strong>
                ${cityData.urgence.information_complementaire ? `<br>${cityData.urgence.information_complementaire}` : ''}
            </div>
        </div>
    </div>
    ` : ''}
    ` : ''}

    <div class="footer">
        <p>Document généré par VoyageSur le ${new Date().toLocaleDateString('fr-FR')}</p>
        <p>Conservez ce document avec vous pendant votre voyage</p>
    </div>
</body>
</html>
    `;
  }



  /**
   * Partage le PDF via les applications disponibles
   */
  async sharePDF(pdfPath: string): Promise<void> {
    try {
      console.log('Partage du PDF:', pdfPath);
      
      await Sharing.shareAsync(pdfPath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Partager le PDF du voyage',
      });
      
    } catch (error) {
      console.error('Erreur lors du partage du PDF:', error);
      throw new Error('Impossible de partager le PDF');
    }
  }
}

export const pdfExportService = new PDFExportService(); 