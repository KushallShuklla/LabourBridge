import { router } from 'expo-router';
import { useEffect } from 'react';

export default function EmployerDashboard() {
  useEffect(() => {
    router.replace('/employer-tabs');
  }, []);

  return null;
}
