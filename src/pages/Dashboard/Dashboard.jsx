import React, { useState } from "react";
import {
  collection,
  query,
  doc,
  where,
  orderBy,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { useQuery, useMutation, useQueryClient } from "react-query";
import { db } from "../../firebase/Firebase";

import { MdOutlineModeEditOutline } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";

import Skeleton from "react-loading-skeleton";
import { motion } from "framer-motion";
import EditPostModal from "../../components/Modals/EditPostModal/EditPostModal";
import "./Dashboard.scss";
import { Blog } from "../../context/Context";

const Dashboard = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient()
  const navigate = useNavigate();
  const { currentUser } = Blog(); 


  const { data: posts, isLoading} = useQuery(
    "posts",
    async () => {
      if (!currentUser) return { posts: [], totalViews: 0, totalLikes: 0 };

      const q = query(
        collection(db, "posts"),
        where("userId", "==", currentUser.uid), // Filter by current user's UID
        orderBy("created", "desc")
      );
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate total views and total likes
      const totalViews = postsData.reduce((sum, post) => sum + post.views, 0);
      const totalLikes = postsData.reduce((sum, post) => sum + Object.keys(post.likes || {}).length, 0);

      return { posts: postsData, totalViews, totalLikes };
    }
  );

  // Mutation to delete a post
  const deletePost = useMutation(
    async (postId) => {
      await deleteDoc(doc(db, "posts", postId));
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
      },
    }
  );

  const handleEditClick = (post) => {
    setSelectedPost(post);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const handleDeleteClick = async (postId) => {
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      try {
        await deletePost.mutateAsync(postId);
      } catch (error) {
        console.error("Erro ao deletar o post:", error);
      }
    }
  };

  return (
    <section id="dashboard">
      <div className="head-text">
        <h1>Dashboard</h1>
        {!isLoading && (
          <div>
            <h2>
              Total de <span>{posts.totalViews}</span> visualizações e{" "}
              <span>{posts.totalLikes}</span> curtidas em todos os posts.
            </h2>
          </div>
        )}
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
                <th>Publicado</th>
                <th>Visualizações</th>
                <th>Curtidas</th>
                <th>Editar</th>
                <th>Excluir</th>
              </tr>
            </thead>
            <tbody>
              {posts.posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <img src={post.imageUrl} alt="" style={{ width: "50px", height: "50px" }} />
                  </td>
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
