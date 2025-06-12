import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { darkMode } = useAppContext();
  
  const onPhotoCapture = route.params?.onPhotoCapture;
  const mode = route.params?.mode || 'identify';

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
      if (!mediaLibraryPermission?.granted) {
        await requestMediaLibraryPermission();
      }
    })();
  }, []);

  // Toggle camera facing
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Toggle flash mode
  const toggleFlash = () => {
    setFlash(current => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  // Take picture
  const takePicture = async () => {
    if (cameraRef.current && !isTakingPicture) {
      setIsTakingPicture(true);
      
      try {
        const photo = await cameraRef.current.takePictureAsync();
        
        // Resize and compress the image
        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1000 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        // Save to media library
        if (mediaLibraryPermission?.granted) {
          await MediaLibrary.saveToLibraryAsync(manipResult.uri);
        }
        
        // Pass the photo back to the calling screen
        if (onPhotoCapture) {
          onPhotoCapture(manipResult.uri);
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      } finally {
        setIsTakingPicture(false);
      }
    }
  };

  // Cancel and go back
  const handleCancel = () => {
    navigation.goBack();
  };

  // If no permission granted
  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialCommunityIcons name="camera-off" size={60} color="#F44336" />
        <Text style={styles.permissionText}>
          We need camera permission to take photos
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flashMode={flash}
      >
        {/* Camera UI Overlay */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleCancel}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>
              {mode === 'identify' ? 'Identify Plant' : 'Diagnose Plant'}
            </Text>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={toggleFlash}
            >
              <Ionicons 
                name={
                  flash === 'on' ? 'flash' : 
                  flash === 'auto' ? 'flash-auto' : 
                  'flash-off'
                } 
                size={30} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
          
          {/* Camera Guide */}
          <View style={styles.guideContainer}>
            <View style={[
              styles.cameraGuide, 
              mode === 'identify' ? styles.identifyGuide : styles.diagnoseGuide
            ]}>
              {mode === 'identify' ? (
                <MaterialCommunityIcons name="leaf-maple" size={40} color="rgba(255,255,255,0.5)" />
              ) : (
                <MaterialCommunityIcons name="medical-bag" size={40} color="rgba(255,255,255,0.5)" />
              )}
            </View>
            <Text style={styles.guideText}>
              {mode === 'identify' 
                ? 'Position the entire plant in frame' 
                : 'Focus on the affected area'}
            </Text>
          </View>
          
          {/* Footer Controls */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={takePicture}
              disabled={isTakingPicture}
            >
              {isTakingPicture ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
            
            <View style={styles.placeholderButton} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraGuide: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  identifyGuide: {
    borderColor: 'rgba(76, 175, 80, 0.7)',
  },
  diagnoseGuide: {
    borderColor: 'rgba(244, 67, 54, 0.7)',
  },
  guideText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  flipButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  placeholderButton: {
    width: 50,
    height: 50,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    color: '#333',
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});