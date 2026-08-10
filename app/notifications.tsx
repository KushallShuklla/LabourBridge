import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotificationsScreen() {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const subscription = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.read).length || 0);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'application_status': return '📋';
      case 'new_job': return '💼';
      case 'job_selected': return '✅';
      case 'document_verified': return '📄';
      default: return '🔔';
    }
  };

  const translateNotification = (title: string, message: string) => {
    if (language === 'en') return { title, message };

    let translatedTitle = title;
    let translatedMessage = message;

    if (title.includes('Application Status Updated')) translatedTitle = 'आवेदन स्थिति अपडेट';
    if (title.includes('Congratulations')) translatedTitle = 'बधाई हो! 🎉';
    if (title.includes('Document Verified')) translatedTitle = 'दस्तावेज़ सत्यापित ✓';
    if (title.includes('New Job Match')) translatedTitle = 'नई नौकरी मैच! 💼';
    if (title.includes('New Job Application')) translatedTitle = 'नया नौकरी आवेदन';

    if (message.includes('is now Shortlisted')) translatedMessage = message.replace('is now Shortlisted', 'अब शॉर्टलिस्ट किया गया');
    if (message.includes('is now Selected')) translatedMessage = message.replace('is now Selected', 'अब चयनित किया गया');
    if (message.includes('is now Rejected')) translatedMessage = message.replace('is now Rejected', 'अब अस्वीकृत किया गया');
    if (message.includes('is now Viewed')) translatedMessage = message.replace('is now Viewed', 'अब देखा गया');
    if (message.includes('You have been selected for')) translatedMessage = message.replace('You have been selected for', 'आपको चुना गया है');
    if (message.includes('Your documents have been verified')) translatedMessage = 'आपके दस्तावेज़ सत्यापित किए गए';
    if (message.includes('A new job matching your skills')) translatedMessage = message.replace('A new job matching your skills', 'आपके कौशल से मेल खाती नई नौकरी');
    if (message.includes('applied for')) translatedMessage = message.replace('applied for', 'के लिए आवेदन किया');
    if (message.includes('Your application for')) translatedMessage = message.replace('Your application for', 'आपका आवेदन');

    return { title: translatedTitle, message: translatedMessage };
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
          {language === 'hi' ? 'सूचनाएं' : 'Notifications'} {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={{ color: '#1E90FF' }}>{language === 'hi' ? 'सभी पढ़े गए चिह्नित करें' : 'Mark all read'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
          {language === 'hi' ? 'अभी तक कोई सूचना नहीं' : 'No notifications yet'}
        </Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const { title, message } = translateNotification(item.title, item.message);
            return (
            <TouchableOpacity
              onPress={() => !item.read && markAsRead(item.id)}
              style={{
                borderWidth: 1,
                borderRadius: 6,
                padding: 12,
                marginBottom: 10,
                backgroundColor: item.read ? 'white' : '#E3F2FD',
                borderColor: item.read ? '#E0E0E0' : '#1E90FF',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginRight: 10 }}>
                  {getIcon(item.type)}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                    {title}
                  </Text>
                  <Text style={{ marginTop: 3, color: '#666' }}>
                    {message}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
                {!item.read && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#1E90FF',
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
