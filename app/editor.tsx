import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IBMPlexSerif_400Regular, useFonts } from '@expo-google-fonts/ibm-plex-serif';

export default function EditorScreen() {
  const params = useLocalSearchParams();
  const [text, setText] = useState(params.text as string || '');
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    IBMPlexSerif_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scanned Text</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.editorContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Your scanned text will appear here..."
          placeholderTextColor="#999"
          autoFocus
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontFamily: 'IBMPlexSerif_400Regular',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  backButton: {
    backgroundColor: '#367AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editorContainer: {
    flex: 1,
    padding: 20,
  },
  textInput: {
    fontFamily: 'IBMPlexSerif_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    minHeight: '100%',
  },
});
