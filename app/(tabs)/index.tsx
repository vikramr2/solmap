import { IBMPlexSerif_400Regular, IBMPlexSerif_400Regular_Italic, IBMPlexSerif_700Bold, useFonts } from '@expo-google-fonts/ibm-plex-serif';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'IBMPlexSerif_400Regular': IBMPlexSerif_400Regular,
    'IBMPlexSerif_400Regular_Italic': IBMPlexSerif_400Regular_Italic,
    'IBMPlexSerif_700Bold': IBMPlexSerif_700Bold,
  });
  const router = useRouter();
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
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

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setAuthLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setEmail('');
      setPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Sign out failed');
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#367AFF" />
      </View>
    );
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

        {!user ? (
          <View style={styles.authContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleAuth}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
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
            <TouchableOpacity
              style={[styles.button, styles.signOutButton]}
              onPress={handleSignOut}
            >
              <Text style={styles.buttonText}>sign out</Text>
            </TouchableOpacity>
          </View>
        )}
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
  authContainer: {
    width: 300,
    gap: 16,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    fontFamily: 'IBMPlexSerif_400Regular',
    fontSize: 16,
    color: '#000000',
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
  signOutButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    fontFamily: 'IBMPlexSerif_400Regular',
    color: '#FFFFFF',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#367AFF',
  },
  toggleText: {
    fontFamily: 'IBMPlexSerif_400Regular',
    color: '#367AFF',
    fontSize: 14,
    marginTop: 8,
  },
});
