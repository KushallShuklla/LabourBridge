import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { safeLog } from '@/utils/safeLogging';
import { isValidUrl } from '@/utils/urlValidation';

export default function DocumentsScreen() {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('worker_id', user.id)
      .order('uploaded_at', { ascending: false });

    setDocuments(data || []);
  };

  const pickDocument = async (type: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadDocument(result.assets[0].uri, type);
    }
  };

  const uploadDocument = async (uri: string, type: string) => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      setUploading(false);
      return;
    }

    try {
      safeLog.info('Starting upload for:', type);
      
      // Validate URI before processing
      if (!isValidUrl(uri)) {
        throw new Error('Invalid file URI');
      }
      
      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      
      // Get file extension from blob type or default to jpg
      const fileExt = blob.type.split('/')[1] || 'jpg';
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
      safeLog.info('Uploading to:', fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        safeLog.error('Upload error:', uploadError.message);
        throw uploadError;
      }

      safeLog.info('Upload successful');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      safeLog.info('Public URL generated');

      // Save to database
      const { error: dbError } = await supabase.from('documents').insert({
        worker_id: user.id,
        document_type: type,
        file_url: publicUrl,
        verified: false,
      });

      if (dbError) {
        safeLog.error('Database error:', dbError.message);
        throw dbError;
      }

      Alert.alert('Success', 'Document uploaded successfully');
      fetchDocuments();
    } catch (error: any) {
      safeLog.error('Upload failed:', error.message);
      Alert.alert('Error', error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id: string, fileUrl: string) => {
    safeLog.info('Delete button clicked for document ID');
    
    // For web, use window.confirm instead of Alert.alert
    const confirmed = typeof window !== 'undefined' && window.confirm 
      ? window.confirm('Are you sure you want to delete this document?')
      : true;
    
    if (!confirmed) return;
    
    try {
      safeLog.info('Deleting document');
      
      // Delete from database first
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (dbError) {
        safeLog.error('Database delete error:', dbError.message);
        throw dbError;
      }
      
      // Try to delete from storage (optional, won't fail if it doesn't work)
      try {
        const match = fileUrl.match(/\/documents\/(.+)$/);
        if (match && match[1]) {
          const filePath = decodeURIComponent(match[1]);
          safeLog.info('Deleting file from storage');
          await supabase.storage.from('documents').remove([filePath]);
        }
      } catch (storageError: any) {
        safeLog.info('Storage delete failed (non-critical):', storageError.message);
      }
      
      Alert.alert('Success', 'Document deleted');
      fetchDocuments();
    } catch (error: any) {
      safeLog.error('Delete error:', error.message);
      Alert.alert('Error', error.message || 'Failed to delete document');
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 15 }}>
        {language === 'hi' ? 'मेरे दस्तावेज़' : 'My Documents'}
      </Text>

      <Text style={{ marginBottom: 15, color: '#666' }}>
        {language === 'hi' ? 'सत्यापन के लिए अपने दस्तावेज़ अपलोड करें' : 'Upload your documents for verification'}
      </Text>

      <View style={{ marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => pickDocument('aadhaar')}
          disabled={uploading}
          style={{
            backgroundColor: '#1E90FF',
            padding: 15,
            borderRadius: 6,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
            {language === 'hi' ? '📄 आधार कार्ड अपलोड करें' : '📄 Upload Aadhaar Card'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => pickDocument('certificate')}
          disabled={uploading}
          style={{
            backgroundColor: '#28A745',
            padding: 15,
            borderRadius: 6,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
            {language === 'hi' ? '🎓 प्रमाणपत्र अपलोड करें' : '🎓 Upload Certificate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => pickDocument('photo')}
          disabled={uploading}
          style={{
            backgroundColor: '#6F42C1',
            padding: 15,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
            {language === 'hi' ? '📸 फोटो आईडी अपलोड करें' : '📸 Upload Photo ID'}
          </Text>
        </TouchableOpacity>
      </View>

      {uploading && (
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 15 }}>
          {language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading...'}
        </Text>
      )}

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        {language === 'hi' ? 'अपलोड किए गए दस्तावेज़' : 'Uploaded Documents'}
      </Text>

      {documents.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
          {language === 'hi' ? 'अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया' : 'No documents uploaded yet'}
        </Text>
      ) : (
        documents.map((doc) => (
          <View
            key={doc.id}
            style={{
              borderWidth: 1,
              borderRadius: 6,
              padding: 10,
              marginBottom: 10,
              backgroundColor: doc.verified ? '#E8F5E9' : 'white',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                {doc.document_type.toUpperCase()}
              </Text>
              <View
                style={{
                  backgroundColor: doc.verified ? '#28A745' : '#FFC107',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}
              >
                <Text style={{ color: 'white', fontSize: 12 }}>
                  {doc.verified ? (language === 'hi' ? '✓ सत्यापित' : '✓ Verified') : (language === 'hi' ? '⏳ लंबित' : '⏳ Pending')}
                </Text>
              </View>
            </View>

            {doc.file_url && (
              <Image
                source={{ uri: doc.file_url }}
                style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 6 }}
                resizeMode="cover"
              />
            )}

            <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
              {language === 'hi' ? 'अपलोड किया गया:' : 'Uploaded:'} {new Date(doc.uploaded_at).toLocaleDateString()}
            </Text>

            <TouchableOpacity
              onPress={() => deleteDocument(doc.id, doc.file_url)}
              style={{
                marginTop: 10,
                backgroundColor: '#DC3545',
                padding: 8,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>{language === 'hi' ? 'हटाएं' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}
