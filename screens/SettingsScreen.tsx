import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Switch, 
  ScrollView, 
  Alert,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useBasic } from '@basictech/expo';
import { useAppContext } from '../context/AppContext';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { signout, user } = useBasic();
  const { 
    darkMode, 
    toggleDarkMode, 
    isPremium, 
    setIsPremium, 
    notificationsEnabled, 
    toggleNotifications,
    language,
    setLanguage
  } = useAppContext();
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'en');

  // Sign out
  const handleSignOut = async () => {
    try {
      await signout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  // Go to premium screen
  const goToPremium = () => {
    navigation.navigate('Premium' as never);
  };

  // Change language
  const changeLanguage = (lang) => {
    setSelectedLanguage(lang);
    setLanguage(lang);
  };

  // Open email for support
  const contactSupport = () => {
    Linking.openURL('mailto:support@plantcareassistant.com?subject=Support%20Request');
  };

  // Open privacy policy
  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.example.com/privacy-policy');
  };

  // Open terms of service
  const openTermsOfService = () => {
    Linking.openURL('https://www.example.com/terms-of-service');
  };

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      {/* User Profile Section */}
      <View style={[styles.profileSection, darkMode && styles.darkSection]}>
        <View style={styles.profileIcon}>
          <MaterialCommunityIcons name="account" size={40} color="white" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, darkMode && styles.darkText]}>
            {user?.name || 'Plant Lover'}
          </Text>
          <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
        </View>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>

      {/* App Settings */}
      <View style={styles.settingsGroup}>
        <Text style={[styles.groupTitle, darkMode && styles.darkText]}>App Settings</Text>
        
        <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons 
              name={darkMode ? "weather-night" : "white-balance-sunny"} 
              size={24} 
              color={darkMode ? "#90CAF9" : "#FFC107"} 
            />
            <Text style={[styles.settingText, darkMode && styles.darkText]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={darkMode ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
        
        <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="bell" size={24} color="#F44336" />
            <Text style={[styles.settingText, darkMode && styles.darkText]}>
              Notifications
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notificationsEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.settingItem, darkMode && styles.darkSettingItem]}
          onPress={() => {
            Alert.alert(
              'Select Language',
              'Choose your preferred language',
              [
                { text: 'English', onPress: () => changeLanguage('en') },
                { text: 'Spanish', onPress: () => changeLanguage('es') },
                { text: 'French', onPress: () => changeLanguage('fr') },
                { text: 'German', onPress: () => changeLanguage('de') },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }}
        >
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="translate" size={24} color="#2196F3" />
            <Text style={[styles.settingText, darkMode && styles.darkText]}>
              Language
            </Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>
              {selectedLanguage === 'en' ? 'English' : 
               selectedLanguage === 'es' ? 'Spanish' : 
               selectedLanguage === 'fr' ? 'French' : 
               selectedLanguage === 'de' ? 'German' : 'English'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Account Settings */}
      <View style={styles.settingsGroup}>
        <Text style={[styles.groupTitle, darkMode && styles.darkText]}>Account</Text>
        
        {!isPremium ? (
          <TouchableOpacity 
            style={[styles.settingItem, darkMode && styles.darkSettingItem]}
            onPress={goToPremium}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
              <Text style={[styles.settingText, darkMode && styles.darkText]}>
                Upgrade to Premium
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
        ) : (
          <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
              <Text style={[styles.settingText, darkMode && styles.darkText]}>
                Premium Account
              </Text>
            </View>
            <Text style={styles.activeText}>Active</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.settingItem, darkMode && styles.darkSettingItem]}
          onPress={contactSupport}
        >
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="help-circle" size={24} color="#4CAF50" />
            <Text style={[styles.settingText, darkMode && styles.darkText]}>
              Help & Support
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
        </TouchableOpacity>
      </View>

      {/* Legal */}
      <View style={styles.settingsGroup}>
        <Text style={[styles.groupTitle, darkMode && styles.darkText]}>Legal</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, darkMode && styles.darkSettingItem]}
          onPress={openPrivacyPolicy}
        >
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="shield-lock" size={24} color="#2196F3" />
            <Text style={[styles.settingText, darkMode && styles.darkText]}>
              Privacy Policy
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, darkMode && styles.darkSettingItem]}
          onPress={openTermsOfService}
        >
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="file-document" size={24} color="#FF9800" />
            <Text style={[styles.settingText, darkMode && styles.darkText]}>
              Terms of Service
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#757575" />
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.settingsGroup}>
        <Text style={[styles.groupTitle, darkMode && styles.darkText]}>About</Text>
        
        <View style={[styles.settingItem, darkMode && styles.darkSettingItem]}>
          <View style={styles.settingLeft}>
            <MaterialCommunityIcons name="information" size={24} color="#2196F3" />
            <Text style={[styles.settingText, darkMode && styles.darkText]}>
              Version
            </Text>
          </View>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
      
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  darkSection: {
    backgroundColor: '#1E1E1E',
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  darkText: {
    color: '#E0E0E0',
  },
  profileEmail: {
    fontSize: 14,
    color: '#757575',
    marginTop: 3,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  premiumText: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  settingsGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  darkSettingItem: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#757575',
    marginRight: 10,
  },
  activeText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#F44336',
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});