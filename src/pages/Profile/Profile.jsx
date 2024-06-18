import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase/Firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import EditProfileModal from '../../components/Modals/EditProfileModal/EditProfileModal';
import FollowButton from '../../components/FollowButton/FollowButton';
import Skeleton from 'react-loading-skeleton';
import { useQuery, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';

import './Profile.scss';
import { Blog } from '../../context/Context';

const Profile = () => {
    const { id } = useParams();
    const { currentUser } = Blog();
    const queryClient = useQueryClient();

    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [userData, setUserData] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const { data: userPosts, isLoading: isLoadingPosts } = useQuery(['userPosts', id], async () => {
        const userDocRef = doc(db, 'users', id);
        const userDocSnapshot = await getDoc(userDocRef);
        const userData = userDocSnapshot.data();
        const userPostIds = userData.posts || [];
        const userPostsPromises = userPostIds.map(async (postId) => {
            const postDocRef = doc(db, 'posts', postId);
            const postDocSnapshot = await getDoc(postDocRef);
            return postDocSnapshot.exists() ? { id: postDocSnapshot.id, ...postDocSnapshot.data() } : null;
        });

        const posts = await Promise.all(userPostsPromises);
        return posts.filter(post => post !== null);
    });

    useEffect(() => {
        const userDocRef = doc(db, 'users', id);

        // Listener for user document
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
            const userData = doc.data();
            setUserData(userData);
            setFollowers(userData.followers || []);
            setFollowing(userData.following || []);
        });

        // Cleanup function for user listener
        return () => {
            unsubscribeUser();
        };
    }, [id]);

    useEffect(() => {
        const unsubscribeFollowings = following.map((followId) => {
            const followingDocRef = doc(db, 'users', followId);

            // Listener for each following user document
            return onSnapshot(followingDocRef, (doc) => {
                const followingData = doc.data();
                setFollowing(prevFollowing => prevFollowing.map(f => f.id === followId ? followingData : f));
            });
        });

        // Cleanup function for following listeners
        return () => {
            unsubscribeFollowings.forEach(unsub => unsub());
        };
    }, [following]);

    const handleEditClick = () => setShowProfileModal(true);
    const closeEditModal = () => setShowProfileModal(false);

    const setUser = (newUserData) => {
        queryClient.setQueryData(['user', id], newUserData);
        closeEditModal();
    };

    if (!userData || isLoadingPosts) {
        return (
            <section id="my-profile">
                <div className='post-profile'>
                    <div>
                        <div className="container">
                            <div className="profile-photo">
                                <Skeleton width={150} height={150} borderRadius={100} />
                                <div className="wrapper-text">
                                    <div className="follow-container">
                                        <div className="follow-content">
                                            <Skeleton width={10} height={25} />
                                            <Skeleton width={75} height={10} />
                                        </div>
                                        <div className="follow-content">
                                            <Skeleton width={10} height={25} />
                                            <Skeleton width={75} height={10} />
                                        </div>
                                        <div className="follow-content">
                                            <Skeleton width={10} height={25} />
                                            <Skeleton width={75} height={10} />
                                        </div>
                                    </div>
                                    <Skeleton width={300} height={40} borderRadius={20} />
                                </div>
                            </div>

                            <div className="profile-text">
                                <Skeleton width={150} height={15} />
                                <Skeleton width={300} height={10} />
                            </div>
                            <div className="border-bottom"></div>
                        </div>
                    </div>
                </div>
                <div className="my-posts-profile">
                    <div className='post-profile'>
                        <span><Skeleton width={75} height={15} /></span>
                        <h1><Skeleton width={`100%`} height={10} /></h1>
                        <div><Skeleton width={`100%`} height={10} /></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section id="my-profile">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}>
                    <div className="container">
                        <div className="profile-photo">
                            <img src={userData.profilePicture} alt="Profile" className="profile-picture" />
                            <div className="wrapper-text">
                                <div className="follow-container">
                                    <div className="follow-content">
                                        <span>{followers.length}</span>
                                        <p>Seguidores</p>
                                    </div>
                                    <div className="follow-content">
                                        <span>{following.length}</span>
                                        <p>Seguindo</p>
                                    </div>
                                    <div className="follow-content">
                                        <span>{userPosts.length}</span>
                                        <p>Publicações</p>
                                    </div>
                                </div>
                                {currentUser.uid === id && <button onClick={handleEditClick}>Editar perfil</button>}
                                {currentUser.uid !== id && <FollowButton userId={id} />}
                            </div>
                        </div>

                        <div className="profile-text">
                            <h1>{userData.name}</h1>
                            <p>{userData.bio}</p>
                        </div>

                    </div>
                    <div className="border-bottom"></div>
                </motion.div>

                <div className="my-posts-profile">
                    {!isLoadingPosts && userPosts.map((post) => (
                        <div className='post-profile' key={post.id}>
                            <span>{post.topics}</span>
                            <h1>{post.title}</h1>
                            <div className="body-posts" dangerouslySetInnerHTML={{ __html: post.desc }}></div>
                        </div>
                    ))}
                </div>
            </section>

            {showProfileModal &&
                <EditProfileModal user={userData} setUser={setUser} onClick={closeEditModal} />
            }
        </>
    );
};

export default Profile;
