import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [profile]);

  const loadStats = async () => {
    if (!profile) return;

    try {
      const [petsResult, listingsResult] = await Promise.all([
        supabase
          .from('pets')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', profile.id),
        supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', profile.id)
          .eq('status', 'live'),
      ]);

      setStats({
        totalPets: petsResult.count || 0,
        activeListings: listingsResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{profile?.name || 'Welcome'}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.[0]?.toUpperCase() || '👤'}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {profile?.role === 'shelter' && (
            <>
              <StatCard
                emoji="🐾"
                number={stats.totalPets}
                label="Animals"
              />
              <StatCard
                emoji="📋"
                number={stats.activeListings}
                label="Adoptions"
              />
            </>
          )}

          {(profile?.role === 'breeder_independent' || profile?.role === 'breeder_registered') && (
            <>
              <StatCard
                emoji="🐕"
                number={stats.totalPets}
                label="My Pets"
              />
              <StatCard
                emoji="💫"
                number={stats.activeListings}
                label="Active Studs"
              />
            </>
          )}

          {profile?.role === 'buyer' && (
            <>
              <StatCard
                emoji="🔍"
                number={0}
                label="Browsing"
              />
              <StatCard
                emoji="❤️"
                number={0}
                label="Favorites"
              />
            </>
          )}

          {profile?.role === 'vet' && (
            <>
              <StatCard
                emoji="📋"
                number={0}
                label="Patients"
              />
              <StatCard
                emoji="📅"
                number={0}
                label="Appointments"
              />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            {profile?.role === 'shelter' && (
              <>
                <ActionCard
                  emoji="➕"
                  title="Add Animal"
                  description="Register new intake"
                />
                <ActionCard
                  emoji="📢"
                  title="Post Adoption"
                  description="List for adoption"
                />
                <ActionCard
                  emoji="🚨"
                  title="Urgent Alert"
                  description="At-risk animal"
                />
              </>
            )}

            {(profile?.role === 'breeder_independent' || profile?.role === 'breeder_registered') && (
              <>
                <ActionCard
                  emoji="➕"
                  title="Add Pet"
                  description="Register your pet"
                />
                <ActionCard
                  emoji="📅"
                  title="Track Heat"
                  description="Log heat cycle"
                />
                <ActionCard
                  emoji="💫"
                  title="Post Stud"
                  description="List for breeding"
                />
                <ActionCard
                  emoji="🍼"
                  title="Announce Litter"
                  description="Upcoming puppies"
                />
              </>
            )}

            {profile?.role === 'buyer' && (
              <>
                <ActionCard
                  emoji="🔍"
                  title="Browse Pets"
                  description="Find your match"
                />
                <ActionCard
                  emoji="🔔"
                  title="Set Alerts"
                  description="Get notified"
                />
              </>
            )}

            {profile?.role === 'vet' && (
              <>
                <ActionCard
                  emoji="📋"
                  title="View Requests"
                  description="Appointment requests"
                />
                <ActionCard
                  emoji="📜"
                  title="Issue Certificate"
                  description="Health clearance"
                />
              </>
            )}
          </View>
        </View>

        {(profile?.role === 'breeder_independent' || profile?.role === 'breeder_registered') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Heat Tracking</Text>
            <View style={styles.heatCard}>
              <Text style={styles.heatEmoji}>📅</Text>
              <View style={styles.heatInfo}>
                <Text style={styles.heatTitle}>No active heat cycles</Text>
                <Text style={styles.heatDescription}>
                  Track your pet's heat cycles to optimize breeding
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ emoji, number, label }: { emoji: string; number: number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <TouchableOpacity style={styles.actionCard}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    width: '48%',
    minHeight: 100,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  heatCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heatEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  heatInfo: {
    flex: 1,
  },
  heatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  heatDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
