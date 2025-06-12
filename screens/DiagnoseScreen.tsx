import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useBasic } from '@basictech/expo';
import { format } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function DiagnoseScreen() {
  const navigation = useNavigation();
  const { db, isSignedIn } = useBasic();
  const { darkMode, isPremium } = useAppContext();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [previousDiagnoses, setPreviousDiagnoses] = useState([]);

  // Take photo with camera
  const takePhoto = () => {
    navigation.navigate('Camera' as never, { 
      onPhotoCapture: handleImageCapture,
      mode: 'diagnose'
    } as never);
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        handleImageCapture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  // Handle image capture
  const handleImageCapture = (imageUri) => {
    setImage(imageUri);
    diagnosePlant(imageUri);
  };

  // Diagnose plant disease
  const diagnosePlant = async (imageUri) => {
    setLoading(true);
    setDiagnosis(null);
    
    try {
      // Simulate API call to plant disease diagnosis service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock diagnosis results
      const mockDiagnoses = [
        {
          disease: 'Powdery Mildew',
          confidence: 0.89,
          description: 'A fungal disease that appears as a white or gray powdery substance on leaf surfaces.',
          treatment: 'Remove affected leaves. Apply fungicide. Improve air circulation around plants.',
          severity: 'Moderate'
        },
        {
          disease: 'Leaf Spot',
          confidence: 0.72,
          description: 'Caused by various fungi, appearing as dark spots on leaves that may enlarge over time.',
          treatment: 'Remove infected leaves. Avoid overhead watering. Apply appropriate fungicide.',
          severity: 'Mild'
        },
        {
          disease: 'Healthy Plant',
          confidence: 0.65,
          description: 'No signs of disease detected.',
          treatment: 'Continue regular care and monitoring.',
          severity: 'None'
        }
      ];
      
      // Get the top diagnosis
      const topDiagnosis = mockDiagnoses[0];
      setDiagnosis(topDiagnosis);
      
      // Add to previous diagnoses
      setPreviousDiagnoses(prev => [
        {
          id: Date.now().toString(),
          imageUrl: imageUri,
          disease: topDiagnosis.disease,
          date: new Date().toISOString(),
          severity: topDiagnosis.severity
        },
        ...prev
      ]);
    } catch (error) {
      console.error('Error diagnosing plant:', error);
      Alert.alert('Error', 'Failed to diagnose plant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear current diagnosis
  const clearDiagnosis = () => {
    setImage(null);
    setDiagnosis(null);
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return '#F44336';
      case 'Moderate':
        return '#FF9800';
      case 'Mild':
        return '#FFC107';
      case 'None':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <ScrollView>
        {/* Header */}
        <LinearGradient
          colors={darkMode ? ['#3A1E1E', '#5A2D2D'] : ['#F44336', '#FF5722']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Plant Disease Diagnosis</Text>
          <Text style={styles.headerSubtitle}>
            Take a photo of an affected leaf or plant part for diagnosis
          </Text>
        </LinearGradient>

        {/* Diagnosis Area */}
        <View style={styles.diagnosisArea}>
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearDiagnosis}
              >
                <Ionicons name="close-circle" size={30} color="white" />
              </TouchableOpacity>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#F44336" />
                  <Text style={styles.loadingText}>Analyzing plant health...</Text>
                </View>
              ) : diagnosis ? (
                <View style={styles.resultContainer}>
                  <View style={[
                    styles.severityBadge, 
                    { backgroundColor: getSeverityColor(diagnosis.severity) }
                  ]}>
                    <Text style={styles.severityText}>{diagnosis.severity} Severity</Text>
                  </View>
                  
                  <Text style={styles.diseaseTitle}>{diagnosis.disease}</Text>
                  <Text style={styles.diseaseConfidence}>
                    {Math.round(diagnosis.confidence * 100)}% confidence
                  </Text>
                  
                  <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Description:</Text>
                    <Text style={styles.infoText}>{diagnosis.description}</Text>
                  </View>
                  
                  <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Recommended Treatment:</Text>
                    <Text style={styles.infoText}>{diagnosis.treatment}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <MaterialCommunityIcons 
                name="medical-bag" 
                size={60} 
                color={darkMode ? '#F44336' : '#FF5722'} 
              />
              <Text style={[styles.uploadText, darkMode && styles.darkText]}>
                Take a photo or upload an image of the affected plant part
              </Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cameraButton]}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera" size={24} color="white" />
                  <Text style={styles.buttonText}>Camera</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.galleryButton]}
                  onPress={pickImage}
                >
                  <Ionicons name="images" size={24} color="white" />
                  <Text style={styles.buttonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
            Tips for Better Diagnosis
          </Text>
          
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FFC107" />
            <Text style={[styles.tipText, darkMode && styles.darkText]}>
              Take close-up photos of affected areas
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FFC107" />
            <Text style={[styles.tipText, darkMode && styles.darkText]}>
              Ensure good lighting for clear images
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FFC107" />
            <Text style={[styles.tipText, darkMode && styles.darkText]}>
              Include both healthy and affected parts for comparison
            </Text>
          </View>
        </View>

        {/* Previous Diagnoses */}
        {previousDiagnoses.length > 0 && (
          <View style={styles.previousSection}>
            <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
              Previous Diagnoses
            </Text>
            
            {previousDiagnoses.map((item) => (
              <View key={item.id} style={styles.diagnosisItem}>
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={styles.diagnosisImage}
                />
                <View style={styles.diagnosisDetails}>
                  <Text style={[styles.diagnosisName, darkMode && styles.darkText]}>
                    {item.disease}
                  </Text>
                  <Text style={styles.diagnosisDate}>
                    {format(new Date(item.date), 'MMM d, yyyy')}
                  </Text>
                  <View style={[
                    styles.severityIndicator, 
                    { backgroundColor: getSeverityColor(item.severity) }
                  ]}>
                    <Text style={styles.severityIndicatorText}>{item.severity}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Premium Promotion */}
        {!isPremium && (
          <View style={styles.premiumPromo}>
            <LinearGradient
              colors={['#8E2DE2', '#4A00E0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumGradient}
            >
              <MaterialCommunityIcons name="crown" size={30} color="#FFD700" />
              <View style={styles.premiumTextContainer}>
                <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumText}>
                  Get detailed treatment plans and expert advice for plant diseases
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
  diagnosisArea: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  uploadContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  darkText: {
    color: '#E0E0E0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '45%',
  },
  cameraButton: {
    backgroundColor: '#F44336',
  },
  galleryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    padding: 20,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  severityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  diseaseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  diseaseConfidence: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 5,
    marginBottom: 15,
  },
  infoSection: {
    marginTop: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tipsSection: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  previousSection: {
    margin: 20,
    marginTop: 0,
  },
  diagnosisItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  diagnosisImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  diagnosisDetails: {
    flex: 1,
    padding: 12,
  },
  diagnosisName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  diagnosisDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 3,
  },
  severityIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 5,
  },
  severityIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  premiumPromo: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  premiumTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  premiumText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
});