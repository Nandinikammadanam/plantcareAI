import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  ImageBackground,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useBasic } from '@basictech/expo';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { db, user, isSignedIn } = useBasic();
  const { darkMode, isPremium } = useAppContext();
  const [plants, setPlants] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [identifications, setIdentifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Load data from database
  useEffect(() => {
    if (isSignedIn && db) {
      loadData();
    }
  }, [isSignedIn, db]);

  // Load data function
  const loadData = async () => {
    try {
      // Get plants
      const plantsData = await db.from('plants').getAll();
      setPlants(plantsData);

      // Get reminders
      const remindersData = await db.from('reminders').getAll();
      setReminders(remindersData);

      // Get identifications
      const identificationsData = await db.from('identifications').getAll();
      setIdentifications(identificationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Get upcoming reminders
  const getUpcomingReminders = () => {
    if (!reminders.length) return [];
    
    return reminders
      .filter(reminder => !reminder.isCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  // Get plants that need watering soon
  const getPlantsNeedingWater = () => {
    if (!plants.length) return [];
    
    return plants
      .filter(plant => {
        if (!plant.lastWatered) return true;
        
        const lastWatered = parseISO(plant.lastWatered);
        const daysUntilNextWatering = plant.wateringFrequency || 7;
        const nextWateringDate = addDays(lastWatered, daysUntilNextWatering);
        
        // Return plants that need watering within the next 2 days
        return nextWateringDate <= addDays(new Date(), 2);
      })
      .slice(0, 3);
  };

  // Format date for display
  const formatReminderDate = (dateString) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    
    return format(date, 'MMM d');
  };

  // Navigate to plant detail
  const goToPlantDetail = (plant) => {
    navigation.navigate('PlantDetail' as never, { id: plant.id, name: plant.name } as never);
  };

  // Navigate to identify screen
  const goToIdentify = () => {
    navigation.navigate('Identify' as never);
  };

  // Navigate to diagnose screen
  const goToDiagnose = () => {
    navigation.navigate('Diagnose' as never);
  };

  // Navigate to my plants screen
  const goToMyPlants = () => {
    navigation.navigate('My Plants' as never);
  };

  // Navigate to premium screen
  const goToPremium = () => {
    navigation.navigate('Premium' as never);
  };

  return (
    <ScrollView
      style={[styles.container, darkMode && styles.darkContainer]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={darkMode ? ['#1E3A2B', '#2D5A40'] : ['#4CAF50', '#8BC34A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{user?.name || 'Plant Lover'}</Text>
          </View>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={goToIdentify}>
            <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' }]}>
              <MaterialCommunityIcons name="leaf-maple" size={24} color="white" />
            </View>
            <Text style={[styles.actionText, darkMode && styles.darkText]}>Identify</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={goToDiagnose}>
            <View style={[styles.actionIcon, { backgroundColor: '#FF5722' }]}>
              <Ionicons name="md-medkit" size={24} color="white" />
            </View>
            <Text style={[styles.actionText, darkMode && styles.darkText]}>Diagnose</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={goToMyPlants}>
            <View style={[styles.actionIcon, { backgroundColor: '#2196F3' }]}>
              <FontAwesome5 name="seedling" size={24} color="white" />
            </View>
            <Text style={[styles.actionText, darkMode && styles.darkText]}>My Plants</Text>
          </TouchableOpacity>
          
          {!isPremium && (
            <TouchableOpacity style={styles.actionButton} onPress={goToPremium}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFC107' }]}>
                <MaterialCommunityIcons name="crown" size={24} color="white" />
              </View>
              <Text style={[styles.actionText, darkMode && styles.darkText]}>Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Plants Needing Water */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Plants Needing Water</Text>
          <TouchableOpacity onPress={goToMyPlants}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {getPlantsNeedingWater().length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {getPlantsNeedingWater().map((plant) => (
              <TouchableOpacity 
                key={plant.id} 
                style={styles.plantCard}
                onPress={() => goToPlantDetail(plant)}
              >
                <Image 
                  source={{ uri: plant.image }} 
                  style={styles.plantImage}
                  defaultSource={require('../assets/images/plant-care.jpg')}
                />
                <View style={styles.plantCardContent}>
                  <Text style={styles.plantName}>{plant.name}</Text>
                  <View style={styles.waterIndicator}>
                    <MaterialCommunityIcons name="water" size={16} color="#2196F3" />
                    <Text style={styles.waterText}>Needs water</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="water-off" size={40} color="#BDBDBD" />
            <Text style={[styles.emptyStateText, darkMode && styles.darkText]}>
              No plants need watering soon
            </Text>
          </View>
        )}
      </View>

      {/* Recent Identifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Recent Identifications</Text>
          <TouchableOpacity onPress={goToIdentify}>
            <Text style={styles.seeAllText}>Identify More</Text>
          </TouchableOpacity>
        </View>
        
        {identifications.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {identifications.slice(0, 3).map((identification) => (
              <View key={identification.id} style={styles.identificationCard}>
                <Image 
                  source={{ uri: identification.imageUrl }} 
                  style={styles.identificationImage}
                  defaultSource={require('../assets/images/identification.jpg')}
                />
                <View style={styles.identificationContent}>
                  <Text style={styles.identificationResult}>{identification.result}</Text>
                  <Text style={styles.identificationDate}>
                    {format(parseISO(identification.date), 'MMM d, yyyy')}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <TouchableOpacity style={styles.identifyPrompt} onPress={goToIdentify}>
            <ImageBackground
              source={require('../assets/images/identification.jpg')}
              style={styles.identifyPromptBg}
              imageStyle={{ borderRadius: 12 }}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                style={styles.identifyPromptGradient}
              >
                <MaterialCommunityIcons name="leaf-maple" size={40} color="white" />
                <Text style={styles.identifyPromptText}>
                  Identify your first plant
                </Text>
                <View style={styles.identifyButton}>
                  <Text style={styles.identifyButtonText}>Start Now</Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        )}
      </View>

      {/* Upcoming Reminders */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Upcoming Reminders</Text>
        
        {getUpcomingReminders().length > 0 ? (
          getUpcomingReminders().map((reminder) => {
            const plant = plants.find(p => p.id === reminder.plantId);
            
            return (
              <TouchableOpacity 
                key={reminder.id} 
                style={styles.reminderCard}
                onPress={() => plant && goToPlantDetail(plant)}
              >
                <View style={styles.reminderIconContainer}>
                  <MaterialCommunityIcons 
                    name={reminder.type === 'watering' ? 'water' : 'leaf'} 
                    size={24} 
                    color="white" 
                  />
                </View>
                <View style={styles.reminderContent}>
                  <Text style={[styles.reminderText, darkMode && styles.darkText]}>
                    {reminder.notes || `${reminder.type} reminder`}
                  </Text>
                  <Text style={styles.reminderPlant}>
                    {plant ? plant.name : 'Unknown plant'}
                  </Text>
                </View>
                <View style={styles.reminderDate}>
                  <Text style={styles.reminderDateText}>
                    {formatReminderDate(reminder.date)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bell-off" size={40} color="#BDBDBD" />
            <Text style={[styles.emptyStateText, darkMode && styles.darkText]}>
              No upcoming reminders
            </Text>
          </View>
        )}
      </View>

      {/* Premium Promotion */}
      {!isPremium && (
        <TouchableOpacity style={styles.premiumPromo} onPress={goToPremium}>
          <LinearGradient
            colors={['#8E2DE2', '#4A00E0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumGradient}
          >
            <View style={styles.premiumContent}>
              <MaterialCommunityIcons name="crown" size={30} color="#FFD700" />
              <View style={styles.premiumTextContainer}>
                <Text style={styles.premiumPromoTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumPromoText}>
                  Access our complete plant database and expert care guides
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
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
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  premiumText: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  quickActionsContainer: {
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    width: width / 4 - 15,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  darkText: {
    color: '#E0E0E0',
  },
  seeAllText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  horizontalScroll: {
    marginLeft: -5,
  },
  plantCard: {
    width: 150,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  plantImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  plantCardContent: {
    padding: 10,
  },
  plantName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  waterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 5,
  },
  identificationCard: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  identificationImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  identificationContent: {
    padding: 10,
  },
  identificationResult: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  identificationDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 5,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  reminderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderContent: {
    flex: 1,
    marginLeft: 15,
  },
  reminderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  reminderPlant: {
    fontSize: 12,
    color: '#757575',
    marginTop: 3,
  },
  reminderDate: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  reminderDateText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  identifyPrompt: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  identifyPromptBg: {
    width: '100%',
    height: '100%',
  },
  identifyPromptGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  identifyPromptText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
  },
  identifyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  identifyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  premiumPromo: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 20,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  premiumPromoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  premiumPromoText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
  bottomPadding: {
    height: 20,
  },
});