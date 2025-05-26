import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import LocationTracker from './components/LocationTracker';
import { PermissionsAndroid, Platform } from 'react-native';


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


export default App;