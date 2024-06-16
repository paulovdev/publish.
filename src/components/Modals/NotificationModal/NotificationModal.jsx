import React, { useState, useEffect } from 'react';
import { doc,  updateDoc, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/Firebase';
import { Blog } from '../../../context/Context';
import Notification from '../../../components/NotificationsComp/Notification';
import { useQueryClient } from 'react-query';
import { motion } from 'framer-motion';

import "./NotificationModal.scss";

const NotificationModal = () => {
    const { currentUser } = Blog();
    const [notifications, setNotifications] = useState([]);
    const queryClient = useQueryClient();

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
    }, [currentUser, queryClient]);

    const handleDeleteNotification = async (notificationToDelete) => {
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                notifications: arrayRemove(notificationToDelete)
            });

            setNotifications((prevNotifications) =>
                prevNotifications.filter((notification) => notification !== notificationToDelete)
            );
            queryClient.invalidateQueries('currentUser');
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <motion.div id="notification-modal"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}>
            <h1>Notificações</h1>
            <div className="border-bottom"></div>
            {notifications.map((userId, index) => (
                <Notification
                    key={index}
                    userId={userId}
                    onDelete={() => handleDeleteNotification(userId)}
                />
            ))}
        </motion.div>
    );
};

export default NotificationModal;
