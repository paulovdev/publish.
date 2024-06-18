import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/Firebase';
import { Blog } from '../../context/Context';
import Skeleton from 'react-loading-skeleton';

const FollowButton = ({ userId }) => {
    const { currentUser } = Blog();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkIfFollowing = async () => {
            try {
                if (!currentUser) {
                    setIsFollowing(false);
                    setLoading(false);
                    return;
                }

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
                const currentUserRef = doc(db, 'users', currentUser.uid);
                await updateDoc(currentUserRef, {
                    following: arrayUnion(userId),
                });

                await updateDoc(userRef, { notifications: arrayUnion(currentUser.uid) });
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
                const currentUserRef = doc(db, 'users', currentUser.uid);
                await updateDoc(currentUserRef, {
                    following: arrayRemove(userId),
                });

                await updateDoc(userRef, { notifications: arrayRemove(currentUser.uid) });
            }

            setIsFollowing(false);
        } catch (error) {
            console.error('Error unfollowing user:', error);
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
