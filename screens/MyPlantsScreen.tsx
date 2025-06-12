import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useBasic } from '@basictech/expo';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { useAppContext } from '../context/AppContext';

export default function MyPlantsScreen() {
  const navigation = useNavigation();
  const { db, isSignedIn } = useBasic();
  const { darkMode, scheduleWateringReminder } = useAppContext();
  const [plants, setPlants] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load plants from database
  useEffect(() => {
    if (isSignedIn && db) {
      loadPlants();
    }
  }, [isSignedIn, db]);

  // Load plants function
  const loadPlants = async () => {
    try {
      const plantsData = await db.from('plants').getAll();
      setPlants(plantsData);
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };

  // Refresh plants
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlants();
    setRefreshing(false);
  };

  // Navigate to add plant screen
  const goToAddPlant = () => {
    navigation.navigate('AddPlant' as never);
  };

  // Navigate to plant detail screen
  const goToPlantDetail = (plant) => {
    navigation.navigate('PlantDetail' as never, { id: plant.id, name: plant.name } as never);
  };

  // Water plant
  const waterPlant = async (plant) => {
    try {
      if (isSignedIn && db) {
        const today = new Date().toISOString();
        
        // Update plant in database
        await db.from('plants').update(plant.id, { lastWatered: today });
        
        // Schedule next watering reminder
        await scheduleWateringReminder(plant.id, plant.name, plant.wateringFrequency || 7);
        
        // Refresh plants list
        await loadPlants();
        
        Alert.alert('Success', `${plant.name} has been watered!`);
      }
    } catch (error) {
      console.error('Error watering plant:', error);
      Alert.alert('Error', 'Failed to update watering status');
    }
  };

  // Calculate days until next watering
  const getDaysUntilWatering = (plant) => {
    if (!plant.lastWatered) return 0;
    
    const lastWatered = parseISO(plant.lastWatered);
    const wateringFrequency = plant.wateringFrequency || 7;
    const nextWateringDate = addDays(lastWatered, wateringFrequency);
    const daysUntil = differenceInDays(nextWateringDate, new Date());
    
    return Math.max(0, daysUntil);
  };

  // Get watering status text
  const getWateringStatusText = (daysUntil) => {
    if (daysUntil === 0) return 'Water today!';
    if (daysUntil === 1) return 'Water tomorrow';
    return `Water in ${daysUntil} days`;
  };

  // Render plant item
  const renderPlantItem = ({ item }) => {
    const daysUntilWatering = getDaysUntilWatering(item);
    const needsWaterSoon = daysUntilWatering <= 1;
    
    return (
      <TouchableOpacity 
        style={[styles.plantCard, darkMode && styles.darkPlantCard]}
        onPress={() => goToPlantDetail(item)}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.plantImage}
          defaultSource={require('../assets/images/plant-care.jpg')}
        />
        
        <View style={styles.plantInfo}>
          <Text style={[styles.plantName, darkMode && styles.darkText]}>
            {item.name}
          </Text>
          <Text style={styles.plantSpecies}>{item.species}</Text>
          
          <View style={[
            styles.wateringStatus, 
            needsWaterSoon ? styles.needsWaterSoon : null
          ]}>
            <MaterialCommunityIcons 
              name="water" 
              size={16} 
              color={needsWaterSoon ? 'white' : '#2196F3'} 
            />
            <Text style={[
              styles.wateringText, 
              needsWaterSoon ? styles.needsWaterText : null
            ]}>
              {getWateringStatusText(daysUntilWatering)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.waterButton}
          onPress={() => waterPlant(item)}
        >
          <MaterialCommunityIcons name="water" size={24} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons 
        name="flower" 
        size={60} 
        color="#BDBDBD" 
      />
      <Text style={[styles.emptyStateTitle, darkMode && styles.darkText]}>
        No plants yet
      </Text>
      <Text style={[styles.emptyStateText, darkMode && styles.darkText]}>
        Start adding plants to your collection
      </Text>
      <TouchableOpacity 
        style={styles.addFirstPlantButton}
        onPress={goToAddPlant}
      >
        <Text style={styles.addFirstPlantText}>Add Your First Plant</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <FlatList
        data={plants}
        renderItem={renderPlantItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      
      {plants.length > 0 && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={goToAddPlant}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
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
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  plantCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  darkPlantCard: {
    backgroundColor: '#1E1E1E',
  },
  plantImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  plantInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  darkText: {
    color: '#E0E0E0',
  },
  plantSpecies: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  wateringStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  needsWaterSoon: {
    backgroundColor: '#2196F3',
  },
  wateringText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
  },
  needsWaterText: {
    color: 'white',
  },
  waterButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  addFirstPlantButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  addFirstPlantText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});