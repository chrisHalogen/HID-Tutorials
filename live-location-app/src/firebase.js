// Import Firebase services
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDWFlOHkj5UjvCSPAPlf1XzDMZ_CudANuo",
  authDomain: "location-app-tutorial.firebaseapp.com",
  projectId: "location-app-tutorial",
  storageBucket: "location-app-tutorial.firebasestorage.app",
  messagingSenderId: "228578314031",
  appId: "1:228578314031:web:dc4e663143d5012cda83da",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
const database = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Export the services we'll use
export { database, auth, signInAnonymously };
