import { travelPlanService } from './firebaseService';

class CleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private currentUserId: string | null = null;

  // Démarrer le nettoyage automatique (toutes les heures)
  startAutomaticCleanup(userId?: string): void {
    if (this.isRunning) {
      console.log('Le service de nettoyage est déjà en cours d\'exécution');
      return;
    }

    this.isRunning = true;
    this.currentUserId = userId || null;
    
    // Nettoyer immédiatement au démarrage
    if (userId) {
      this.performCleanup(userId);
    }
    
    // Puis nettoyer toutes les heures
    this.cleanupInterval = setInterval(() => {
      if (this.currentUserId) {
        this.performCleanup(this.currentUserId);
      }
    }, 60 * 60 * 1000); // 1 heure

    console.log('Service de nettoyage automatique démarré');
  }

  // Arrêter le nettoyage automatique
  stopAutomaticCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    console.log('Service de nettoyage automatique arrêté');
  }

  // Effectuer le nettoyage manuellement
  async performCleanup(userId?: string): Promise<void> {
    try {
      if (!userId) {
        console.log('Aucun userId fourni, nettoyage annulé');
        return;
      }
      
      console.log('Début du nettoyage des voyages expirés...');
      await travelPlanService.cleanupExpiredTripsForUser(userId);
      console.log('Nettoyage des voyages expirés terminé');
    } catch (error) {
      console.error('Erreur lors du nettoyage automatique:', error);
    }
  }

  // Vérifier si le service est en cours d'exécution
  isCleanupRunning(): boolean {
    return this.isRunning;
  }
}

// Instance singleton
export const cleanupService = new CleanupService(); 