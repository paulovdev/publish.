import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import EditProfileModal from '../../components/Modals/EditProfileModal/EditProfileModal';
import FollowButton from '../../components/FollowButton/FollowButton';
import Skeleton from 'react-loading-skeleton';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';

import './Profile.scss';
import { Blog } from '../../context/Context';

const Profile = () => {
    const { id } = useParams();
    const { currentUser, setCurrentUser } = Blog();

    const [showProfileModal, setShowProfileModal] = useState(false);

    const { data: user, isLoading: isLoadingUser } = useQuery(['user', id], async () => {
        const userDocRef = doc(db, 'users', id);
        const userDocSnapshot = await getDoc(userDocRef);
        return userDocSnapshot.exists() ? userDocSnapshot.data() : null;
    });

    const { data: posts, isLoading: isLoadingPosts } = useQuery(['userPosts', id], async () => {
        const userDocRef = doc(db, 'users', id);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            const userPostIds = userData.posts || [];
            const userPostsPromises = userPostIds.map(async (postId) => {
                const postDocRef = doc(db, 'posts', postId);
                const postDocSnapshot = await getDoc(postDocRef);
                return postDocSnapshot.exists() ? { id: postDocSnapshot.id, ...postDocSnapshot.data() } : null;
            });
            const userPosts = await Promise.all(userPostsPromises);
            return userPosts.filter(post => post !== null);
        } else {
            console.error('User document not found');
            return [];
        }
    });

    const handleEditClick = () => setShowProfileModal(true);
    const closeEditModal = () => setShowProfileModal(false);

    if (isLoadingUser) {
        return (
            <div className='post-profile'>
                <span><Skeleton width={75} height={15} /></span>
                <h1><Skeleton width={'100%'} height={10} /></h1>
                <div><Skeleton width={'100%'} height={10} /></div>
            </div>
        );
    }

    const { name, profilePicture, bio } = user || {};

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
                            <img src={profilePicture} width={150} height={150} alt="Profile" className="profile-picture" />
                            <div className="wrapper-text">
                                <h1>{name}</h1>
                                <p>{bio}</p>
                                {currentUser.uid === id && <button onClick={handleEditClick}>Editar perfil</button>}
                                {currentUser.uid !== id && <FollowButton userId={id} />}
                            </div>
                        </div>
                        <div className="border-bottom"></div>
                    </div>
                </motion.div>

                <div className="my-posts-profile">
                    {!currentUser && <h2>Meus Posts</h2>}
                    {currentUser && <h2>Posts de {user.name}</h2>}
                    {isLoadingPosts &&
                        <div className='post-profile'>
                            <span><Skeleton width={75} height={15} /></span>
                            <h1><Skeleton width={'100%'} height={10} /></h1>
                            <div><Skeleton width={'100%'} height={10} /></div>
                        </div>
                    }
                    {!isLoadingPosts && posts.map((post) => (
                        <div className='post-profile' key={post.id}>
                            <span>{post.topics}</span>
                            <h1>{post.title}</h1>
                            <div className="body-posts" dangerouslySetInnerHTML={{ __html: post.desc }}></div>
                        </div>
                    ))}
                </div>
            </section>

            {showProfileModal &&
                <EditProfileModal user={user} setUser={setCurrentUser} closeModal={closeEditModal} onClick={closeEditModal} />
            }
        </>
    );
};

export default Profile;
