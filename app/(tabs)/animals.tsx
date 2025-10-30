import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Colors, Spacing } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import AddPetModal from '../../components/AddPetModal';

interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  photos: string[];
  birth_date: string | null;
}

export default function AnimalsScreen() {
  const { profile } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', profile?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Error loading animals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAge = (birthDate: string | null) => {
    if (!birthDate) return 'Age unknown';
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();

    if (years === 0) {
      return `${months} months`;
    }
    return `${years} years`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Animals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {animals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={styles.emptyTitle}>No animals registered</Text>
          <Text style={styles.emptyText}>
            Add your first animal to get started
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.emptyButtonText}>Register First Animal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={animals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.animalCard}>
              <View style={styles.animalImageContainer}>
                {item.photos?.[0] ? (
                  <Image
                    source={{ uri: item.photos[0] }}
                    style={styles.animalImage}
                  />
                ) : (
                  <View style={styles.animalImagePlaceholder}>
                    <Text style={styles.animalImageEmoji}>
                      {item.species === 'Dog' ? '🐕' : item.species === 'Cat' ? '🐱' : '🐾'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.animalInfo}>
                <Text style={styles.animalName}>{item.name}</Text>
                <Text style={styles.animalBreed}>{item.breed}</Text>
                <View style={styles.animalMeta}>
                  <Text style={styles.animalMetaText}>
                    {item.gender === 'male' ? '♂' : '♀'} {item.gender}
                  </Text>
                  <Text style={styles.animalMetaText}>•</Text>
                  <Text style={styles.animalMetaText}>{getAge(item.birth_date)}</Text>
                </View>
              </View>
              <Text style={styles.animalArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <AddPetModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadAnimals}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  animalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  animalImageContainer: {
    marginRight: Spacing.md,
  },
  animalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  animalImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animalImageEmoji: {
    fontSize: 32,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  animalBreed: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  animalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  animalMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  animalArrow: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
});
