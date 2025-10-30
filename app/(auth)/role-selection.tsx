import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing } from '../../constants/Colors';

type UserRole = 'shelter' | 'breeder_independent' | 'breeder_registered' | 'buyer' | 'vet';

interface RoleOption {
  role: UserRole;
  emoji: string;
  title: string;
  description: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'shelter',
    emoji: '🏠',
    title: 'Animal Shelter',
    description: 'Manage animals and find loving homes for rescues',
  },
  {
    role: 'breeder_independent',
    emoji: '🐕',
    title: 'Independent Breeder',
    description: 'Track heat cycles and manage your breeding program',
  },
  {
    role: 'breeder_registered',
    emoji: '📋',
    title: 'Registered Breeder',
    description: 'Licensed kennel with official registration',
  },
  {
    role: 'buyer',
    emoji: '❤️',
    title: 'Looking for a Pet',
    description: 'Find your perfect companion or breeding partner',
  },
  {
    role: 'vet',
    emoji: '⚕️',
    title: 'Veterinarian',
    description: 'Coordinate with pet owners and issue certificates',
  },
];

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useAuth();
  const router = useRouter();

  const handleContinue = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      await updateProfile({ role: selectedRole });
      router.replace('/(auth)/complete-profile');
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>I am a...</Text>
          <Text style={styles.subtitle}>
            Choose your role to personalize your experience
          </Text>

          <View style={styles.rolesContainer}>
            {ROLES.map((roleOption) => (
              <TouchableOpacity
                key={roleOption.role}
                style={[
                  styles.roleCard,
                  selectedRole === roleOption.role && styles.roleCardSelected,
                ]}
                onPress={() => setSelectedRole(roleOption.role)}
              >
                <View style={styles.roleHeader}>
                  <Text style={styles.roleEmoji}>{roleOption.emoji}</Text>
                  <View
                    style={[
                      styles.checkbox,
                      selectedRole === roleOption.role && styles.checkboxSelected,
                    ]}
                  >
                    {selectedRole === roleOption.role && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </View>
                <Text style={styles.roleTitle}>{roleOption.title}</Text>
                <Text style={styles.roleDescription}>{roleOption.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, !selectedRole && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!selectedRole || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Continuing...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  rolesContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  roleCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  roleEmoji: {
    fontSize: 32,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
