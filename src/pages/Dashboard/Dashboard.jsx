import React, { useState } from 'react';
import { MdOutlineVisibility, MdDeleteOutline, MdEdit } from "react-icons/md";
import { IoIosArrowRoundBack } from "react-icons/io";
import Skeleton from "react-loading-skeleton";
import { motion } from "framer-motion";
import EditPostModal from '../../components/Modals/EditPostModal/EditPostModal';
import './Dashboard.scss';
import { Link } from 'react-router-dom';
import { Blog } from '../../context/Context';
import { useQuery } from 'react-query';
import { getDocs, collection, query, where, orderBy, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/Firebase';

const Dashboard = () => {
    const { currentUser } = Blog();
    const [selectedPost, setSelectedPost] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const { data: posts, isLoading } = useQuery('posts', async () => {
        const q = query(
            collection(db, "posts"),
            where("userId", "==", currentUser.uid),
            orderBy("created", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    });

    const handleEditClick = (postId) => {
        setSelectedPost(postId);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
    };

    const handleDeleteClick = async (postId) => {
        try {
            await deleteDoc(doc(db, 'posts', postId));

            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                posts: arrayRemove(postId)
            });
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };


    return (
        <section id="dashboard">
            <Link to="/" className="back">
                <IoIosArrowRoundBack size={32} />
                <p>Inicio</p>
            </Link>
            <h1>Dashboard</h1>
            <div className="border-bottom"></div>
            {isLoading && (
                <motion.div className="posts" initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}>
                    {Array(posts ? posts.length : 5)
                        .fill()
                        .map((_, index) => (
                            <div className="post-dashboard" key={index}>
                             
                                <div className="text">
                                    <Skeleton width={250} height={10} />
                                </div>
                                <div className="actions">
                                    <Skeleton width={40} height={30} />
                                    <Skeleton width={40} height={30} />
                                    <Skeleton width={40} height={30} />
                                </div>
                            </div>
                        ))}
                </motion.div>
            )}

            <motion.div className="posts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                {!isLoading &&
                    posts.map(post => (
                        <div key={post.id} className="post-dashboard">
                            <h2>{post.title}</h2>
                            <div className="background">
                                {post.imageUrl && <img src={post.imageUrl} width={100} alt="Post" />}
                            </div>
                            <p>{post.text}</p>
                            <div className="actions">
                                <li>
                                    <Link to={`/view-post/${post.id}`}>
                                        <MdOutlineVisibility size={18} />
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={() => handleEditClick(post)}> <MdEdit size={18} /></button>
                                </li>
                                <li>
                                    <button onClick={() => handleDeleteClick(post.id)}> <MdDeleteOutline size={18} /></button>
                                </li>
                            </div>
                        </div>
                    ))
                }
            </motion.div>
            {showEditModal && <EditPostModal postId={selectedPost} closeModal={closeEditModal} onClick={closeEditModal} />}
        </section>
    );
};

export default Dashboard;
