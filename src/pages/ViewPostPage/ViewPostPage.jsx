import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { readTime } from "../../utils/ReadTime";
import { db } from '../../firebase/Firebase';
import { Blog } from '../../context/Context';
import { FaRegComments } from "react-icons/fa6";
import { FiShare2 } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from 'react-query';

import "./ViewPostPage.scss";
import { AnimatePresence, motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';

const fetchPost = async (id) => {
    const postDoc = await getDoc(doc(db, 'posts', id));
    if (postDoc.exists()) {
        const postData = postDoc.data();

        // Increment view count
        const currentViews = parseInt(postData.views); // Ensure the current value is interpreted as a number
        const updatedViews = isNaN(currentViews) ? 1 : currentViews + 1; // If the current value is not a valid number, set to 1

        await updateDoc(postDoc.ref, {
            views: updatedViews
        });

        // Get user data
        const userDoc = await getDoc(doc(db, 'users', postData.userId));
        const userData = userDoc.exists() ? userDoc.data() : null;

        // Get topic name
        const topicDoc = await getDoc(doc(db, 'topics', postData.topics));
        const topicData = topicDoc.exists() ? topicDoc.data().name : null;

        return {
            id: postDoc.id,
            ...postData,
            user: userData,
            topicName: topicData
        };
    } else {
        throw new Error('Post not found');
    }
};

const ViewPostPage = () => {
    const { id } = useParams();
    const { currentUser } = Blog();
    const [commentText, setCommentText] = useState('');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: post, isLoading } = useQuery(['post', id], () => fetchPost(id));

    const likePostMutation = useMutation(
        async () => {
            if (!currentUser) {
                console.log('Usuario nao autenticado')
            };
            await updateDoc(doc(db, 'posts', id), {
                [`likes.${currentUser.uid}`]: true
            });
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['post', id]);
            },
        }
    );

    const addCommentMutation = useMutation(
        async (newComment) => {
            if (!currentUser) {
                console.log('Usuario nao autenticado')
            };
            const commentId = `comment_${new Date().getTime()}`;
            await updateDoc(doc(db, 'posts', id), {
                [`comments.${commentId}`]: newComment
            });
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['post', id]);
                setCommentText('');
            },
        }
    );

    const goToProfile = () => {
        navigate(`/profile/${post.user.uid}`);
    };

    const handleLikePost = () => {
        if (currentUser) {
            likePostMutation.mutate();
        }
    };

    const handleAddComment = () => {
        if (currentUser && commentText) {
            const newComment = {
                userId: currentUser.uid,
                text: commentText,
                timestamp: Date.now()
            };
            addCommentMutation.mutate(newComment);
        }
    };

    const sharePost = () => {
        const postUrl = window.location.href;
        if (navigator.share) {
            navigator.share({ url: postUrl })
                .then(() => console.log('Post shared successfully!'))
                .catch((error) => console.error('Error sharing post:', error));
        } else {
            console.log('This browser does not support the Web Share API.');
        }
    };

    if (isLoading) {
        return (
            <motion.section id="post-solo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}>
                <div className="container">
                    <div className="image-background">
                        <Skeleton width={948} height={498} />
                    </div>
                    <Skeleton width={120} height={20} />
                    <br />
                    <div className="title-text">
                        <Skeleton width={`100%`} height={30} />
                        <Skeleton width={250} height={15} />
                        <Skeleton width={250} height={15} />
                        <Skeleton width={250} height={15} />
                        <div className="profile">
                            <div className="profile-image">
                                <Skeleton circle={true} height={50} width={50} />
                            </div>
                            <div className="profile-info">
                                <Skeleton width={180} height={10} />
                            </div>
                        </div>
                        <div className="action-icons">
                            <div className="action-icon">
                                <Skeleton width={`40%`} height={20} />
                            </div>
                            <div className="action-icon">
                                <a href="#user-comments">
                                    <Skeleton width={`40%`} height={20} />
                                </a>
                            </div>
                            <div className="action-icon" onClick={sharePost}>
                                <Skeleton width={`40%`} height={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="post">
                    <div className="body-post">
                        <Skeleton width={`100%`} count={2} />
                        <br />
                        <Skeleton width={`100%`} count={4} />
                        <br />
                        <Skeleton width={`100%`} count={6} />
                    </div>
                </div>
            </motion.section>
        );
    }

    return (
        <motion.section id="post-solo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            <div className="container">
                <div className="image-background">
                    {post.imageUrl && <img src={post.imageUrl} loading="lazy" width={100} alt="Post" className="post-image" />}
                </div>
                <span className="topic">{post.topicName}</span>
                <div className="title-text">
                    <h1>{post.title}</h1>
                    <p>{readTime({ __html: post.desc })} min de leitura</p>
                    <div className="profile">
                        {post.user && post.user.profilePicture && (
                            <img src={post.user.profilePicture} onClick={goToProfile} width={100} alt="User" className="user-photo" />
                        )}
                        <div className="text">
                            <div className="post-by">
                                {post.user && post.user.name && <p>Posted by: <span>{post.user.name}</span></p>}
                            </div>
                        </div>
                    </div>
                    <div className="action-icons">
                        <div className="action-icon" onClick={handleLikePost}>
                            <button>
                                <FaHeart size={16} color="#fff" />
                            </button>
                            {Object.keys(post.likes || {}).length}
                        </div>
                        <div className="action-icon">
                            <a href="#user-comments">
                                <FaRegComments size={22} color="#fff" />
                            </a>
                        </div>
                        <div className="action-icon" onClick={sharePost}>
                            <FiShare2 size={22} color="#fff" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="post">
                <div
                    className="body-post"
                    dangerouslySetInnerHTML={{
                        __html: post.desc
                    }}
                ></div>
            </div>
            <div className="comments-section">
                <h2>Comments</h2>
                {Object.values(post.comments || {}).map((comment, index) => (
                    <div key={index} className="comment">
                        <p>{comment.text}</p>
                    </div>
                ))}
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment"
                />
                <button onClick={handleAddComment}>Comment</button>
            </div>
        </motion.section>
    );
};

export default ViewPostPage;
