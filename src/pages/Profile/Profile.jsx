import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase/Firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import EditProfileModal from '../../components/Modals/EditProfileModal/EditProfileModal';
import FollowButton from '../../components/FollowButton/FollowButton';
import Skeleton from 'react-loading-skeleton';
import { useQuery, useQueryClient } from 'react-query'; // Importe useQueryClient
import { motion } from 'framer-motion';

import './Profile.scss';
import { Blog } from '../../context/Context';

const Profile = () => {
    const { id } = useParams();
    const { currentUser } = Blog();
    const queryClient = useQueryClient(); // Obtenha o queryClient do React Query

    const { data: user, isLoading: isLoadingUser } = useQuery(['user', id], async () => {
        const userDocRef = doc(db, 'users', id);
        const userDocSnapshot = await getDoc(userDocRef);
        return userDocSnapshot.data();
    });

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

    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleEditClick = () => setShowProfileModal(true);
    const closeEditModal = () => setShowProfileModal(false);

    const setUser = (newUserData) => {
        // Atualiza os dados do usuário no cache do React Query
        queryClient.setQueryData(['user', id], newUserData);
        // Fecha o modal de edição
        closeEditModal();
    };

    if (isLoadingUser || isLoadingPosts) {
        return (
            <div className='post-profile'>
                <span><Skeleton width={75} height={15} /></span>
                <h1><Skeleton width={'100%'} height={10} /></h1>
                <div><Skeleton width={'100%'} height={10} /></div>
            </div>
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
                            <img src={user.profilePicture} alt="Profile" className="profile-picture" />
                            <div className="wrapper-text">
                                <div className="follow-container">
                                    <div className="follow-content">
                                        <span>{user.followers.length}</span>
                                        <p>Seguidores</p>
                                    </div>
                                    <div className="follow-content">
                                        <span>{user.following.length}</span>
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
                        <h1>{user.name}</h1>
                        <p>{user.bio}</p>
                    </div>
                    <div className="border-bottom"></div>
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
                <EditProfileModal user={user} setUser={setUser} onClick={closeEditModal} />
            }
        </>
    );
};

export default Profile;
