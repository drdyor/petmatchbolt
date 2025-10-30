import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';

export default function TabsLayout() {
  const { profile } = useAuth();

  const getTabsForRole = () => {
    const role = profile?.role;

    if (role === 'shelter') {
      return ['home', 'animals', 'messages', 'profile'];
    } else if (role === 'breeder_independent' || role === 'breeder_registered') {
      return ['home', 'pets', 'discover', 'messages', 'profile'];
    } else if (role === 'buyer') {
      return ['home', 'favorites', 'messages', 'profile'];
    } else if (role === 'vet') {
      return ['home', 'patients', 'messages', 'profile'];
    }

    return ['home', 'profile'];
  };

  const tabs = getTabsForRole();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="🏠" color={color} />,
        }}
      />

      {tabs.includes('animals') && (
        <Tabs.Screen
          name="animals"
          options={{
            title: 'Animals',
            tabBarIcon: ({ color }) => <TabIcon name="🐾" color={color} />,
          }}
        />
      )}

      {tabs.includes('pets') && (
        <Tabs.Screen
          name="pets"
          options={{
            title: 'My Pets',
            tabBarIcon: ({ color }) => <TabIcon name="🐕" color={color} />,
          }}
        />
      )}

      {tabs.includes('discover') && (
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color }) => <TabIcon name="💫" color={color} />,
          }}
        />
      )}

      {tabs.includes('favorites') && (
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color }) => <TabIcon name="❤️" color={color} />,
          }}
        />
      )}

      {tabs.includes('patients') && (
        <Tabs.Screen
          name="patients"
          options={{
            title: 'Patients',
            tabBarIcon: ({ color }) => <TabIcon name="📋" color={color} />,
          }}
        />
      )}

      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <TabIcon name="💬" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color }: { name: string; color: string }) {
  return <text style={{ fontSize: 24, color }}>{name}</text>;
}
