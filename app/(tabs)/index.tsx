import { IBMPlexSerif_400Regular, IBMPlexSerif_400Regular_Italic, IBMPlexSerif_700Bold, useFonts } from '@expo-google-fonts/ibm-plex-serif';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'IBMPlexSerif_400Regular': IBMPlexSerif_400Regular,
    'IBMPlexSerif_400Regular_Italic': IBMPlexSerif_400Regular_Italic,
    'IBMPlexSerif_700Bold': IBMPlexSerif_700Bold,
  });
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (fontsLoaded) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          alignItems: 'center',
        }}
      >
        <Text style={styles.title}>solmap</Text>
        <Text style={styles.body}>a causal mapping of the soul</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/camera')}>
            <Text style={styles.buttonText}>scan text</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push({ pathname: '/editor', params: { text: '' } })}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>enter text manually</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: 'IBMPlexSerif_400Regular_Italic',
    fontSize: 18,
    color: '#555555',
    marginBottom: 60,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'IBMPlexSerif_700Bold',
    fontSize: 48,
    color: '#000000',
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#367AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#367AFF',
  },
  buttonText: {
    fontFamily: 'IBMPlexSerif_400Regular',
    color: '#FFFFFF',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#367AFF',
  },
});
