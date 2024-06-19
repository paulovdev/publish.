import { useState } from "react";
import { auth, db } from "../firebase/Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const useRegister = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      const { email, password, ...profileData } = userData;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        ...profileData,
        followers: [],
        following: [],
        notifications: [],
        posts: [],
        selectedTopics: [],
      });
      setLoading(false);
    } catch (error) {
      setError(error.message);
    }
  };

  return { registerUser, error, loading };
};
