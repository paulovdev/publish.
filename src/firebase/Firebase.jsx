import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAkjndaRDqELOrJ2L5GkxUtkGQFPVQpjYE",
  authDomain: "publish1-2f904.firebaseapp.com",
  projectId: "publish1-2f904",
  storageBucket: "publish1-2f904.appspot.com",
  messagingSenderId: "509004825152",
  appId: "1:509004825152:web:f63be4c427d4c0b94115a5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const realtime = getDatabase();
export const database = getDatabase();
export const db = getFirestore(app);
