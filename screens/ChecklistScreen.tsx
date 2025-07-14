import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { ChecklistItem } from '../types';

interface ChecklistScreenProps {
  navigation: any;
  route: any;
}

export default function ChecklistScreen({ navigation, route }: ChecklistScreenProps) {
  const { tripId } = route.params;
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    // Simuler le chargement de la checklist
    const mockChecklist: ChecklistItem[] = [
      {
        id: '1',
        title: 'Vaccin contre la fièvre jaune',
        category: 'vaccine',
        completed: false,
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
      {
        id: '2',
        title: 'Vaccin contre l\'hépatite A',
        category: 'vaccine',
        completed: true,
        priority: 'high',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
      },
      {
        id: '3',
        title: 'Antipaludéens',
        category: 'medicine',
        completed: false,
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours
      },
      {
        id: '4',
        title: 'Passeport valide',
        category: 'document',
        completed: true,
        priority: 'high',
      },
      {
        id: '5',
        title: 'Visa (si nécessaire)',
        category: 'document',
        completed: false,
        priority: 'high',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 jours
      },
      {
        id: '6',
        title: 'Assurance voyage',
        category: 'preparation',
        completed: false,
        priority: 'medium',
      },
      {
        id: '7',
        title: 'Trousse à pharmacie',
        category: 'preparation',
        completed: false,
        priority: 'medium',
      },
      {
        id: '8',
        title: 'Contacts d\'urgence',
        category: 'preparation',
        completed: true,
        priority: 'low',
      },
    ];

    setChecklist(mockChecklist);
    setLoading(false);
  };

  const toggleItem = (itemId: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vaccine': return 'medical';
      case 'medicine': return 'fitness';
      case 'document': return 'document-text';
      case 'preparation': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vaccine': return colors.vaccine;
      case 'medicine': return colors.medicine;
      case 'document': return colors.info;
      case 'preparation': return colors.preparation;
      default: return colors.gray[500];
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.danger;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.gray[500];
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Urgent';
      case 'medium': return 'Important';
      case 'low': return 'Normal';
      default: return 'Normal';
    }
  };

  const getProgressPercentage = () => {
    if (!checklist.length) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const groupedChecklist = checklist.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, ChecklistItem[]>);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement de la checklist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec progression */}
        <View style={styles.header}>
          <Text style={styles.title}>Checklist de Préparation</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>{getProgressPercentage()}% terminé</Text>
          </View>
        </View>

        {/* Checklist par catégorie */}
        {Object.entries(groupedChecklist).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons 
                name={getCategoryIcon(category) as any} 
                size={24} 
                color={getCategoryColor(category)} 
              />
              <Text style={styles.categoryTitle}>
                {category === 'vaccine' && 'Vaccins'}
                {category === 'medicine' && 'Médicaments'}
                {category === 'document' && 'Documents'}
                {category === 'preparation' && 'Préparations'}
              </Text>
            </View>

            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.checklistItem,
                  item.completed && styles.checklistItemCompleted
                ]}
                onPress={() => toggleItem(item.id)}
              >
                <View style={styles.itemLeft}>
                  <View style={[
                    styles.checkbox,
                    item.completed && styles.checkboxCompleted
                  ]}>
                    {item.completed && (
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    )}
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={[
                      styles.itemTitle,
                      item.completed && styles.itemTitleCompleted
                    ]}>
                      {item.title}
                    </Text>
                    {item.dueDate && (
                      <Text style={styles.itemDueDate}>
                        Échéance: {item.dueDate.toLocaleDateString('fr-FR')}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.itemRight}>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(item.priority) }
                  ]}>
                    <Text style={styles.priorityText}>
                      {getPriorityText(item.priority)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Bouton d'ajout */}
        <View style={styles.addSection}>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.addButtonText}>Ajouter une tâche</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.gray[50],
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checklistItemCompleted: {
    backgroundColor: colors.gray[50],
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 4,
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  itemDueDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  itemRight: {
    marginLeft: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  addSection: {
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 