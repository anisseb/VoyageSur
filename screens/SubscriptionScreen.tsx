import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { purchaseService } from '../services/purchaseService';

interface SubscriptionScreenProps {
  navigation: any;
}

export default function SubscriptionScreen({ navigation }: SubscriptionScreenProps) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<any>(null);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const res = await purchaseService.getOfferings();
        setOfferings(res);
      } catch (e) {
        console.error('Error loading offerings:', e);
        Alert.alert('Erreur ❌', "Impossible de charger les offres d'abonnement. 😕");
      } finally {
        setLoading(false);
      }
    };
    fetchOfferings();
  }, []);

  const handlePurchase = async (type: 'subscription' | 'single_trip', mode?: 'mois' | 'an') => {
    if (!offerings) {
      Alert.alert('Erreur ❌', 'Aucune offre disponible. 😕');
      return;
    }

    let packageId = '';
    const platform = Platform.OS as 'ios' | 'android';

    if (type === 'subscription') {
      if (platform === 'ios') {
        packageId = mode === 'mois' ? 'voyage.sur.monthly' : 'voyage.sur.premium.years';
      } else {
        packageId = mode === 'mois' ? 'voyage-sur-premium-monthly' : 'voyage-sur-premium-years';
      }
    } else {
      if (platform === 'ios') {
        packageId = 'voyage.sur.check.sante.unique';
      } else {
        packageId = 'voyage.sur.check.sante.unique';
      }
    }

    const selectedPackage = offerings.availablePackages.find((p: any) => p.product.identifier === packageId);
    if (!selectedPackage) {
      Alert.alert('Erreur ❌', `Offre ${packageId} non trouvée. 😕`);
      return;
    }

    setPurchasing(packageId);
    try {
      const success = type === 'subscription' 
        ? await purchaseService.purchaseSubscription(selectedPackage.identifier)
        : await purchaseService.purchaseSingleTrip(selectedPackage.identifier);

      if (success) {
        Alert.alert('Merci ! 🎉', 'Achat effectué avec succès ! 🚀', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Erreur ❌', 'Achat effectué mais accès non activé. Veuillez contacter le support. 🛠️');
      }
    } catch (e: any) {
      // RevenueCat : PurchaseCancelledError ou userCancelled
      if (
        e.code === 'PurchaseCancelledError' ||
        e.code === 'USER_CANCELED' ||
        e.code === 'PurchaseCancelledError' ||
        e.userCancelled === true ||
        (typeof e.message === 'string' && e.message.toLowerCase().includes('cancel'))
      ) {
        // Achat annulé par l'utilisateur : on ne fait rien
        return;
      }
      Alert.alert('Erreur ❌', 'Achat impossible : ' + e.message + ' 😢');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const success = await purchaseService.restorePurchases();
      if (success) {
        Alert.alert('Succès ! 🎉', 'Vos achats ont été restaurés avec succès ! 🚀', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Information', 'Aucun achat à restaurer trouvé.');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Erreur', 'Impossible de restaurer les achats.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des offres...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choisissez votre plan</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Section Voyage gratuit */}
        <View style={styles.section}>
          <View style={styles.freeCard}>
            <View style={styles.freeHeader}>
              <Ionicons name="gift" size={32} color={colors.success} />
              <Text style={styles.freeTitle}>Voyage Gratuit</Text>
            </View>
            <Text style={styles.freeDescription}>
              Le premier check de voyage est gratuit avec toutes les fonctionnalités Premium
            </Text>
            <View style={styles.freeFeatures}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[styles.featureText, {color: colors.text.primary}]}>1 voyage complet</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[styles.featureText, {color: colors.text.primary}]}>Recommandations de vaccins</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[styles.featureText, {color: colors.text.primary}]}>Contacts d'urgence</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section Voyage à l'unité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voyage à l'unité</Text>
          <View style={styles.purchaseCard}>
            <View style={styles.purchaseHeader}>
              <Ionicons name="airplane" size={24} color={colors.primary} />
              <Text style={styles.purchaseTitle}>Voyage à l'unité</Text>
            </View>
            <Text style={styles.purchaseDescription}>
              Un voyage complet avec toutes les fonctionnalités premium
            </Text>
            <View style={styles.purchaseFooter}>
              <Text style={styles.purchasePrice}>
                {offerings ? (
                  (() => {
                    const id = Platform.OS === 'ios' ? 'voyage.sur.check.sante.unique' : 'voyage.sur.check.sante.unique';
                    const pkg = offerings.availablePackages.find((p: any) => p.product.identifier === id);
                    return pkg ? pkg.product.priceString : '4,99€';
                  })()
                ) : '4,99€'}
              </Text>
              <TouchableOpacity
                style={[styles.purchaseButton, purchasing === 'voyage.sur.check.sante.unique' && styles.purchaseButtonDisabled]}
                onPress={() => handlePurchase('single_trip')}
                disabled={purchasing !== null}
              >
                {purchasing === 'voyage.sur.check.sante.unique' ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.purchaseButtonText}>Acheter</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section Abonnements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonnements Premium</Text>
          
          {/* Abonnement Mensuel */}
          <View style={styles.subscriptionCard}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.subscriptionGradient}
            >
              <View style={styles.subscriptionHeader}>
                <Ionicons name="star" size={24} color={colors.white} />
                <Text style={styles.subscriptionTitle}>Abonnement Mensuel</Text>
              </View>
              <Text style={styles.subscriptionDescription}>
                Accès premium illimité pour tous vos voyages
              </Text>
              <View style={styles.subscriptionFeatures}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.featureText}>Voyages illimités</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.featureText}>Fiches de premiers secours</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.featureText}>Météo et conseils locaux</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.featureText}>Recommandations IA</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.featureText}>Notifications avancées</Text>
                </View>
              </View>
              <View style={styles.subscriptionFooter}>
                <Text style={styles.subscriptionPrice}>
                  {offerings ? (
                    (() => {
                      const id = Platform.OS === 'ios' ? 'voyage.sur.monthly' : 'voyage-sur-premium-monthly';
                      const pkg = offerings.availablePackages.find((p: any) => p.product.identifier === id);
                      return pkg ? pkg.product.priceString : '9,99€ / mois';
                    })()
                  ) : '9,99€ / mois'}
                </Text>
                <TouchableOpacity
                  style={[styles.subscriptionButton, purchasing === 'voyage.sur.monthly' && styles.subscriptionButtonDisabled]}
                  onPress={() => handlePurchase('subscription', 'mois')}
                  disabled={purchasing !== null}
                >
                  {purchasing === 'voyage.sur.monthly' ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.subscriptionButtonText}>S'abonner</Text>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Abonnement Annuel */}
          <View style={styles.subscriptionCard}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.subscriptionGradient}
            >
              <View style={styles.subscriptionHeader}>
                <Ionicons name="star" size={24} color={colors.white} />
                <Text style={styles.subscriptionTitle}>Abonnement Annuel</Text>
                  <View style={styles.savingsBadge}>
                   <Text style={styles.savingsText}>Économisez 33%</Text>
                 </View>
              </View>
              <Text style={styles.subscriptionDescription}>
                Accès premium illimité pour tous vos voyages (économisez sur l'année)
              </Text>
              <View style={styles.subscriptionFeatures}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.featureText}>Voyages illimités</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.featureText}>Fiches de premiers secours</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.featureText}>Météo et conseils locaux</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.featureText}>Recommandations IA</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.featureText}>Notifications avancées</Text>
                </View>
              </View>
                <View style={styles.subscriptionFooter}>
                 <View style={styles.priceContainer}>
                   <Text style={styles.subscriptionPrice}>
                     {offerings ? (
                       (() => {
                         const id = Platform.OS === 'ios' ? 'voyage.sur.premium.years' : 'voyage-sur-premium-years';
                         const pkg = offerings.availablePackages.find((p: any) => p.product.identifier === id);
                         if (pkg) {
                           const prixMois = pkg.product.pricePerMonthString || '';
                           const prixAnnee = pkg.product.pricePerYearString || '';
                           if (prixMois && prixAnnee) {
                             return (
                               <Text>
                                 <Text style={styles.monthlyPrice}>{prixMois} / mois</Text>
                                 <Text style={styles.yearlyPrice}> ({prixAnnee} / an)</Text>
                               </Text>
                             );
                           }
                           return <Text style={styles.yearlyPrice}>{prixAnnee || pkg.product.priceString}</Text>;
                         }
                         return <Text style={styles.yearlyPrice}>39,99€ / an</Text>;
                       })()
                     ) : (
                       <Text style={styles.yearlyPrice}>39,99€ / an</Text>
                     )}
                   </Text>
                 </View>
               </View>
               <View style={styles.buttonContainer}>
                 <TouchableOpacity
                   style={[styles.subscriptionButton, purchasing === 'voyage.sur.premium.years' && styles.subscriptionButtonDisabled]}
                   onPress={() => handlePurchase('subscription', 'an')}
                   disabled={purchasing !== null}
                 >
                   {purchasing === 'voyage.sur.premium.years' ? (
                     <ActivityIndicator size="small" color={colors.primary} />
                   ) : (
                     <Text style={styles.subscriptionButtonText}>S'abonner</Text>
                   )}
                 </TouchableOpacity>
               </View>
            </LinearGradient>
          </View>
        </View>

        {/* Section Restaurer les achats */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
          >
            <Ionicons name="refresh" size={20} color={colors.primary} />
            <Text style={styles.restoreButtonText}>Restaurer mes achats</Text>
          </TouchableOpacity>
        </View>

        {/* Section Informations */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Informations importantes</Text>
              <Text style={styles.infoText}>
                • Les abonnements se renouvellent automatiquement{'\n'}
                • Vous pouvez annuler à tout moment{'\n'}
                • Paiement sécurisé via {Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  freeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  freeHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  freeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 8,
  },
  freeDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  freeFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    color: colors.white,
  },
  purchaseCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  purchaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  purchaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 12,
  },
  purchaseDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  purchaseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  purchasePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  subscriptionCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subscriptionGradient: {
    borderRadius: 12,
    padding: 20,
  },
  subscriptionHeader: {
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  subscriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 12,
    flex: 1,
  },
  savingsBadge: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  savingsText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  subscriptionDescription: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  subscriptionFeatures: {
    marginBottom: 20,
  },
  subscriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
    marginRight: 12,
  },
  buttonContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  subscriptionPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  monthlyPrice: {
    fontSize: 19,
    fontWeight: 'bold',
    color: colors.white,
  },
  yearlyPrice: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  subscriptionButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  subscriptionButtonDisabled: {
    opacity: 0.6,
  },
  subscriptionButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  restoreButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  debugCard: {
    flexDirection: 'row',
    backgroundColor: colors.info + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  debugContent: {
    flex: 1,
    marginLeft: 12,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: 4,
  },
}); 