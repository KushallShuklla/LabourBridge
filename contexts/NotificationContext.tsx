import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerForPushNotifications, addNotificationListener, addNotificationResponseListener } from '../services/notificationService';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
}

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  notification: null,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Push notifications disabled for Expo Go compatibility
    // Uncomment below for development builds
    /*
    if (Platform.OS !== 'web') {
      registerForPushNotifications().then(token => setExpoPushToken(token));
    }

    notificationListener.current = addNotificationListener(notification => {
      setNotification(notification);
    });

    responseListener.current = addNotificationResponseListener(response => {
      console.log('Notification tapped:', response);
    });

    return () => {
      if (notificationListener.current && Platform.OS !== 'web') {
        notificationListener.current.remove();
      }
      if (responseListener.current && Platform.OS !== 'web') {
        responseListener.current.remove();
      }
    };
    */
  }, []);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};
