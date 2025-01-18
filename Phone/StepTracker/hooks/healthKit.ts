import { HealthConnected } from 'expo-health';

interface StepDataRange {
  startDate: Date;
  endDate: Date;
}

export async function requestPermissions(): Promise<boolean> {
  try {
    const health = new HealthConnected();
    const isAvailable = await health.isAvailable();
    
    if (!isAvailable) {
      throw new Error('HealthKit is not available on this device');
    }

    const result = await health.requestPermissions([
      {
        accessType: 'read',
        dataType: 'Steps',
      },
    ]);

    return result;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    throw error;
  }
}

export async function getSteps(startDate: Date, endDate: Date): Promise<number> {
  try {
    const health = new HealthConnected();
    const steps = await health.getSteps({
      startDate,
      endDate,
    });
    
    return steps;
  } catch (error) {
    console.error('Error fetching steps:', error);
    throw error;
  }
}