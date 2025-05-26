import { initializeApp } from 'firebase/app';
import { getFirestore, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCmKxfdBu8jod1CR1jSJaLnXy2dLyvqG5E",
  authDomain: "drivertrackingapp-5c141.firebaseapp.com",
  projectId: "drivertrackingapp-5c141",
  storageBucket: "drivertrackingapp-5c141.firebasestorage.app",
  messagingSenderId: "715861122092",
  appId: "1:715861122092:android:011349cbf271f8e3124589"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);