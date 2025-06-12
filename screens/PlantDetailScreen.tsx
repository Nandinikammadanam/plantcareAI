import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useBasic } from '@basictech/expo';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlantDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { db, isSignedIn } = useBasic();
  const { darkMode, scheduleWateringReminder, cancelReminder } = useAppContext();
  
  const { id, name } = route.params as { id: string, name: string };
  
  const [plant, setPlant] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedSpecies, setEditedSpecies] = useState('');
  const [editedWateringFrequency, setEditedWateringFrequency] = useState('');
  const [editedNotes, setEditedNotes] = useState('');

  // Load plant details
  useEffect(() => {
    if (isSignedIn && db && id) {
      loadPlant();
    }
  }, [isSignedIn, db, id]);

  // Load plant function
  const loadPlant = async () => {
    try {
      const plantData = await db.from('plants').get(id);
      setPlant(plantData);
      
      // Initialize edit fields
      setEditedName(plantData.name);
      setEditedSpecies(plantData.species);
      setEditedWateringFrequency(plantData.wateringFrequency?.toString() || '7');
      setEditedNotes(plantData.notes || '');
    } catch (error) {
      console.error('Error loading plant:', error);
      Alert.alert('Error', 'Failed to load plant details');
    }
  };

  // Calculate days until next watering
  const getDaysUntilWatering = () => {
    if (!plant || !plant.lastWatered) return 0;
    
    const lastWatered = parseISO(plant.lastWatered);
    const wateringFrequency = plant.wateringFrequency || 7;
    const nextWateringDate = addDays(lastWatered, wateringFrequency);
    const daysUntil = differenceInDays(nextWateringDate, new Date());
    
    return Math.max(0, daysUntil);
  };

  // Water plant
  const waterPlant = async () => {
    try {
      if (isSignedIn && db && plant) {
        const today = new Date().toISOString();
        
        // Update plant in database
        await db.from('plants').update(plant.id, { lastWatered: today });
        
        // Schedule next watering reminder
        await scheduleWateringReminder(plant.id, plant.name, plant.wateringFrequency || 7);
        
        // Refresh plant data
        await loadPlant();
        
        Alert.alert('Success', `${plant.name} has been watered!`);
      }
    } catch (error) {
      console.error('Error watering plant:', error);
      Alert.alert('Error', 'Failed to update watering status');
    }
  };

  // Save edited plant
  const savePlant = async () => {
    try {
      if (isSignedIn && db && plant) {
        const wateringFrequency = parseInt(editedWateringFrequency, 10);
        
        if (isNaN(wateringFrequency) || wateringFrequency <= 0) {
          Alert.alert('Error', 'Please enter a valid watering frequency');
          return;
        }
        
        const updatedPlant = {
          name: editedName,
          species: editedSpecies,
          wateringFrequency,
          notes: editedNotes,
        };
        
        await db.from('plants').update(plant.id, updatedPlant);
        
        // Reschedule watering reminder if frequency changed
        if (wateringFrequency !== plant.wateringFrequency) {
          await cancelReminder(plant.id);
          await scheduleWateringReminder(plant.id, editedName, wateringFrequency);
        }
        
        setIsEditing(false);
        await loadPlant();
        
        Alert.alert('Success', 'Plant details updated');
      }
    } catch (error) {
      console.error('Error updating plant:', error);
      Alert.alert('Error', 'Failed to update plant details');
    }
  };

  // Delete plant
  const deletePlant = async () => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete ${plant.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (isSignedIn && db && plant) {
                await db.from('plants').delete(plant.id);
                await cancelReminder(plant.id);
                
                Alert.alert('Success', `${plant.name} has been deleted`);
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting plant:', error);
              Alert.alert('Error', 'Failed to delete plant');
            }
          }
        },
      ]
    );
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedName(plant.name);
    setEditedSpecies(plant.species);
    setEditedWateringFrequency(plant.wateringFrequency?.toString() || '7');
    setEditedNotes(plant.notes || '');
    setIsEditing(false);
  };

  if (!plant) {
    return (
      <View style={[styles.loadingContainer, darkMode && styles.darkContainer]}>
        <MaterialCommunityIcons name="leaf" size={50} color="#4CAF50" />
        <Text style={[styles.loadingText, darkMode && styles.darkText]}>Loading...</Text>
      </View>
    );
  }

  const daysUntilWatering = getDaysUntilWatering();
  const needsWaterSoon = daysUntilWatering <= 1;

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Plant Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: plant.image }} 
          style={styles.plantImage}
          defaultSource={require('../assets/images/plant-care.jpg')}
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageGradient}
        />
        
        {!isEditing && (
          <View style={styles.imageActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={deletePlant}
            >
              <MaterialCommunityIcons name="trash-can" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Plant Details */}
      <View style={styles.detailsContainer}>
        {isEditing ? (
          /* Edit Mode */
          <View style={styles.editContainer}>
            <Text style={[styles.editLabel, darkMode && styles.darkText]}>Name</Text>
            <TextInput
              style={[styles.editInput, darkMode && styles.darkInput]}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Plant name"
              placeholderTextColor="#999"
            />
            
            <Text style={[styles.editLabel, darkMode && styles.darkText]}>Species</Text>
            <TextInput
              style={[styles.editInput, darkMode && styles.darkInput]}
              value={editedSpecies}
              onChangeText={setEditedSpecies}
              placeholder="Species"
              placeholderTextColor="#999"
            />
            
            <Text style={[styles.editLabel, darkMode && styles.darkText]}>Watering Frequency (days)</Text>
            <TextInput
              style={[styles.editInput, darkMode && styles.darkInput]}
              value={editedWateringFrequency}
              onChangeText={setEditedWateringFrequency}
              placeholder="Days between watering"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            
            <Text style={[styles.editLabel, darkMode && styles.darkText]}>Notes</Text>
            <TextInput
              style={[styles.editNotes, darkMode && styles.darkInput]}
              value={editedNotes}
              onChangeText={setEditedNotes}
              placeholder="Add notes about your plant"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={[styles.editActionButton, styles.cancelButton]}
                onPress={cancelEditing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.editActionButton, styles.saveButton]}
                onPress={savePlant}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* View Mode */
          <>
            <View style={styles.nameContainer}>
              <Text style={[styles.plantName, darkMode && styles.darkText]}>{plant.name}</Text>
              <Text style={styles.plantSpecies}>{plant.species}</Text>
            </View>
            
            <View style={styles.wateringContainer}>
              <View style={styles.wateringInfo}>
                <MaterialCommunityIcons 
                  name="water" 
                  size={24} 
                  color={needsWaterSoon ? '#2196F3' : '#BBDEFB'} 
                />
                <View>
                  <Text style={[styles.wateringTitle, darkMode && styles.darkText]}>
                    {needsWaterSoon ? 'Needs water soon!' : 'Next watering'}
                  </Text>
                  <Text style={styles.wateringDate}>
                    {daysUntilWatering === 0 
                      ? 'Today' 
                      : daysUntilWatering === 1 
                        ? 'Tomorrow' 
                        : `In ${daysUntilWatering} days`}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.waterButton}
                onPress={waterPlant}
              >
                <Text style={styles.waterButtonText}>Water Now</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="calendar-refresh" size={20} color="#4CAF50" />
                <Text style={[styles.infoLabel, darkMode && styles.darkText]}>Watering Schedule:</Text>
                <Text style={[styles.infoValue, darkMode && styles.darkText]}>
                  Every {plant.wateringFrequency || 7} days
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="calendar-check" size={20} color="#4CAF50" />
                <Text style={[styles.infoLabel, darkMode && styles.darkText]}>Last Watered:</Text>
                <Text style={[styles.infoValue, darkMode && styles.darkText]}>
                  {plant.lastWatered 
                    ? format(parseISO(plant.lastWatered), 'MMM d, yyyy') 
                    : 'Not recorded'}
                </Text>
              </View>
            </View>
            
            <View style={styles.notesSection}>
              <Text style={[styles.notesTitle, darkMode && styles.darkText]}>Notes</Text>
              <Text style={[styles.notesText, darkMode && styles.darkText]}>
                {plant.notes || 'No notes added yet.'}
              </Text>
            </View>
            
            <View style={styles.careSection}>
              <Text style={[styles.careTitle, darkMode && styles.darkText]}>Care Tips</Text>
              
              <View style={styles.careTip}>
                <MaterialCommunityIcons name="white-balance-sunny" size={20} color="#FFC107" />
                <View style={styles.careTipContent}>
                  <Text style={[styles.careTipTitle, darkMode && styles.darkText]}>Light</Text>
                  <Text style={[styles.careTipText, darkMode && styles.darkText]}>
                    Prefers bright, indirect light. Avoid direct sunlight which can scorch leaves.
                  </Text>
                </View>
              </View>
              
              <View style={styles.careTip}>
                <MaterialCommunityIcons name="water" size={20} color="#2196F3" />
                <View style={styles.careTipContent}>
                  <Text style={[styles.careTipTitle, darkMode && styles.darkText]}>Watering</Text>
                  <Text style={[styles.careTipText, darkMode && styles.darkText]}>
                    Allow soil to dry out between waterings. Reduce frequency in winter.
                  </Text>
                </View>
              </View>
              
              <View style={styles.careTip}>
                <MaterialCommunityIcons name="thermometer" size={20} color="#FF5722" />
                <View style={styles.careTipContent}>
                  <Text style={[styles.careTipTitle, darkMode && styles.darkText]}>Temperature</Text>
                  <Text style={[styles.careTipText, darkMode && styles.darkText]}>
                    Thrives in temperatures between 65-80°F (18-27°C). Avoid cold drafts.
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#4CAF50',
  },
  darkText: {
    color: '#E0E0E0',
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  plantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  imageActions: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
  },
  nameContainer: {
    marginBottom: 20,
  },
  plantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  plantSpecies: {
    fontSize: 16,
    color: '#757575',
    marginTop: 5,
  },
  wateringContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  wateringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wateringTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  wateringDate: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 10,
  },
  waterButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  waterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    marginRight: 5,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  notesSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  careSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  careTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  careTip: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  careTipContent: {
    marginLeft: 15,
    flex: 1,
  },
  careTipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  careTipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  editContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  editInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  darkInput: {
    backgroundColor: '#333',
    color: 'white',
  },
  editNotes: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    height: 100,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EEEEEE',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});