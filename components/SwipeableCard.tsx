import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Colors, Spacing } from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeableCardProps {
  pet: {
    id: string;
    name: string;
    breed: string;
    gender: string;
    photos: string[];
    birth_date: string | null;
    description?: string;
    owner?: {
      name: string;
      location: string;
    };
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeableCard({ pet, onSwipeLeft, onSwipeRight }: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number; startY: number }
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: (event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH);
        runOnJS(onSwipeRight)();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH);
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = (translateX.value / SCREEN_WIDTH) * 25;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const getAge = (birthDate: string | null) => {
    if (!birthDate) return 'Age unknown';
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    return `${years} years old`;
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.imageContainer}>
          {pet.photos?.[0] ? (
            <Image source={{ uri: pet.photos[0] }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderEmoji}>
                {pet.gender === 'male' ? '🐕' : '🐕‍🦺'}
              </Text>
            </View>
          )}
          <View style={styles.overlay}>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.breed}>{pet.breed}</Text>
              <Text style={styles.age}>
                {pet.gender === 'male' ? '♂' : '♀'} {getAge(pet.birth_date)}
              </Text>
              {pet.owner && (
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerName}>{pet.owner.name}</Text>
                  <Text style={styles.ownerLocation}>📍 {pet.owner.location}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - Spacing.lg * 2,
    height: '75%',
    alignSelf: 'center',
  },
  imageContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    padding: Spacing.lg,
  },
  infoContainer: {
    gap: 4,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  breed: {
    fontSize: 20,
    color: Colors.white,
  },
  age: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  ownerInfo: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  ownerLocation: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
});
