import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Skeleton from "react-loading-skeleton";

const Notification = ({ userId, onDelete, fetchUserData }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (userId) {
                    const userData = await fetchUserData(userId);
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser();
    }, [fetchUserData, userId]);

    return (
        <>
            {!user && (
                <div>
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
                </div>
            )}
            {user && (

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
            )}
        </>
    );
};

export default Notification;