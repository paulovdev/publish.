import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  getDocs,
  doc,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Blog } from "../../context/Context";
import { useQuery, useQueryClient } from "react-query";
import { db } from "../../firebase/Firebase";

import { MdOutlineModeEditOutline } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";

import Skeleton from "react-loading-skeleton";
import { motion } from "framer-motion";
import EditPostModal from "../../components/Modals/EditPostModal/EditPostModal";
import "./Dashboard.scss";

const Dashboard = () => {
  const { currentUser } = Blog();
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: posts, isLoading, refetch } = useQuery(
    "posts",
    async () => {
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
    }
  );

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "posts"),
        where("userId", "==", currentUser.uid),
        orderBy("created", "desc")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        queryClient.setQueryData("posts", postsData);
      });

      return () => unsubscribe();
    }
  }, [currentUser, queryClient]);

  const handleEditClick = (post) => {
    setSelectedPost(post);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    refetch();
  };

  const handleDeleteClick = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      await updateDoc(doc(db, "users", currentUser.uid), {
        posts: arrayRemove(postId),
      });
      refetch();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <section id="dashboard">
      <div className="head-text">
        <h1>Dashboard</h1>
      </div>
      {isLoading && (
        <motion.div
          className="posts"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <table className="post-table">
            <thead>
              <tr>
                <th></th>
                <th>Título</th>
                <th>Data</th>
                <th>Visualizações</th>
                <th>Curtidas</th>
                <th>Editar</th>
                <th>Excluir</th>
              </tr>
            </thead>
            <tbody>
              {Array(3)
                .fill()
                .map((_, index) => (
                  <tr key={index}>
                    <td></td>

                    <td>
                      <Skeleton width={100} height={15} />
                    </td>
                    <td>
                      <Skeleton width={40} height={15} />
                    </td>
                    <td>
                      <Skeleton width={40} height={15} />
                    </td>
                    <td>
                      <Skeleton width={40} height={30} />
                    </td>
                    <td>
                      <Skeleton width={40} height={30} />
                    </td>
                    <td>
                      <Skeleton width={40} height={30} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </motion.div>
      )}

      <motion.div
        className="posts"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!isLoading && (
          <table className="post-table">
            <thead>
              <tr>
                <th></th>
                <th>Título</th>
                <th>publicado</th>
                <th>Visualizações</th>
                <th>Curtidas</th>
                <th>Editar</th>
                <th>Excluir</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td><img src={post.imageUrl} alt="" /> </td>
                  <td onClick={() => navigate(`/view-post/${post.id}`)}>{post.title}</td>
                  <td>{post.created}</td>
                  <td>{post.views}</td>
                  <td>{Object.keys(post.likes || {}).length}</td>
                  <td>
                    <button onClick={() => handleEditClick(post)}>
                      <MdOutlineModeEditOutline size={24} />
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteClick(post.id)}>
                      <FaRegTrashAlt size={18} color="#f00" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
      {showEditModal && (
        <EditPostModal
          postId={selectedPost}
          closeModal={closeEditModal}
          onClick={closeEditModal}
        />
      )}
    </section>
  );
};

export default Dashboard;