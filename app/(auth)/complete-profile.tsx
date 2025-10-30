import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing } from '../../constants/Colors';

const MALTA_LOCATIONS = [
  'Valletta',
  'Mdina',
  'Sliema',
  'St. Julian\'s',
  'Bugibba',
  'Mellieħa',
  'Marsaskala',
  'Mosta',
  'Birkirkara',
  'Qormi',
  'Rabat',
  'Victoria (Gozo)',
  'Other',
];

export default function CompleteProfileScreen() {
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [kennelName, setKennelName] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isBreeder = profile?.role?.includes('breeder');

  const handleComplete = async () => {
    if (!name || !location) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name,
        phone,
        location,
        kennel_name: kennelName || undefined,
      });
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Help others connect with you on PawMatch
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+356 XXXX XXXX"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Location in Malta *</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowLocationPicker(!showLocationPicker)}
                >
                  <Text style={location ? styles.inputText : styles.placeholder}>
                    {location || 'Select your location'}
                  </Text>
                </TouchableOpacity>
                {showLocationPicker && (
                  <View style={styles.picker}>
                    {MALTA_LOCATIONS.map((loc) => (
                      <TouchableOpacity
                        key={loc}
                        style={styles.pickerItem}
                        onPress={() => {
                          setLocation(loc);
                          setShowLocationPicker(false);
                        }}
                      >
                        <Text style={styles.pickerItemText}>{loc}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {isBreeder && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Kennel Name (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={kennelName}
                    onChangeText={setKennelName}
                    placeholder="e.g., Sunny Paws Kennel"
                    autoCapitalize="words"
                  />
                  <Text style={styles.hint}>
                    For registered breeders or if you have a kennel
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleComplete}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Completing...' : 'Complete Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
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
  form: {
    gap: Spacing.lg,
  },
  inputContainer: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  inputText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholder: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  picker: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});
