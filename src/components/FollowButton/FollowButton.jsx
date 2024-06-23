import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/Firebase";
import { Blog } from "../../context/Context";
import Skeleton from "react-loading-skeleton";

const FollowButton = ({ userId }) => {
  const { currentUser } = Blog();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkIfFollowing = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setIsFollowing(userData.followers.includes(currentUser.uid));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking follow status:", error);
        setLoading(false);
      }
    };

    checkIfFollowing();
  }, [currentUser, userId]);

  const handleFollow = async () => {
    if (!currentUser) return;

    // Atualização otimista
    setIsFollowing(true);

    try {
      const userRef = doc(db, "users", userId);
      const currentUserRef = doc(db, "users", currentUser.uid);

      await Promise.all([
        updateDoc(userRef, {
          followers: arrayUnion(currentUser.uid),
          notifications: arrayUnion(currentUser.uid),
        }),
        updateDoc(currentUserRef, {
          following: arrayUnion(userId),
        }),
      ]);
    } catch (error) {
      // Reversão em caso de erro
      setIsFollowing(false);
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser) return;

    // Atualização otimista
    setIsFollowing(false);

    try {
      const userRef = doc(db, "users", userId);
      const currentUserRef = doc(db, "users", currentUser.uid);

      await Promise.all([
        updateDoc(userRef, {
          followers: arrayRemove(currentUser.uid),
          notifications: arrayRemove(currentUser.uid),
        }),
        updateDoc(currentUserRef, {
          following: arrayRemove(userId),
        }),
      ]);
    } catch (error) {
      // Reversão em caso de erro
      setIsFollowing(true);
      console.error("Error unfollowing user:", error);
    }
  };

  if (loading) {
    return <Skeleton width={50} height={20} borderRadius={30} />;
  }

  return (
    <>
      {isFollowing ? (
        <button onClick={handleUnfollow}>Seguindo</button>
      ) : (
        <button onClick={handleFollow}>Seguir</button>
      )}
    </>
  );
};

export default FollowButton;
