import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useBasic } from '@basictech/expo';
import { useAppContext } from '../context/AppContext';

export default function AddPlantScreen() {
  const navigation = useNavigation();
  const { db, isSignedIn } = useBasic();
  const { darkMode, scheduleWateringReminder } = useAppContext();
  
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('7');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Save plant
  const savePlant = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a plant name');
      return;
    }
    
    if (!image) {
      Alert.alert('Error', 'Please add a photo of your plant');
      return;
    }
    
    const frequency = parseInt(wateringFrequency, 10);
    if (isNaN(frequency) || frequency <= 0) {
      Alert.alert('Error', 'Please enter a valid watering frequency');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isSignedIn && db) {
        const newPlant = {
          name: name.trim(),
          species: species.trim(),
          image,
          wateringFrequency: frequency,
          lastWatered: new Date().toISOString(),
          notes: notes.trim(),
          isPremium: false,
        };
        
        // Add plant to database
        const addedPlant = await db.from('plants').add(newPlant);
        
        // Schedule watering reminder
        await scheduleWateringReminder(addedPlant.id, addedPlant.name, frequency);
        
        Alert.alert(
          'Success',
          `${name} has been added to your collection!`,
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving plant:', error);
      Alert.alert('Error', 'Failed to save plant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Image Picker */}
      <View style={styles.imagePickerContainer}>
        {image ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity 
              style={styles.changeImageButton}
              onPress={pickImage}
            >
              <Text style={styles.changeImageText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons 
              name="image-plus" 
              size={60} 
              color={darkMode ? '#4CAF50' : '#8BC34A'} 
            />
            <Text style={[styles.imagePlaceholderText, darkMode && styles.darkText]}>
              Add a photo of your plant
            </Text>
            
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity 
                style={[styles.imageButton, styles.galleryButton]}
                onPress={pickImage}
              >
                <Ionicons name="images" size={20} color="white" />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.imageButton, styles.cameraButton]}
                onPress={takePhoto}
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text style={styles.imageButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Plant Details Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, darkMode && styles.darkText]}>Plant Name *</Text>
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            value={name}
            onChangeText={setName}
            placeholder="Enter plant name"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, darkMode && styles.darkText]}>Species</Text>
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            value={species}
            onChangeText={setSpecies}
            placeholder="Enter species (optional)"
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, darkMode && styles.darkText]}>
            Watering Frequency (days) *
          </Text>
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            value={wateringFrequency}
            onChangeText={setWateringFrequency}
            placeholder="Days between watering"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, darkMode && styles.darkText]}>Notes</Text>
          <TextInput
            style={[styles.textArea, darkMode && styles.darkInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about your plant (optional)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity 
          style={[
            styles.saveButton,
            isSubmitting && styles.disabledButton
          ]}
          onPress={savePlant}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Saving...' : 'Add to My Plants'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  imagePickerContainer: {
    padding: 20,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  darkText: {
    color: '#E0E0E0',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  galleryButton: {
    backgroundColor: '#2196F3',
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
  },
  imageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  changeImageText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  darkInput: {
    backgroundColor: '#333',
    color: 'white',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 100,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});