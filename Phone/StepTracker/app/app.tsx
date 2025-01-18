import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { requestPermissions, getSteps } from '../hooks/healthKit';

interface StepData {
  steps: number;
  hasPermission: boolean;
  error: string | null;
}

export default function App() {
  const [stepData, setStepData] = useState<StepData>({
    steps: 0,
    hasPermission: false,
    error: null
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async (): Promise<void> => {
    try {
      const granted = await requestPermissions();
      setStepData(prev => ({ ...prev, hasPermission: granted }));
      if (granted) {
        fetchSteps();
      }
    } catch (err) {
      setStepData(prev => ({ 
        ...prev, 
        error: 'Failed to get permissions'
      }));
      console.error(err);
    }
  };

  const fetchSteps = async (): Promise<void> => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const numberOfSteps = await getSteps(startOfDay, new Date());
      setStepData(prev => ({ ...prev, steps: numberOfSteps }));
    } catch (err) {
      setStepData(prev => ({ 
        ...prev, 
        error: 'Failed to fetch steps'
      }));
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      {stepData.error ? (
        <Text style={styles.error}>{stepData.error}</Text>
      ) : (
        <>
          <Text style={styles.title}>Step Tracker</Text>
          <Text style={styles.steps}>{stepData.steps}</Text>
          <Text style={styles.label}>steps today</Text>
          <Button title="Refresh Steps" onPress={fetchSteps} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  steps: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});