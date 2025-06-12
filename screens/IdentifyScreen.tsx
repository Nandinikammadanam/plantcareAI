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

export default function IdentifyScreen() {
  const navigation = useNavigation();
  const { db, isSignedIn } = useBasic();
  const { darkMode, isPremium } = useAppContext();
  const [image, setImage] = useState(null);
  const [identifications, setIdentifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Load previous identifications
  useEffect(() => {
    if (isSignedIn && db) {
      loadIdentifications();
    }
  }, [isSignedIn, db]);

  // Load identifications from database
  const loadIdentifications = async () => {
    try {
      const identificationsData = await db.from('identifications').getAll();
      setIdentifications(identificationsData.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (error) {
      console.error('Error loading identifications:', error);
    }
  };

  // Take photo with camera
  const takePhoto = () => {
    navigation.navigate('Camera' as never, { 
      onPhotoCapture: handleImageCapture,
      mode: 'identify'
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
    identifyPlant(imageUri);
  };

  // Identify plant from image
  const identifyPlant = async (imageUri) => {
    setLoading(true);
    setResult(null);
    
    try {
      // Simulate API call to plant identification service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock identification result
      const mockResults = [
        { name: 'Monstera Deliciosa', confidence: 0.92 },
        { name: 'Philodendron', confidence: 0.85 },
        { name: 'Swiss Cheese Plant', confidence: 0.78 },
      ];
      
      // Get the top result
      const topResult = mockResults[0];
      setResult(topResult);
      
      // Save identification to database
      if (isSignedIn && db) {
        const newIdentification = {
          imageUrl: imageUri,
          result: topResult.name,
          confidence: topResult.confidence,
          date: new Date().toISOString(),
          notes: '',
        };
        
        await db.from('identifications').add(newIdentification);
        await loadIdentifications();
      }
    } catch (error) {
      console.error('Error identifying plant:', error);
      Alert.alert('Error', 'Failed to identify plant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear current identification
  const clearIdentification = () => {
    setImage(null);
    setResult(null);
  };

  // Add identified plant to collection
  const addToCollection = async () => {
    if (!result) return;
    
    try {
      if (isSignedIn && db) {
        const newPlant = {
          name: result.name,
          species: result.name,
          image: image,
          wateringFrequency: 7, // Default to weekly watering
          lastWatered: new Date().toISOString(),
          notes: '',
          isPremium: false,
        };
        
        await db.from('plants').add(newPlant);
        Alert.alert('Success', `${result.name} added to your collection!`);
        
        // Navigate to My Plants
        navigation.navigate('My Plants' as never);
      }
    } catch (error) {
      console.error('Error adding plant to collection:', error);
      Alert.alert('Error', 'Failed to add plant to your collection');
    }
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <ScrollView>
        {/* Header */}
        <LinearGradient
          colors={darkMode ? ['#1E3A2B', '#2D5A40'] : ['#4CAF50', '#8BC34A']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Plant Identification</Text>
          <Text style={styles.headerSubtitle}>
            Take a photo or upload an image to identify your plant
          </Text>
        </LinearGradient>

        {/* Identification Area */}
        <View style={styles.identificationArea}>
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearIdentification}
              >
                <Ionicons name="close-circle" size={30} color="white" />
              </TouchableOpacity>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Identifying plant...</Text>
                </View>
              ) : result ? (
                <View style={styles.resultContainer}>
                  <Text style={styles.resultTitle}>{result.name}</Text>
                  <Text style={styles.resultConfidence}>
                    {Math.round(result.confidence * 100)}% match
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={addToCollection}
                  >
                    <Text style={styles.addButtonText}>Add to My Plants</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <MaterialCommunityIcons 
                name="leaf-maple" 
                size={60} 
                color={darkMode ? '#4CAF50' : '#8BC34A'} 
              />
              <Text style={[styles.uploadText, darkMode && styles.darkText]}>
                Take a photo or upload an image of a plant to identify it
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

        {/* Previous Identifications */}
        <View style={styles.previousSection}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
            Previous Identifications
          </Text>
          
          {identifications.length > 0 ? (
            identifications.map((identification) => (
              <View key={identification.id} style={styles.identificationItem}>
                <Image 
                  source={{ uri: identification.imageUrl }} 
                  style={styles.identificationImage}
                  defaultSource={require('../assets/images/identification.jpg')}
                />
                <View style={styles.identificationDetails}>
                  <Text style={[styles.identificationName, darkMode && styles.darkText]}>
                    {identification.result}
                  </Text>
                  <Text style={styles.identificationDate}>
                    {format(new Date(identification.date), 'MMM d, yyyy')}
                  </Text>
                  <View style={styles.confidenceBar}>
                    <View 
                      style={[
                        styles.confidenceFill, 
                        { width: `${identification.confidence * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="leaf-off" 
                size={40} 
                color="#BDBDBD" 
              />
              <Text style={[styles.emptyStateText, darkMode && styles.darkText]}>
                No identifications yet
              </Text>
            </View>
          )}
        </View>

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
                  Get unlimited identifications and access to our complete plant database
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
  identificationArea: {
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
    backgroundColor: '#4CAF50',
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
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  resultConfidence: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 15,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previousSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  identificationItem: {
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
  identificationImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  identificationDetails: {
    flex: 1,
    padding: 12,
  },
  identificationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  identificationDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 3,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  premiumPromo: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
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