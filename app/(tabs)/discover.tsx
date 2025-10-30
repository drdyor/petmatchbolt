import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import SwipeableCard from '../../components/SwipeableCard';

interface StudPet {
  id: string;
  name: string;
  breed: string;
  gender: string;
  photos: string[];
  birth_date: string | null;
  description: string;
  owner_id: string;
  owner?: {
    name: string;
    location: string;
  };
}

export default function DiscoverScreen() {
  const { profile } = useAuth();
  const [pets, setPets] = useState<StudPet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudPets();
  }, []);

  const loadStudPets = async () => {
    try {
      const { data: listings, error } = await supabase
        .from('listings')
        .select(`
          *,
          pet:pets(
            id,
            name,
            breed,
            gender,
            photos,
            birth_date,
            description,
            owner_id
          ),
          owner:users(
            id,
            name,
            location
          )
        `)
        .eq('listing_type', 'stud')
        .eq('status', 'live')
        .neq('owner_id', profile?.id);

      if (error) throw error;

      const studPets: StudPet[] = (listings || [])
        .filter((listing: any) => listing.pet)
        .map((listing: any) => ({
          ...listing.pet,
          owner: listing.owner,
        }));

      setPets(studPets);
    } catch (error) {
      console.error('Error loading stud pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = async () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSwipeRight = async () => {
    const currentPet = pets[currentIndex];
    if (currentPet) {
      try {
        await supabase.from('favorites').insert({
          user_id: profile?.id,
          pet_id: currentPet.id,
        });
      } catch (error) {
        console.error('Error saving favorite:', error);
      }
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const currentPet = pets[currentIndex];
  const hasMore = currentIndex < pets.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Studs</Text>
        <Text style={styles.subtitle}>
          {hasMore ? `${pets.length - currentIndex} available` : 'No more'}
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {!hasMore ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyTitle}>No more studs</Text>
            <Text style={styles.emptyText}>
              Check back later for new breeding opportunities
            </Text>
            <TouchableOpacity style={styles.reloadButton} onPress={loadStudPets}>
              <Text style={styles.reloadButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {currentPet && (
              <SwipeableCard
                key={currentPet.id}
                pet={currentPet}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
              />
            )}
          </>
        )}
      </View>

      {hasMore && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.rejectButton} onPress={handleSwipeLeft}>
            <Text style={styles.controlEmoji}>✕</Text>
          </TouchableOpacity>

          {currentIndex > 0 && (
            <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
              <Text style={styles.controlEmoji}>↶</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.likeButton} onPress={handleSwipeRight}>
            <Text style={styles.controlEmoji}>♥</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>←</Text>
          <Text style={styles.legendText}>Pass</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>→</Text>
          <Text style={styles.legendText}>Interested</Text>
        </View>
      </View>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
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
  reloadButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  reloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  rejectButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.danger,
  },
  undoButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.textSecondary,
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.success,
  },
  controlEmoji: {
    fontSize: 24,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendEmoji: {
    fontSize: 20,
  },
  legendText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
