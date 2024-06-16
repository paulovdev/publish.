import React from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/Firebase';
import { Link } from 'react-router-dom';
import Skeleton from "react-loading-skeleton";
import { useQuery } from 'react-query';

const fetchUserData = async (userId) => {
    if (!userId) {
        throw new Error('User ID is null or undefined');
    }

    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error('User does not exist');
        }

        return userDoc.data();
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

const Notification = ({ userId, onDelete }) => {
    const { data: user, error, isLoading } = useQuery(['userData', userId], () => fetchUserData(userId), {
        enabled: !!userId, // Only enable the query if userId is defined
    });

    if (isLoading) {
        return (
            <div className="notification-item">
                <div className="user-info">
                    <Link to="#">
                        <Skeleton borderRadius={100} width={50} height={50} />
                    </Link>
                </div>
                <div className="user-text">
                    <p><Skeleton width={300} height={10} /></p>
                    <Skeleton width={100} height={10} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notification-item">
                <div className="user-info">
                    <Link to="#">
                        <Skeleton borderRadius={100} width={50} height={50} />
                    </Link>
                </div>
                <div className="user-text">
                    <p>Error loading notification: {error.message}</p>
                    <button onClick={onDelete}>Delete notification</button>
                </div>
            </div>
        );
    }

/*     if (!user) {
        return <div>No user data available</div>;
    } */

    return (
        <motion.div
            key={user.id}
            className="notification-item"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="user-info">
                <Link to={`/profile/${user.uid}`}>
                    <img src={user.profilePicture} alt={`${user.username}'s profile`} />
                </Link>
            </div>
            <div className="user-text">
                <p><span>{user.name}</span> começou a seguir você</p>
                <button onClick={onDelete}>Deletar notificação</button>
            </div>
        </motion.div>
    );
};

export default Notification;
