import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayRemove, onSnapshot } from 'firebase/firestore';
import { IoIosArrowRoundBack } from "react-icons/io";
import { db } from '../../firebase/Firebase';
import { Blog } from '../../context/Context';
import { Link } from 'react-router-dom';
import Notification from '../../components/NotificationsComp/Notification';
import { useQueryClient } from 'react-query'; // Importando useQueryClient


import "./NotificationPage.scss";

const NotificationsPage = () => {
  const { currentUser } = Blog();
  const [notifications, setNotifications] = useState([]);
  const queryClient = useQueryClient(); // Usando useQueryClient para invalidar o cache

  useEffect(() => {
    let unsubscribe;

    const fetchNotifications = async () => {
      try {
        if (!currentUser) return;

        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubscribe = onSnapshot(userDocRef, (userDocSnapshot) => {
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            const fetchedNotifications = userData.notifications || [];
            setNotifications(fetchedNotifications);
          } else {
            console.log('User not found');
          }
        });
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, queryClient]); // Adicionando queryClient como dependência para reagir à invalidação do cache

  const handleDeleteNotification = async (notificationToDelete) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        notifications: arrayRemove(notificationToDelete)
      });

      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification !== notificationToDelete)
      );

      // Invalida o cache após excluir a notificação
      queryClient.invalidateQueries('currentUser');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      if (!userId) throw new Error('Invalid user ID');
      const userDocRef = doc(db, 'users', userId);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        return userDocSnapshot.data();
      } else {
        console.log('User not found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  return (
    <section id="notification">
      <Link to="/" className="back">
        <IoIosArrowRoundBack size={32} />
        <p>Inicio</p>
      </Link>
      <h1>Notificações</h1>
      <div className="border-bottom"></div>

      {notifications.map((userId, index) => (
        <Notification
          key={index}
          userId={userId}
          onDelete={() => handleDeleteNotification(userId)}
          fetchUserData={fetchUserData}
        />
      ))}

    </section>
  );
};

export default NotificationsPage;
