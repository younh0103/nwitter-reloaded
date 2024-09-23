import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDh02vzuo4J_agnPWC1UqzhqagYiVLxzZ4",
  authDomain: "nwitter-reloaded-f9b3a.firebaseapp.com",
  projectId: "nwitter-reloaded-f9b3a",
  storageBucket: "nwitter-reloaded-f9b3a.appspot.com",
  messagingSenderId: "698020396779",
  appId: "1:698020396779:web:a27ed0d7f128a2675888ae",
  measurementId: "G-GS70LKKDT6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
