import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useT } from '@nomad/i18n';
import { useAuth } from './hooks/useAuth';

export default function Onboarding() {
  const { t } = useT();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [diet, setDiet] = useState<string>('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);

  const handleComplete = () => {
    // Save onboarding data
    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome to Nomad</Text>

      {step === 1 && (
        <View>
          <Text style={styles.label}>What are your goals?</Text>
          {/* Goal selection UI */}
          <Button title="Next" onPress={() => setStep(2)} />
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.label}>Dietary preferences</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Vegetarian, Keto"
            value={diet}
            onChangeText={setDiet}
          />
          <Button title="Next" onPress={() => setStep(3)} />
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={styles.label}>Allergies</Text>
          {/* Allergy selection */}
          <Button title="Next" onPress={() => setStep(4)} />
        </View>
      )}

      {step === 4 && (
        <View>
          <Text style={styles.label}>Privacy & Consent</Text>
          <Button
            title={consent ? 'Allow' : 'Decline'}
            onPress={() => setConsent(!consent)}
          />
          <Button title="Complete" onPress={handleComplete} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
});
