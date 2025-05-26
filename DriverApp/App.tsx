import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import LocationTracker from './android/app/src/components/LocationTracker';
import { PermissionsAndroid, Platform } from 'react-native';
import { db } from './android/app/src/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Test write to Firestore

function App() {

    const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      
      if (
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Location permissions granted');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }
};

useEffect(() => {
  requestLocationPermission();
}, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <LocationTracker driverId="driver1" />
    </SafeAreaView>
  );
}

const testFirebaseConnection = async () => {
  try {
    await setDoc(doc(db, "test", "hello"), {
      message: "Firebase is connected!",
      timestamp: new Date().toISOString()
    });
    console.log("Firebase connection test successful!");
  } catch (error) {
    console.error("Firebase connection failed:", error);
  }
};

// Call the function
testFirebaseConnection();


export default App;