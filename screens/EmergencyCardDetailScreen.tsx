import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EmergencyCard {
  id: string;
  titre: string;
  description: string;
  symptomes?: string[];
  actions?: string[];
  prevention?: string[];
  urgence?: boolean;
  categorie?: string;
}

interface EmergencyCardDetailScreenProps {
  navigation: any;
  route: any;
}

export default function EmergencyCardDetailScreen({ navigation, route }: EmergencyCardDetailScreenProps) {
  const { card } = route.params || {};
  const insets = useSafeAreaInsets();

  const renderList = (items: string[], title: string, icon: string, color: string) => {
    if (!items || items.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: color }]} />
            <Text style={styles.listItemText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header avec gradient */}
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
          <Text style={styles.headerTitle}>Fiche d'Urgence</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Titre et badge d'urgence */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Ionicons 
              name={card.urgence ? "warning" : "medical"} 
              size={32} 
              color={card.urgence ? colors.danger : colors.primary} 
            />
            <Text style={[styles.cardTitle, card.urgence && styles.urgentTitle]}>
              {card.label}
            </Text>
          </View>
          {card.urgence && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>URGENT</Text>
            </View>
          )}
        </View>

        {/* Catégorie */}
        {card.categorie && (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>{card.categorie}</Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="information-circle" size={24} color={colors.info} />
            </View>
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.descriptionText}>{card.description}</Text>
        </View>

        {/* Symptômes */}
        {renderList(
          card.symptomes || [],
          'Symptômes',
          'alert-circle',
          colors.warning
        )}

        {/* Actions à effectuer */}
        {renderList(
          card.actions || [],
          'Actions à effectuer',
          'checkmark-circle',
          colors.success
        )}

        {/* Prévention */}
        {renderList(
          card.prevention || [],
          'Prévention',
          'shield-checkmark',
          colors.primary
        )}

        {/* Note d'urgence */}
        {card.urgence && (
          <View style={styles.urgentNote}>
            <View style={styles.urgentNoteHeader}>
              <Ionicons name="warning" size={24} color={colors.danger} />
              <Text style={styles.urgentNoteTitle}>Attention</Text>
            </View>
            <Text style={styles.urgentNoteText}>
              Cette situation nécessite une intervention médicale immédiate. 
              Contactez les services d'urgence locaux ou rendez-vous au plus vite 
              dans un établissement médical.
            </Text>
          </View>
        )}

        {/* Espace en bas */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
    paddingHorizontal: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  urgentTitle: {
    color: colors.danger,
  },
  urgentBadge: {
    backgroundColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  urgentBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  listItemText: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
    flex: 1,
  },
  urgentNote: {
    backgroundColor: colors.danger + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  urgentNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgentNoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.danger,
    marginLeft: 8,
  },
  urgentNoteText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
}); 