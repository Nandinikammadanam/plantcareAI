import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function PremiumScreen() {
  const { darkMode, isPremium, setIsPremium } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  // Upgrade to premium
  const upgradeToPremium = () => {
    // In a real app, this would handle payment processing
    Alert.alert(
      'Upgrade to Premium',
      'This is a demo app. In a real app, this would process payment.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Simulate Purchase', 
          onPress: () => {
            setIsPremium(true);
            Alert.alert('Success', 'You are now a premium user!');
          }
        }
      ]
    );
  };

  // If already premium
  if (isPremium) {
    return (
      <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
        <LinearGradient
          colors={['#8E2DE2', '#4A00E0']}
          style={styles.premiumHeader}
        >
          <MaterialCommunityIcons name="crown" size={60} color="#FFD700" />
          <Text style={styles.premiumTitle}>Premium Active</Text>
          <Text style={styles.premiumSubtitle}>
            You're enjoying all premium features
          </Text>
        </LinearGradient>
        
        <View style={styles.featuresContainer}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
            Your Premium Benefits
          </Text>
          
          <PremiumFeature 
            icon="database" 
            title="Complete Plant Database" 
            description="Access to our extensive database of over 10,000 plants" 
          />
          
          <PremiumFeature 
            icon="leaf-maple" 
            title="Unlimited Identifications" 
            description="Identify as many plants as you want with no daily limits" 
          />
          
          <PremiumFeature 
            icon="medical-bag" 
            title="Advanced Disease Detection" 
            description="Detailed treatment plans for plant diseases" 
          />
          
          <PremiumFeature 
            icon="calendar-check" 
            title="Custom Care Schedules" 
            description="Create personalized care schedules for each plant" 
          />
          
          <PremiumFeature 
            icon="weather-partly-cloudy" 
            title="Climate Adaptation" 
            description="Get care advice adapted to your local climate" 
          />
        </View>
        
        <TouchableOpacity 
          style={styles.managePlanButton}
          onPress={() => Alert.alert('Manage Subscription', 'In a real app, this would open subscription management.')}
        >
          <Text style={styles.managePlanText}>Manage Subscription</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      <LinearGradient
        colors={['#8E2DE2', '#4A00E0']}
        style={styles.header}
      >
        <MaterialCommunityIcons name="crown" size={60} color="#FFD700" />
        <Text style={styles.headerTitle}>Upgrade to Premium</Text>
        <Text style={styles.headerSubtitle}>
          Unlock all features and become a plant expert
        </Text>
      </LinearGradient>
      
      <View style={styles.featuresContainer}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
          Premium Features
        </Text>
        
        <PremiumFeature 
          icon="database" 
          title="Complete Plant Database" 
          description="Access to our extensive database of over 10,000 plants" 
        />
        
        <PremiumFeature 
          icon="leaf-maple" 
          title="Unlimited Identifications" 
          description="Identify as many plants as you want with no daily limits" 
        />
        
        <PremiumFeature 
          icon="medical-bag" 
          title="Advanced Disease Detection" 
          description="Detailed treatment plans for plant diseases" 
        />
        
        <PremiumFeature 
          icon="calendar-check" 
          title="Custom Care Schedules" 
          description="Create personalized care schedules for each plant" 
        />
        
        <PremiumFeature 
          icon="weather-partly-cloudy" 
          title="Climate Adaptation" 
          description="Get care advice adapted to your local climate" 
        />
      </View>
      
      <View style={styles.plansContainer}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
          Choose Your Plan
        </Text>
        
        <View style={styles.planOptions}>
          <TouchableOpacity 
            style={[
              styles.planOption, 
              selectedPlan === 'monthly' && styles.selectedPlan,
              darkMode && styles.darkPlanOption
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={[
              styles.planName, 
              selectedPlan === 'monthly' && styles.selectedPlanText,
              darkMode && styles.darkText
            ]}>
              Monthly
            </Text>
            <Text style={[
              styles.planPrice, 
              selectedPlan === 'monthly' && styles.selectedPlanText,
              darkMode && styles.darkText
            ]}>
              $4.99
            </Text>
            <Text style={styles.planPeriod}>per month</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.planOption, 
              selectedPlan === 'yearly' && styles.selectedPlan,
              darkMode && styles.darkPlanOption
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save 33%</Text>
            </View>
            <Text style={[
              styles.planName, 
              selectedPlan === 'yearly' && styles.selectedPlanText,
              darkMode && styles.darkText
            ]}>
              Yearly
            </Text>
            <Text style={[
              styles.planPrice, 
              selectedPlan === 'yearly' && styles.selectedPlanText,
              darkMode && styles.darkText
            ]}>
              $39.99
            </Text>
            <Text style={styles.planPeriod}>per year</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={upgradeToPremium}
        >
          <Text style={styles.upgradeButtonText}>
            Upgrade Now
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          Subscription will auto-renew. Cancel anytime.
        </Text>
      </View>
    </ScrollView>
  );
}

// Premium feature component
function PremiumFeature({ icon, title, description }) {
  const { darkMode } = useAppContext();
  
  return (
    <View style={[styles.featureItem, darkMode && styles.darkFeatureItem]}>
      <View style={styles.featureIcon}>
        <MaterialCommunityIcons name={icon} size={24} color="white" />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, darkMode && styles.darkText]}>
          {title}
        </Text>
        <Text style={[styles.featureDescription, darkMode && styles.darkSubtext]}>
          {description}
        </Text>
      </View>
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
    padding: 30,
    alignItems: 'center',
  },
  premiumHeader: {
    padding: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
    textAlign: 'center',
  },
  premiumSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
    textAlign: 'center',
  },
  featuresContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  darkText: {
    color: '#E0E0E0',
  },
  darkSubtext: {
    color: '#AAAAAA',
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  darkFeatureItem: {
    backgroundColor: '#1E1E1E',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8E2DE2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  plansContainer: {
    padding: 20,
  },
  planOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  planOption: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  darkPlanOption: {
    backgroundColor: '#1E1E1E',
  },
  selectedPlan: {
    backgroundColor: '#8E2DE2',
    borderColor: '#4A00E0',
    borderWidth: 2,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  selectedPlanText: {
    color: 'white',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  planPeriod: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  upgradeButton: {
    backgroundColor: '#8E2DE2',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  managePlanButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8E2DE2',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    margin: 20,
  },
  managePlanText: {
    color: '#8E2DE2',
    fontSize: 16,
    fontWeight: 'bold',
  },
});