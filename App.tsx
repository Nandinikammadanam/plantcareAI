import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Screens
import HomeScreen from './screens/HomeScreen';
import IdentifyScreen from './screens/IdentifyScreen';
import MyPlantsScreen from './screens/MyPlantsScreen';
import DiagnoseScreen from './screens/DiagnoseScreen';
import SettingsScreen from './screens/SettingsScreen';
import PlantDetailScreen from './screens/PlantDetailScreen';
import CameraScreen from './screens/CameraScreen';
import AuthScreen from './screens/AuthScreen';
import AddPlantScreen from './screens/AddPlantScreen';
import PremiumScreen from './screens/PremiumScreen';

// Components
import { AppContextProvider } from './context/AppContext';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Register for push notifications
async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({ projectId: 'plantcareassistant' })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Home stack navigator
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ title: 'Plant Care Assistant' }} 
      />
      <Stack.Screen 
        name="PlantDetail" 
        component={PlantDetailScreen} 
        options={({ route }) => ({ title: route.params?.name || 'Plant Details' })} 
      />
      <Stack.Screen 
        name="Premium" 
        component={PremiumScreen} 
        options={{ title: 'Premium Features' }} 
      />
    </Stack.Navigator>
  );
}

// Identify stack navigator
function IdentifyStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="IdentifyScreen" 
        component={IdentifyScreen} 
        options={{ title: 'Identify Plants' }} 
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ title: 'Take Photo' }} 
      />
    </Stack.Navigator>
  );
}

// My Plants stack navigator
function MyPlantsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MyPlantsScreen" 
        component={MyPlantsScreen} 
        options={{ title: 'My Plants' }} 
      />
      <Stack.Screen 
        name="AddPlant" 
        component={AddPlantScreen} 
        options={{ title: 'Add New Plant' }} 
      />
      <Stack.Screen 
        name="PlantDetail" 
        component={PlantDetailScreen} 
        options={({ route }) => ({ title: route.params?.name || 'Plant Details' })} 
      />
    </Stack.Navigator>
  );
}

// Diagnose stack navigator
function DiagnoseStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="DiagnoseScreen" 
        component={DiagnoseScreen} 
        options={{ title: 'Diagnose Plant' }} 
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ title: 'Take Photo' }} 
      />
    </Stack.Navigator>
  );
}

// Settings stack navigator
function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="SettingsScreen" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }} 
      />
      <Stack.Screen 
        name="Premium" 
        component={PremiumScreen} 
        options={{ title: 'Premium Features' }} 
      />
    </Stack.Navigator>
  );
}

// Main tab navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Identify" 
        component={IdentifyStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="leaf-maple" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="My Plants" 
        component={MyPlantsStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="seedling" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Diagnose" 
        component={DiagnoseStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="md-medkit" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main app component
export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) setExpoPushToken(token);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <BasicProvider project_id={schema.project_id} schema={schema}>
        <AppContextProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Auth" component={AuthScreen} />
              <Stack.Screen name="Main" component={TabNavigator} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </AppContextProvider>
      </BasicProvider>
    </SafeAreaProvider>
  );
}