import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAa7JUqgESsXcoy4-4bjQsdJqN4uF9bugc",
    authDomain: "miniblog-36cb4.firebaseapp.com",
    projectId: "miniblog-36cb4",
    storageBucket: "miniblog-36cb4.appspot.com",
    messagingSenderId: "403813527300",
    appId: "1:403813527300:web:3e33e7461e1c9d2addaa51",
    measurementId: "G-QRYMWF1YD5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const realtime = getDatabase();
export const db = getFirestore(app);