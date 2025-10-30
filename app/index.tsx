import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';

export default function Index() {
  const { session, profile, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (loading && !timeoutReached) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: Colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (timeoutReached && loading) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!profile || !profile.role) {
    return <Redirect href="/(auth)/role-selection" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
