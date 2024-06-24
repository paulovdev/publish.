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
import { FaUserPlus, FaUserCheck } from "react-icons/fa"; // Importando ícones do FontAwesome

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

  const handleFollowToggle = async () => {
    if (!currentUser) return;

    // Ação otimista: atualiza o estado local imediatamente
    setIsFollowing(!isFollowing);

    try {
      const userRef = doc(db, "users", userId);
      const currentUserRef = doc(db, "users", currentUser.uid);

      if (isFollowing) {
        await updateDoc(userRef, {
          followers: arrayRemove(currentUser.uid),
          notifications: arrayRemove(currentUser.uid),
        });
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId),
        });
      } else {
        await updateDoc(userRef, {
          followers: arrayUnion(currentUser.uid),
          notifications: arrayUnion(currentUser.uid),
        });
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId),
        });
      }
    } catch (error) {
      console.error(
        `Error ${isFollowing ? "unfollowing" : "following"} user:`,
        error
      );
      // Reverte o estado em caso de erro
      setIsFollowing(!isFollowing);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton width={80} height={20} borderRadius={30} />;
  }

  return (
    <button onClick={handleFollowToggle}>
      {isFollowing ? (
        <>
          <FaUserCheck style={{ marginRight: "5px" }} /> Seguindo
        </>
      ) : (
        <>
          <FaUserPlus style={{ marginRight: "5px" }} /> Seguir
        </>
      )}
    </button>
  );
};

export default FollowButton;
