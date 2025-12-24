import { IBMPlexSerif_400Regular, useFonts } from '@expo-google-fonts/ibm-plex-serif';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    IBMPlexSerif_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>solmap</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>open app</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'IBMPlexSerif_400Regular',
    fontSize: 48,
    color: '#000000',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#367AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'IBMPlexSerif_400Regular',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
