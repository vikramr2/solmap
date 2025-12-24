import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IBMPlexSerif_400Regular, useFonts } from '@expo-google-fonts/ibm-plex-serif';
import { CLAUDE_API_KEY } from '@/config';

export default function EditorScreen() {
  const params = useLocalSearchParams();
  const [text, setText] = useState(params.text as string || '');
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    IBMPlexSerif_400Regular,
  });

  const handleSubmit = () => {
    if (!text.trim()) {
      alert('Please enter some text first');
      return;
    }

    if (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'your_api_key_here') {
      alert('Please add your Claude API key to the .env file');
      return;
    }

    router.push({
      pathname: '/graph',
      params: { text, apiKey: CLAUDE_API_KEY }
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scanned Text</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
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

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Generate Causal Graph</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    minHeight: 200,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  submitButton: {
    backgroundColor: '#367AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'IBMPlexSerif_400Regular',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
