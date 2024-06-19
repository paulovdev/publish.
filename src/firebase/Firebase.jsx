import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCNR9rbGqa-xluF5mNChUY87YuN9G3bYbc",
  authDomain: "publish-b1b22.firebaseapp.com",
  projectId: "publish-b1b22",
  storageBucket: "publish-b1b22.appspot.com",
  messagingSenderId: "212776731881",
  appId: "1:212776731881:web:9b14cd5b493a6de7539c78",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const realtime = getDatabase();
export const db = getFirestore(app);
