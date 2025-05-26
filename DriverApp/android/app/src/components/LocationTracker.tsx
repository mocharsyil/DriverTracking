import React, { useState, useEffect } from 'react';
import { View, Text, Button, Platform, PermissionsAndroid, StyleSheet } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { db } from '../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

const LocationTracker = ({ driverId = "driver1" }) => {
  const [location, setLocation] = useState<{
    latitude: number,
    longitude: number,
    accuracy?: number,
    timestamp?: number
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        ]);

        const fineGranted = granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;
        const backgroundGranted = granted['android.permission.ACCESS_BACKGROUND_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

        if (!fineGranted || !backgroundGranted) {
          setError("Background location permission required");
          return false;
        }

        console.log("✅ Permissions granted");
        return true;
      } catch (err) {
        if (err instanceof Error) {
          setError(`Permission error: ${err.message}`);
        } else {
          setError("Permission error: Unknown error");
        }
        return false;
      }
    }
    return true;
  };

  const getLocationOnce = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return;

  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log("📍 One-time location:", latitude, longitude);
      setLocation({ latitude, longitude });
    },
    (error) => {
      console.error("❌ getCurrentPosition error:", error.message);
      setError(error.message);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
};

  const updateDriverLocation = async (lat: number, lng: number) => {
  console.log("📝 Attempting to write to Firestore:", lat, lng);
  try {
    await setDoc(doc(db, "drivers", driverId), {
      name: `Driver ${driverId}`,
      lat: lat,
      lng: lng,
      updatedAt: Timestamp.now(),
      isActive: true,
    });
    console.log("✅ Firestore updated successfully");
  } catch (e) {
    console.error("❌ Failed to write to Firestore:", e);
    setError("❌ Failed to write to Firestore");
  }
};


  const toggleSharing = async () => {
    if (isSharing) {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
        console.log("🛑 Stopped location sharing");
        setWatchId(null);
      }
      setIsSharing(false);
      await setDoc(doc(db, "drivers", driverId), { isActive: false }, { merge: true });
    } else {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      console.log("▶️ Starting location tracking...");
      const id = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log("📍 Got location update:", latitude, longitude);
          setLocation({
            latitude,
            longitude,
            accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          setError(error.message);
          console.error('❌ GPS Error:', error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 5000,
          fastestInterval: 2000
        }
      );

      setWatchId(id);
      setIsSharing(true);
    }
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        {isSharing ? '🟢 LIVE Location Sharing' : '🔴 Sharing Inactive'}
      </Text>

      {location ? (
        <Text style={styles.coordinates}>
          Latitude: {location.latitude.toFixed(6)}{"\n"}
          Longitude: {location.longitude.toFixed(6)}{"\n"}
          Accuracy: {location.accuracy?.toFixed(2)} m{"\n"}
          Timestamp: {new Date(location.timestamp || 0).toLocaleTimeString()}
        </Text>
      ) : (
        <Text style={styles.coordinates}>📍 No location yet</Text>
      )}

      <Button
        title={isSharing ? "STOP Sharing" : "START Sharing"}
        onPress={toggleSharing}
        color={isSharing ? "red" : "green"}
      />

      <View style={{ marginVertical: 15 }} />

      <Button
  title="SEND TO FIRESTORE"
  onPress={() => {
    if (location) {
      updateDriverLocation(location.latitude, location.longitude);
    } else {
      setError("No location to send");
    }
  }}
  color="orange"
/>


      <Button title="GET ONE-TIME LOCATION" onPress={getLocationOnce} />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  coordinates: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'blue'
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center'
  }
});





export default LocationTracker;
