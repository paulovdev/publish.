// FollowButton.js
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/Firebase';
import { Blog } from '../../context/Context';
import Skeleton from 'react-loading-skeleton';
import { toast } from 'react-toastify';

const FollowButton = ({ userId }) => {
    const { currentUser } = Blog();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkIfFollowing = async () => {
            try {
                const userDocRef = doc(db, 'users', userId);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    setIsFollowing(userData.followers.includes(currentUser.uid));
                }
            } catch (error) {
                console.error('Error checking follow status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkIfFollowing();
    }, [currentUser, userId]);

    const handleFollow = async () => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                followers: arrayUnion(currentUser.uid), 
            });

            if (currentUser) {
                await updateDoc(userRef, {
                    notifications: arrayUnion(currentUser.uid),
                });
            }

            setIsFollowing(true);
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleUnfollow = async () => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                followers: arrayRemove(currentUser.uid),
            });

            if (currentUser) {
                await updateDoc(userRef, {
                    notifications: arrayRemove(currentUser.uid),
                });
            }

            setIsFollowing(false);
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    if (loading) {
        return <Skeleton width={100} height={40} />;
    }

    return (
        <>
            {isFollowing ? (
                <button onClick={handleUnfollow}>Deixar de seguir</button>
            ) : (
                <button onClick={handleFollow}>Seguir</button>
            )}
        </>
    );
};

export default FollowButton;
