import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_CONFIG, getDefaultProducts, getProductIds } from '../config/revenueCat';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

// Types pour les produits
export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currencyCode: string;
  packageType: string;
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currencyCode: string;
  period: 'month' | 'year';
  savings?: string;
}

export interface SinglePurchase {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currencyCode: string;
}

class PurchaseService {
  private isInitialized = false;

  // Initialiser RevenueCat
  async initialize() {
    if (this.isInitialized) return;

    try {
      const apiKey = Platform.OS === 'ios' 
        ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
        : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

      if (!apiKey) {
        console.error('RevenueCat API key not found');
        return;
      }

      await Purchases.configure({ apiKey });
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    }
  }

  // Récupérer les offres disponibles (méthode simplifiée comme dans l'exemple)
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      await this.initialize();
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current) {
        return offerings.current;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting offerings:', error);
      return null;
    }
  }

  // Récupérer les abonnements disponibles (méthode simplifiée)
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const offering = await this.getOfferings();
      if (!offering) {
        return [];
      }

      const platform = Platform.OS as 'ios' | 'android';
      const productIds = getProductIds(platform);
      

      const plans: SubscriptionPlan[] = [];

      // Chercher l'abonnement mensuel
      const monthlyPackage = offering.availablePackages.find(
        (pkg: any) => pkg.product.identifier === productIds.MONTHLY_SUBSCRIPTION
      );
      
      if (monthlyPackage) {
        plans.push({
          id: monthlyPackage.identifier,
          title: monthlyPackage.product.title || 'Abonnement Mensuel',
          description: monthlyPackage.product.description || 'Accès premium illimité',
          price: monthlyPackage.product.priceString,
          priceAmount: monthlyPackage.product.price,
          currencyCode: monthlyPackage.product.currencyCode,
          period: 'month'
        });
      }

      // Chercher l'abonnement annuel
      const annualPackage = offering.availablePackages.find(
        (pkg: any) => pkg.product.identifier === productIds.ANNUAL_SUBSCRIPTION
      );
      
      if (annualPackage) {
        const annualPrice = annualPackage.product.price;
        const monthlyPrice = monthlyPackage?.product.price || 0;
        const yearlyCost = monthlyPrice * 12;
        const savings = yearlyCost - annualPrice;
        const savingsPercent = Math.round((savings / yearlyCost) * 100);

        plans.push({
          id: annualPackage.identifier,
          title: annualPackage.product.title || 'Abonnement Annuel',
          description: annualPackage.product.description || 'Accès premium illimité (économisez sur l\'année)',
          price: annualPackage.product.priceString,
          priceAmount: annualPackage.product.price,
          currencyCode: annualPackage.product.currencyCode,
          period: 'year',
          savings: `Économisez ${savingsPercent}%`
        });
      }

      return plans;
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      return [];
    }
  }

  // Récupérer les achats à l'unité (méthode simplifiée)
  async getSinglePurchases(): Promise<SinglePurchase[]> {
    try {
      const offering = await this.getOfferings();
      if (!offering) {
        return [];
      }

      const platform = Platform.OS as 'ios' | 'android';
      const productIds = getProductIds(platform);
      

      // Chercher l'achat à l'unité
      const singleTripPackage = offering.availablePackages.find(
        (pkg: any) => pkg.product.identifier === productIds.SINGLE_TRIP
      );
      
      if (singleTripPackage) {
        return [{
          id: singleTripPackage.identifier,
          title: singleTripPackage.product.title || 'Voyage à l\'unité',
          description: singleTripPackage.product.description || 'Accès complet pour un voyage',
          price: singleTripPackage.product.priceString,
          priceAmount: singleTripPackage.product.price,
          currencyCode: singleTripPackage.product.currencyCode
        }];
      }

      return [];
    } catch (error) {
      console.error('Error getting single purchases:', error);
      return [];
    }
  }

  // Acheter un abonnement (méthode simplifiée comme dans l'exemple)
  async purchaseSubscription(packageId: string): Promise<boolean> {
    try {
      await this.initialize();
      
      const offering = await this.getOfferings();
      if (!offering) {
        return false;
      }

      // Trouver le package correspondant
      const selectedPackage = offering.availablePackages.find((p: any) => p.identifier === packageId);
      if (!selectedPackage) {
        return false;
      }

      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      
      // Vérifier si l'achat a réussi
      const isPremium = this.checkPremiumStatus(customerInfo);
      
      if (isPremium) {
        // Enregistrer l'abonnement dans Firestore
        await this.recordSubscriptionPurchase(selectedPackage.product.identifier, selectedPackage.product.price);
      }
      
      return isPremium;
    } catch (error: any) {
      console.error('Error purchasing subscription:', error);
      
      // Gestion des erreurs d'annulation (comme dans l'exemple)
      if (
        error.code === 'PurchaseCancelledError' ||
        error.code === 'USER_CANCELED' ||
        error.userCancelled === true ||
        (typeof error.message === 'string' && error.message.toLowerCase().includes('cancel'))
      ) {
        return false;
      }
      
      return false;
    }
  }

  // Enregistrer un abonnement dans Firestore
  private async recordSubscriptionPurchase(productId: string, price: number): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No authenticated user');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      const subscriptionData = {
        productId,
        price,
        purchaseDate: new Date().toISOString(),
        platform: Platform.OS,
        status: 'active'
      };

      if (userDoc.exists()) {
        // Mettre à jour le document existant
        await updateDoc(userRef, {
          'abonnement': subscriptionData
        });
      } else {
        // Créer un nouveau document
        await setDoc(userRef, {
          'abonnement': subscriptionData
        });
      }

      console.log('Subscription purchase recorded in Firestore');
    } catch (error) {
      console.error('Error recording subscription purchase:', error);
    }
  }

  // Acheter un voyage à l'unité (méthode simplifiée)
  async purchaseSingleTrip(packageId: string): Promise<boolean> {
    try {
      await this.initialize();
      
      const offering = await this.getOfferings();
      if (!offering) {
        return false;
      }

      // Trouver le package correspondant
      const selectedPackage = offering.availablePackages.find((p: any) => p.identifier === packageId);
      if (!selectedPackage) {
        return false;
      }

      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      
      console.log('customerInfo', customerInfo);
      // Vérifier si l'achat a réussi
      const hasAccess = this.checkSingleTripAccess(customerInfo);

      console.log('hasAccess', hasAccess);
      
      if (hasAccess) {
        // Enregistrer l'achat dans Firestore
        await this.recordSingleTripPurchase(selectedPackage.product.identifier);
      }
      
      return hasAccess;
    } catch (error: any) {
      console.error('Error purchasing single trip:', error);
      
      // Gestion des erreurs d'annulation
      if (
        error.code === 'PurchaseCancelledError' ||
        error.code === 'USER_CANCELED' ||
        error.userCancelled === true ||
        (typeof error.message === 'string' && error.message.toLowerCase().includes('cancel'))
      ) {
        return false;
      }
      
      return false;
    }
  }

  // Enregistrer un achat unique dans Firestore
  private async recordSingleTripPurchase(productId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No authenticated user');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      const purchaseData = {
        productId,
        quantity: 1,
        purchaseDate: new Date().toISOString(),
        platform: Platform.OS
      };

      if (userDoc.exists()) {
        // Mettre à jour le document existant
        await updateDoc(userRef, {
          'achat-unique': purchaseData
        });
      } else {
        // Créer un nouveau document
        await setDoc(userRef, {
          'achat-unique': purchaseData
        });
      }

      console.log('Single trip purchase recorded in Firestore');
    } catch (error) {
      console.error('Error recording single trip purchase:', error);
    }
  }

  // Décrémenter la quantité d'un achat unique
  async decrementSingleTripQuantity(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No authenticated user');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const singleTrip = userData?.['achat-unique'];
        
        if (singleTrip && singleTrip.quantity > 0) {
          const newQuantity = singleTrip.quantity - 1;
          
          if (newQuantity === 0) {
            // Supprimer l'achat unique si la quantité atteint 0
            await updateDoc(userRef, {
              'achat-unique': null
            });
            console.log('Single trip purchase removed (quantity reached 0)');
          } else {
            // Mettre à jour la quantité
            await updateDoc(userRef, {
              'achat-unique': {
                ...singleTrip,
                quantity: newQuantity
              }
            });
            console.log(`Single trip quantity decremented to ${newQuantity}`);
          }
        }
      }
    } catch (error) {
      console.error('Error decrementing single trip quantity:', error);
    }
  }

  // Vérifier si l'utilisateur est premium
  async isPremium(): Promise<boolean> {
    try {
      // Vérifier d'abord RevenueCat
      await this.initialize();
      const customerInfo = await Purchases.getCustomerInfo();
      const revenueCatPremium = this.checkPremiumStatus(customerInfo);
      
      if (revenueCatPremium) {
        return true;
      }

      // Si pas premium dans RevenueCat, vérifier Firestore
      const firestorePremium = await this.checkFirestoreSubscription();
      return firestorePremium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      // En cas d'erreur RevenueCat, vérifier Firestore
      try {
        return await this.checkFirestoreSubscription();
      } catch (firestoreError) {
        console.error('Error checking Firestore subscription:', firestoreError);
        return false;
      }
    }
  }

  // Vérifier l'abonnement dans Firestore
  private async checkFirestoreSubscription(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return false;
      }

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const subscription = userData?.abonnement;
        
        if (subscription && subscription.status === 'active') {
          // Vérifier si l'abonnement n'est pas expiré
          const purchaseDate = new Date(subscription.purchaseDate);
          const now = new Date();
          
          // Pour les abonnements mensuels (30 jours)
          if (subscription.productId.includes('monthly')) {
            const expiryDate = new Date(purchaseDate.getTime() + (30 * 24 * 60 * 60 * 1000));
            return now < expiryDate;
          }
          
          // Pour les abonnements annuels (365 jours)
          if (subscription.productId.includes('years') || subscription.productId.includes('annual')) {
            const expiryDate = new Date(purchaseDate.getTime() + (365 * 24 * 60 * 60 * 1000));
            return now < expiryDate;
          }
          
          // Par défaut, considérer comme actif
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking Firestore subscription:', error);
      return false;
    }
  }

  // Vérifier si l'utilisateur a accès à un voyage gratuit
  async hasFreeTripAccess(): Promise<boolean> {
    try {
      // Vérifier d'abord si l'utilisateur est premium
      const isPremium = await this.isPremium();
      if (isPremium) {
        return true; // Les utilisateurs premium ont accès illimité
      }

      // Vérifier si l'utilisateur a un achat unique avec quantité > 0
      const hasSingleTrip = await this.hasSingleTripAccess();
      return hasSingleTrip; // Accès seulement si achat unique disponible
    } catch (error) {
      console.error('Error checking free trip access:', error);
      return false;
    }
  }



  // Vérifier si l'utilisateur a acheté un voyage à l'unité
  async hasSingleTripAccess(): Promise<boolean> {
    try {
      // Vérifier d'abord RevenueCat
      await this.initialize();
      const customerInfo = await Purchases.getCustomerInfo();
      const revenueCatSingleTrip = this.checkSingleTripAccess(customerInfo);
      
      if (revenueCatSingleTrip) {
        return true;
      }

      // Si pas d'achat unique dans RevenueCat, vérifier Firestore
      const firestoreSingleTrip = await this.checkFirestoreSingleTrip();
      return firestoreSingleTrip;
    } catch (error) {
      console.error('Error checking single trip access:', error);
      // En cas d'erreur RevenueCat, vérifier Firestore
      try {
        return await this.checkFirestoreSingleTrip();
      } catch (firestoreError) {
        console.error('Error checking Firestore single trip:', firestoreError);
        return false;
      }
    }
  }

  // Vérifier l'achat unique dans Firestore
  private async checkFirestoreSingleTrip(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return false;
      }

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const singleTrip = userData?.['achat-unique'];
        
        if (singleTrip && singleTrip.productId && singleTrip.quantity > 0) {
          // Vérifier si l'achat unique a encore des voyages disponibles
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking Firestore single trip:', error);
      return false;
    }
  }

  // Méthodes privées pour vérifier les statuts
  private checkPremiumStatus(customerInfo: CustomerInfo): boolean {
    return customerInfo.entitlements.active['Voyage Sûr premium'] !== undefined;
  }

  private checkFreeTripAccess(customerInfo: CustomerInfo): boolean {
    // Logique pour vérifier l'accès au voyage gratuit
    // Vous pouvez implémenter votre propre logique ici
    return true; // Par défaut, tout le monde a un voyage gratuit
  }

  private checkSingleTripAccess(customerInfo: CustomerInfo): boolean {
    return customerInfo.entitlements.active['Voyage Sûr premium'] !== undefined;
  }

  // Restaurer les achats
  async restorePurchases(): Promise<boolean> {
    try {
      await this.initialize();
      const customerInfo = await Purchases.restorePurchases();
      return this.checkPremiumStatus(customerInfo);
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  }

  // Obtenir les informations du client
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      await this.initialize();
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      return null;
    }
  }

  // Obtenir les informations détaillées des achats depuis Firestore
  async getPurchaseInfo(): Promise<{
    isPremium: boolean;
    hasSingleTrip: boolean;
    hasFreeTripAccess: boolean;
    subscription?: any;
    singleTrip?: any;
  }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          isPremium: false,
          hasSingleTrip: false,
          hasFreeTripAccess: true
        };
      }

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        const subscription = userData?.abonnement;
        const singleTrip = userData?.['achat-unique'];
        
        // Vérifier si l'abonnement est actif
        let isPremium = false;
        if (subscription && subscription.status === 'active') {
          const purchaseDate = new Date(subscription.purchaseDate);
          const now = new Date();
          
          if (subscription.productId.includes('monthly')) {
            const expiryDate = new Date(purchaseDate.getTime() + (30 * 24 * 60 * 60 * 1000));
            isPremium = now < expiryDate;
          } else if (subscription.productId.includes('years') || subscription.productId.includes('annual')) {
            const expiryDate = new Date(purchaseDate.getTime() + (365 * 24 * 60 * 60 * 1000));
            isPremium = now < expiryDate;
          } else {
            isPremium = true;
          }
        }
        
        const hasSingleTrip = !!(singleTrip && singleTrip.productId && singleTrip.quantity > 0);
        const hasFreeTripAccess = isPremium || hasSingleTrip;
        
        return {
          isPremium,
          hasSingleTrip,
          hasFreeTripAccess,
          subscription,
          singleTrip
        };
      }
      
      return {
        isPremium: false,
        hasSingleTrip: false,
        hasFreeTripAccess: true
      };
    } catch (error) {
      console.error('Error getting purchase info:', error);
      return {
        isPremium: false,
        hasSingleTrip: false,
        hasFreeTripAccess: true
      };
    }
  }

  // Vérifier si RevenueCat est configuré
  async isRevenueCatConfigured(): Promise<boolean> {
    try {
      await this.initialize();
      
      // Essayer d'abord de récupérer les offres
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        return true;
      }
      
      // Si pas d'offres, essayer de récupérer directement les produits
      const products = await this.getProducts();
      return products.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Récupérer directement les produits depuis RevenueCat
  async getProducts(): Promise<any[]> {
    try {
      await this.initialize();
      const platform = Platform.OS as 'ios' | 'android';
      const productIds = getProductIds(platform);
      
      // Récupérer tous les produits disponibles
      const products = await Purchases.getProducts([
        productIds.MONTHLY_SUBSCRIPTION,
        productIds.ANNUAL_SUBSCRIPTION,
        productIds.SINGLE_TRIP
      ]);
      
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  // Récupérer les abonnements depuis les produits directs
  async getSubscriptionPlansFromProducts(): Promise<SubscriptionPlan[]> {
    try {
      const products = await this.getProducts();
      const platform = Platform.OS as 'ios' | 'android';
      const productIds = getProductIds(platform);
      
      const plans: SubscriptionPlan[] = [];

      // Chercher l'abonnement mensuel
      const monthlyProduct = products.find(p => p.identifier === productIds.MONTHLY_SUBSCRIPTION);
      if (monthlyProduct) {
        plans.push({
          id: monthlyProduct.identifier,
          title: monthlyProduct.title || 'Abonnement Mensuel',
          description: monthlyProduct.description || 'Accès premium illimité',
          price: monthlyProduct.priceString,
          priceAmount: monthlyProduct.price,
          currencyCode: monthlyProduct.currencyCode,
          period: 'month'
        });
      }

      // Chercher l'abonnement annuel
      const annualProduct = products.find(p => p.identifier === productIds.ANNUAL_SUBSCRIPTION);
      if (annualProduct) {
        const annualPrice = annualProduct.price;
        const monthlyPrice = monthlyProduct?.price || 0;
        const yearlyCost = monthlyPrice * 12;
        const savings = yearlyCost - annualPrice;
        const savingsPercent = Math.round((savings / yearlyCost) * 100);

        plans.push({
          id: annualProduct.identifier,
          title: annualProduct.title || 'Abonnement Annuel',
          description: annualProduct.description || 'Accès premium illimité (économisez sur l\'année)',
          price: annualProduct.priceString,
          priceAmount: annualProduct.price,
          currencyCode: annualProduct.currencyCode,
          period: 'year',
          savings: `Économisez ${savingsPercent}%`
        });
      }

      return plans;
    } catch (error) {
      console.error('Error getting subscription plans from products:', error);
      // Fallback vers les produits par défaut
      const platform = Platform.OS as 'ios' | 'android';
      const defaultProducts = getDefaultProducts(platform);
      return defaultProducts.filter(p => p.period === 'month' || p.period === 'year') as SubscriptionPlan[];
    }
  }

  // Récupérer les achats à l'unité depuis les produits directs
  async getSinglePurchasesFromProducts(): Promise<SinglePurchase[]> {
    try {
      const products = await this.getProducts();
      const platform = Platform.OS as 'ios' | 'android';
      const productIds = getProductIds(platform);
      
      const purchases: SinglePurchase[] = [];

      // Chercher l'achat à l'unité
      const singleTripProduct = products.find(p => p.identifier === productIds.SINGLE_TRIP);
      if (singleTripProduct) {
        purchases.push({
          id: singleTripProduct.identifier,
          title: singleTripProduct.title || 'Voyage à l\'unité',
          description: singleTripProduct.description || 'Accès complet pour un voyage',
          price: singleTripProduct.priceString,
          priceAmount: singleTripProduct.price,
          currencyCode: singleTripProduct.currencyCode
        });
      }

      return purchases;
    } catch (error) {
      console.error('Error getting single purchases from products:', error);
      // Fallback vers les produits par défaut
      const platform = Platform.OS as 'ios' | 'android';
      const defaultProducts = getDefaultProducts(platform);
      return defaultProducts.filter(p => !p.period) as SinglePurchase[];
    }
  }
}

export const purchaseService = new PurchaseService(); 