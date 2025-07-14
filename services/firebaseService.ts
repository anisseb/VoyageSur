import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  TravelPlan, 
  TravelProfile, 
  Vaccine, 
  Medicine, 
  EmergencyContact, 
  EpidemicAlert,
  User 
} from '../types';

// Service pour les plans de voyage
export const travelPlanService = {
  // Créer un nouveau plan de voyage
  async create(plan: Omit<TravelPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userId = plan.userId;
    if (!userId) {
      throw new Error('userId est requis pour créer un voyage');
    }

    const newTripRef = doc(db, 'new-trip', userId);
    
    try {
      // Vérifier si le document existe déjà
      const docSnap = await getDoc(newTripRef);
      
      const now = Timestamp.now();
      const tripData = {
        ...plan,
        createdAt: now,
        updatedAt: now
      };

      let tripIndex = 0;

      if (docSnap.exists()) {
        // Le document existe, ajouter au tableau voyages
        const existingVoyages = docSnap.data().voyages || [];
        tripIndex = existingVoyages.length;
        
        await updateDoc(newTripRef, {
          voyages: arrayUnion(tripData),
          updatedAt: now
        });
      } else {
        // Le document n'existe pas, le créer avec le premier voyage
        await setDoc(newTripRef, {
          userId: userId,
          voyages: [tripData],
          createdAt: now,
          updatedAt: now
        });
      }

      // Retourner un ID unique pour ce voyage (userId + timestamp + index)
      return `${userId}_${now.toMillis()}_${tripIndex}`;
    } catch (error) {
      console.error('Erreur lors de la création du voyage:', error);
      throw error;
    }
  },

  // Récupérer tous les voyages d'un utilisateur (actifs et passés)
  async getByUserId(userId: string): Promise<{ active: TravelPlan[], past: TravelPlan[] }> {
    try {
      const [newTripDoc, oldTripDoc] = await Promise.all([
        getDoc(doc(db, 'new-trip', userId)),
        getDoc(doc(db, 'old-trip', userId))
      ]);

      const activeTrips: TravelPlan[] = [];
      const pastTrips: TravelPlan[] = [];

      // Traiter les voyages actifs
      if (newTripDoc.exists()) {
        const voyages = newTripDoc.data().voyages || [];
        activeTrips.push(...voyages.map((trip: any, index: number) => ({
          id: `${userId}_${trip.createdAt?.toMillis() || Date.now()}_${index}`,
          ...trip,
          startDate: trip.startDate.toDate(),
          endDate: trip.endDate.toDate(),
          createdAt: trip.createdAt.toDate(),
          updatedAt: trip.updatedAt.toDate()
        })));
      }

      // Traiter les voyages passés
      if (oldTripDoc.exists()) {
        const voyages = oldTripDoc.data().voyages || [];
        pastTrips.push(...voyages.map((trip: any, index: number) => ({
          id: `${userId}_${trip.createdAt?.toMillis() || Date.now()}_${index}`,
          ...trip,
          startDate: trip.startDate.toDate(),
          endDate: trip.endDate.toDate(),
          createdAt: trip.createdAt.toDate(),
          updatedAt: trip.updatedAt.toDate()
        })));
      }

      return { active: activeTrips, past: pastTrips };
    } catch (error) {
      console.error('Erreur lors de la récupération des voyages:', error);
      throw error;
    }
  },

  // Récupérer un voyage spécifique
  async getById(userId: string, tripId: string): Promise<TravelPlan | null> {
    try {
      console.log('Recherche du voyage:', { userId, tripId });
      
      const [newTripDoc, oldTripDoc] = await Promise.all([
        getDoc(doc(db, 'new-trip', userId)),
        getDoc(doc(db, 'old-trip', userId))
      ]);

      // Chercher dans les voyages actifs
      if (newTripDoc.exists()) {
        const voyages = newTripDoc.data().voyages || [];
        console.log('Voyages actifs trouvés:', voyages.length);
        
        for (let i = 0; i < voyages.length; i++) {
          const trip = voyages[i];
          const generatedId = `${userId}_${trip.createdAt?.toMillis() || Date.now()}_${i}`;
          console.log(`Voyage ${i}:`, { generatedId, tripId, match: generatedId === tripId });
          
          if (generatedId === tripId) {
            return {
              id: tripId,
              ...trip,
              startDate: trip.startDate.toDate(),
              endDate: trip.endDate.toDate(),
              createdAt: trip.createdAt.toDate(),
              updatedAt: trip.updatedAt.toDate()
            } as TravelPlan;
          }
        }
      }

      // Chercher dans les voyages passés
      if (oldTripDoc.exists()) {
        const voyages = oldTripDoc.data().voyages || [];
        console.log('Voyages passés trouvés:', voyages.length);
        
        for (let i = 0; i < voyages.length; i++) {
          const trip = voyages[i];
          const generatedId = `${userId}_${trip.createdAt?.toMillis() || Date.now()}_${i}`;
          console.log(`Voyage passé ${i}:`, { generatedId, tripId, match: generatedId === tripId });
          
          if (generatedId === tripId) {
            return {
              id: tripId,
              ...trip,
              startDate: trip.startDate.toDate(),
              endDate: trip.endDate.toDate(),
              createdAt: trip.createdAt.toDate(),
              updatedAt: trip.updatedAt.toDate()
            } as TravelPlan;
          }
        }
      }

      console.log('Aucun voyage trouvé avec cet ID');
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du voyage:', error);
      throw error;
    }
  },

  // Mettre à jour un voyage
  async update(userId: string, tripId: string, updates: Partial<TravelPlan>): Promise<void> {
    try {
      const newTripRef = doc(db, 'new-trip', userId);
      const docSnap = await getDoc(newTripRef);
      
      if (!docSnap.exists()) {
        throw new Error('Aucun voyage trouvé pour cet utilisateur');
      }

      const voyages = docSnap.data().voyages || [];
      
      // Extraire l'index du tripId
      const tripIdParts = tripId.split('_');
      const tripIndex = parseInt(tripIdParts[tripIdParts.length - 1]);
      
      if (isNaN(tripIndex) || tripIndex < 0 || tripIndex >= voyages.length) {
        throw new Error('Voyage non trouvé');
      }

      // Mettre à jour le voyage
      voyages[tripIndex] = {
        ...voyages[tripIndex],
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(newTripRef, {
        voyages: voyages,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du voyage:', error);
      throw error;
    }
  },

  // Supprimer un voyage
  async delete(userId: string, tripId: string): Promise<void> {
    try {
      const newTripRef = doc(db, 'new-trip', userId);
      const docSnap = await getDoc(newTripRef);
      
      if (!docSnap.exists()) {
        throw new Error('Aucun voyage trouvé pour cet utilisateur');
      }

      const voyages = docSnap.data().voyages || [];
      
      // Extraire l'index du tripId
      const tripIdParts = tripId.split('_');
      const tripIndex = parseInt(tripIdParts[tripIdParts.length - 1]);
      
      if (isNaN(tripIndex) || tripIndex < 0 || tripIndex >= voyages.length) {
        throw new Error('Voyage non trouvé');
      }

      // Supprimer le voyage du tableau
      voyages.splice(tripIndex, 1);

      await updateDoc(newTripRef, {
        voyages: voyages,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du voyage:', error);
      throw error;
    }
  },

  // Fonction pour nettoyer les voyages expirés d'un utilisateur spécifique
  async cleanupExpiredTripsForUser(userId: string): Promise<void> {
    try {
      const now = new Date();
      const newTripRef = doc(db, 'new-trip', userId);
      const docSnap = await getDoc(newTripRef);

      if (!docSnap.exists()) {
        console.log(`Aucun document new-trip trouvé pour l'utilisateur ${userId}`);
        return;
      }

      const voyages = docSnap.data().voyages || [];

      const expiredTrips = voyages.filter((trip: any) => {
        const endDate = trip.endDate.toDate();
        return endDate < now;
      });

      const activeTrips = voyages.filter((trip: any) => {
        const endDate = trip.endDate.toDate();
        return endDate >= now;
      });

      if (expiredTrips.length > 0) {
        // Déplacer les voyages expirés vers old-trip
        const oldTripRef = doc(db, 'old-trip', userId);
        const oldTripDoc = await getDoc(oldTripRef);

        if (oldTripDoc.exists()) {
          await updateDoc(oldTripRef, {
            voyages: arrayUnion(...expiredTrips),
            updatedAt: Timestamp.now()
          });
        } else {
          await setDoc(oldTripRef, {
            userId: userId,
            voyages: expiredTrips,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }

        // Mettre à jour new-trip avec seulement les voyages actifs
        await updateDoc(newTripRef, {
          voyages: activeTrips,
          updatedAt: Timestamp.now()
        });

        console.log(`Déplacé ${expiredTrips.length} voyages expirés pour l'utilisateur ${userId}`);
      } else {
        console.log(`Aucun voyage expiré trouvé pour l'utilisateur ${userId}`);
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des voyages expirés:', error);
      throw error;
    }
  }

  // Fonction pour nettoyer les voyages expirés (ancienne fonction - à supprimer plus tard)
  ,async cleanupExpiredTrips(): Promise<void> {
    console.warn('cleanupExpiredTrips() est déprécié. Utilisez cleanupExpiredTripsForUser(userId) à la place.');
    throw new Error('Cette fonction nécessite des droits admin. Utilisez cleanupExpiredTripsForUser(userId) pour nettoyer les voyages d\'un utilisateur spécifique.');
  }
};

// Service pour les vaccins
export const vaccineService = {
  async getByCountry(country: string): Promise<Vaccine[]> {
    const q = query(
      collection(db, 'vaccins'),
      where('countries', 'array-contains', country)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Vaccine[];
  },

  async getAll(): Promise<Vaccine[]> {
    const querySnapshot = await getDocs(collection(db, 'vaccins'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Vaccine[];
  },

  async getByIds(vaccineIds: string[]): Promise<any[]> {
    if (!vaccineIds.length) return [];
    
    const vaccines = [];
    for (const id of vaccineIds) {
      try {
        const docRef = doc(db, 'vaccins', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          vaccines.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération du vaccin ${id}:`, error);
      }
    }
    return vaccines;
  }
};

// Service pour les médicaments
export const medicineService = {
  async getByCategory(category: string): Promise<Medicine[]> {
    const q = query(
      collection(db, 'medicaments'),
      where('category', '==', category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Medicine[];
  },

  async getAll(): Promise<Medicine[]> {
    const querySnapshot = await getDocs(collection(db, 'medicaments'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Medicine[];
  },

  async getByIds(medicineIds: string[]): Promise<any[]> {
    if (!medicineIds.length) return [];
    
    const medicines = [];
    for (const id of medicineIds) {
      try {
        const docRef = doc(db, 'medicaments', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          medicines.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération du médicament ${id}:`, error);
      }
    }
    return medicines;
  }
};

// Service pour les contacts d'urgence
export const emergencyContactService = {
  async getByCountry(country: string): Promise<EmergencyContact[]> {
    const q = query(
      collection(db, 'emergencyContacts'),
      where('country', '==', country)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EmergencyContact[];
  }
};

// Service pour les alertes épidémiques
export const epidemicAlertService = {
  async getActiveByCountry(country: string): Promise<EpidemicAlert[]> {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'epidemicAlerts'),
      where('country', '==', country),
      where('startDate', '<=', now),
      where('endDate', '>=', now)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate?.toDate()
    })) as EpidemicAlert[];
  }
};

// Service pour les profils de voyage
export const travelProfileService = {
  async create(profile: Omit<TravelProfile, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'travelProfiles'), profile);
    return docRef.id;
  },

  async getByUserId(userId: string): Promise<TravelProfile[]> {
    const q = query(
      collection(db, 'travelProfiles'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TravelProfile[];
  },

  async update(id: string, updates: Partial<TravelProfile>): Promise<void> {
    const docRef = doc(db, 'travelProfiles', id);
    await updateDoc(docRef, updates);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'travelProfiles', id);
    await deleteDoc(docRef);
  }
};

// Service pour les pays
export const countryService = {
  async getAll(): Promise<{ id: string; name: string; code: string }[]> {
    const querySnapshot = await getDocs(collection(db, 'pays'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().nom || doc.data().name,
      code: doc.data().code || doc.id
    }));
  },

  async getById(id: string): Promise<{ id: string; name: string; code: string } | null> {
    const docRef = doc(db, 'pays', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.nom || data.name,
        code: data.code || docSnap.id
      };
    }
    return null;
  }
};

// Service pour les villes
export const cityService = {
  async getByCountryId(countryId: string): Promise<{ id: string; name: string; countryId: string }[]> {
    const q = query(
      collection(db, 'villes'),
      where('pays_id', '==', countryId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.nom || data.name || 'Ville sans nom',
        countryId: data.pays_id || countryId
      };
    });
  },

  async getById(cityId: string): Promise<any> {
    const docRef = doc(db, 'villes', cityId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    throw new Error('Ville non trouvée');
  },

  async getByIdSimple(cityId: string): Promise<{ id: string; name: string; countryId: string }> {
    const docRef = doc(db, 'villes', cityId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.nom || data.name || 'Ville sans nom',
        countryId: data.pays_id || ''
      };
    }
    throw new Error('Ville non trouvée');
  }
};

// Service pour les symptômes
export const symptomService = {
  async getByIds(symptomIds: string[]): Promise<any[]> {
    if (!symptomIds.length) return [];
    
    const symptoms = [];
    for (const id of symptomIds) {
      try {
        const docRef = doc(db, 'symptomes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          symptoms.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération du symptôme ${id}:`, error);
      }
    }
    return symptoms;
  }
}; 