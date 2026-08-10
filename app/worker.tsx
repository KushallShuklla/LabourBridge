import { router } from 'expo-router';
import { useEffect } from 'react';

export default function WorkerDashboard() {
  useEffect(() => {
    router.replace('/worker-tabs');
  }, []);

  return null;
}