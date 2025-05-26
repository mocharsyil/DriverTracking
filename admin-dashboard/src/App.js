import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyCmKxfdBu8jod1CR1jSJaLnXy2dLyvqG5E",
  authDomain: "drivertrackingapp-5c141.firebaseapp.com",
  projectId: "drivertrackingapp-5c141",
  storageBucket: "drivertrackingapp-5c141.firebasestorage.app",
  messagingSenderId: "715861122092",
  appId: "1:715861122092:android:011349cbf271f8e3124589"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "drivers", "driver1"), (docSnap) => {
      const data = docSnap.data();
      if (data) {
        console.log("Current driver data:", data);
        setDrivers([{
          id: "driver1",
          name: data.name || "Driver 1",
          lat: data.lat,
          lng: data.lng,
          lastUpdated: data.updatedAt?.toDate().toLocaleTimeString()
        }]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
        <MapContainer 
          center={drivers[0] ? [drivers[0].lat, drivers[0].lng] : [-6.9149, 107.6206]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />
        {drivers.map(driver => (
          <Marker key={driver.id} position={[driver.lat, driver.lng]}>
            <Popup>
              Driver: {driver.name} <br />
              Last updated: {driver.lastUpdated}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
