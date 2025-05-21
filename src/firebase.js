import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCum9CRRh1Z0XOW7v8kCAA8NmpIf8I0KkI",
  authDomain: "whiteboardfirebase-c616e.firebaseapp.com",
  projectId: "whiteboardfirebase-c616e",
  storageBucket: "whiteboardfirebase-c616e.firebasestorage.app",
  messagingSenderId: "783624236912",
  appId: "1:783624236912:web:33d032bfda928a23faa9b5",
  measurementId: "G-50P52QFVR3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { db,auth };