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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { purchaseService, SubscriptionPlan, SinglePurchase } from '../services/purchaseService';

interface SubscriptionScreenProps {
  navigation: any;
}

export default function SubscriptionScreen({ navigation }: SubscriptionScreenProps) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [singlePurchases, setSinglePurchases] = useState<SinglePurchase[]>([]);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const [plans, purchases] = await Promise.all([
        purchaseService.getSubscriptionPlans(),
        purchaseService.getSinglePurchases()
      ]);
      setSubscriptionPlans(plans);
      setSinglePurchases(purchases);
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert('Erreur', 'Impossible de charger les offres. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSubscription = async (plan: SubscriptionPlan) => {
    setPurchasing(plan.id);
    try {
      const success = await purchaseService.purchaseSubscription(plan.id);
      if (success) {
        Alert.alert(
          'Succès !',
          'Votre abonnement a été activé avec succès !',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', 'L\'achat a échoué. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'achat.');
    } finally {
      setPurchasing(null);
    }
  };

  const handlePurchaseSingleTrip = async (purchase: SinglePurchase) => {
    setPurchasing(purchase.id);
    try {
      const success = await purchaseService.purchaseSingleTrip(purchase.id);
      if (success) {
        Alert.alert(
          'Succès !',
          'Votre voyage à l\'unité a été acheté avec succès !',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', 'L\'achat a échoué. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error purchasing single trip:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'achat.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const success = await purchaseService.restorePurchases();
      if (success) {
        Alert.alert(
          'Succès !',
          'Vos achats ont été restaurés avec succès !',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
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
              Créez un voyage gratuit avec toutes les fonctionnalités de base
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

        {/* Section Achats à l'unité */}
        {singlePurchases.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voyage à l'unité</Text>
            {singlePurchases.map((purchase) => (
              <TouchableOpacity
                key={purchase.id}
                style={styles.purchaseCard}
                onPress={() => handlePurchaseSingleTrip(purchase)}
                disabled={purchasing === purchase.id}
              >
                <View style={styles.purchaseHeader}>
                  <Ionicons name="airplane" size={24} color={colors.primary} />
                  <Text style={styles.purchaseTitle}>{purchase.title}</Text>
                </View>
                <Text style={styles.purchaseDescription}>{purchase.description}</Text>
                <View style={styles.purchaseFooter}>
                  <Text style={styles.purchasePrice}>{purchase.price}</Text>
                  <TouchableOpacity
                    style={[styles.purchaseButton, purchasing === purchase.id && styles.purchaseButtonDisabled]}
                    disabled={purchasing === purchase.id}
                  >
                    {purchasing === purchase.id ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.purchaseButtonText}>Acheter</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Section Abonnements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonnements Premium</Text>
          {subscriptionPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={styles.subscriptionCard}
              onPress={() => handlePurchaseSubscription(plan)}
              disabled={purchasing === plan.id}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.subscriptionGradient}
              >
                <View style={styles.subscriptionHeader}>
                  <Ionicons name="star" size={24} color={colors.white} />
                  <Text style={styles.subscriptionTitle}>{plan.title}</Text>
                  {plan.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.subscriptionDescription}>{plan.description}</Text>
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
                  <Text style={styles.subscriptionPrice}>{plan.price}</Text>
                  <TouchableOpacity
                    style={[styles.subscriptionButton, purchasing === plan.id && styles.subscriptionButtonDisabled]}
                    disabled={purchasing === plan.id}
                  >
                    {purchasing === plan.id ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={styles.subscriptionButtonText}>S'abonner</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
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
                • Paiement sécurisé via App Store/Google Play
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
    textAlign: 'center',
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
    marginBottom: 12,
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
    marginBottom: 8,
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
  subscriptionPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
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
}); 