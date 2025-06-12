import React, { createContext, useState, useContext, useEffect } from 'react';
import { useBasic } from '@basictech/expo';
import * as Notifications from 'expo-notifications';
import { format } from 'date-fns';

// Define the context type
type AppContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  scheduleWateringReminder: (plantId: string, plantName: string, days: number) => Promise<void>;
  cancelReminder: (plantId: string) => Promise<void>;
  language: string;
  setLanguage: (lang: string) => void;
};

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const { db, user, isSignedIn } = useBasic();

  // Load user settings from database
  useEffect(() => {
    if (isSignedIn && db && user) {
      const loadSettings = async () => {
        try {
          // Get all settings
          const settingsData = await db.from('settings').getAll();
          
          // Find user settings
          const userSettings = settingsData.find(setting => setting.userId === user.id);
          
          if (userSettings) {
            setDarkMode(userSettings.darkMode);
            setIsPremium(userSettings.isPremium);
            setNotificationsEnabled(userSettings.notificationsEnabled);
            setLanguage(userSettings.language || 'en');
          } else {
            // Create default settings for new user
            const defaultSettings = {
              userId: user.id,
              darkMode: false,
              isPremium: false,
              notificationsEnabled: true,
              language: 'en'
            };
            
            await db.from('settings').add(defaultSettings);
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      };
      
      loadSettings();
    }
  }, [isSignedIn, db, user]);

  // Toggle dark mode
  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    
    // Update in database if user is signed in
    if (isSignedIn && db && user) {
      try {
        const settingsData = await db.from('settings').getAll();
        const userSettings = settingsData.find(setting => setting.userId === user.id);
        
        if (userSettings) {
          await db.from('settings').update(userSettings.id, { darkMode: newValue });
        }
      } catch (error) {
        console.error('Error updating dark mode setting:', error);
      }
    }
  };

  // Toggle notifications
  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    
    // Update in database if user is signed in
    if (isSignedIn && db && user) {
      try {
        const settingsData = await db.from('settings').getAll();
        const userSettings = settingsData.find(setting => setting.userId === user.id);
        
        if (userSettings) {
          await db.from('settings').update(userSettings.id, { notificationsEnabled: newValue });
        }
      } catch (error) {
        console.error('Error updating notifications setting:', error);
      }
    }
  };

  // Schedule watering reminder
  const scheduleWateringReminder = async (plantId: string, plantName: string, days: number) => {
    if (!notificationsEnabled) return;
    
    // Cancel any existing reminders for this plant
    await cancelReminder(plantId);
    
    // Schedule new reminder
    const trigger = new Date();
    trigger.setDate(trigger.getDate() + days);
    trigger.setHours(9, 0, 0); // 9:00 AM
    
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to water your plant!',
        body: `${plantName} needs watering today.`,
        data: { plantId },
      },
      trigger,
    });
    
    // Save reminder in database
    if (isSignedIn && db) {
      try {
        await db.from('reminders').add({
          plantId,
          type: 'watering',
          date: format(trigger, 'yyyy-MM-dd'),
          isCompleted: false,
          notes: `Watering reminder for ${plantName}`,
        });
      } catch (error) {
        console.error('Error saving reminder:', error);
      }
    }
    
    return identifier;
  };

  // Cancel reminder
  const cancelReminder = async (plantId: string) => {
    // Cancel all scheduled notifications for this plant
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.plantId === plantId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
    
    // Update reminders in database
    if (isSignedIn && db) {
      try {
        const reminders = await db.from('reminders').getAll();
        const plantReminders = reminders.filter(reminder => 
          reminder.plantId === plantId && !reminder.isCompleted
        );
        
        for (const reminder of plantReminders) {
          await db.from('reminders').update(reminder.id, { isCompleted: true });
        }
      } catch (error) {
        console.error('Error updating reminders:', error);
      }
    }
  };

  // Update language
  const updateLanguage = async (lang: string) => {
    setLanguage(lang);
    
    // Update in database if user is signed in
    if (isSignedIn && db && user) {
      try {
        const settingsData = await db.from('settings').getAll();
        const userSettings = settingsData.find(setting => setting.userId === user.id);
        
        if (userSettings) {
          await db.from('settings').update(userSettings.id, { language: lang });
        }
      } catch (error) {
        console.error('Error updating language setting:', error);
      }
    }
  };

  // Context value
  const value = {
    darkMode,
    toggleDarkMode,
    isPremium,
    setIsPremium,
    notificationsEnabled,
    toggleNotifications,
    scheduleWateringReminder,
    cancelReminder,
    language,
    setLanguage: updateLanguage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};