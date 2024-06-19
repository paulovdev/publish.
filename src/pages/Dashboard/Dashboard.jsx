import React, { useState } from "react";
import { MdOutlineVisibility, MdDeleteOutline, MdEdit } from "react-icons/md";
import { IoChevronForwardOutline } from "react-icons/io5";

import Skeleton from "react-loading-skeleton";
import { motion } from "framer-motion";
import EditPostModal from "../../components/Modals/EditPostModal/EditPostModal";
import "./Dashboard.scss";
import { Link } from "react-router-dom";
import { Blog } from "../../context/Context";
import { useQuery } from "react-query";
import {
  getDocs,
  collection,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  doc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../firebase/Firebase";

const Dashboard = () => {
  const { currentUser } = Blog();
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: posts, isLoading } = useQuery("posts", async () => {
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

  const handleEditClick = (post) => {
    setSelectedPost(post);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const handleDeleteClick = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      await updateDoc(doc(db, "users", currentUser.uid), {
        posts: arrayRemove(postId),
      });
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <section id="dashboard">
      <Link to="/" className="back">
        Inicio
        <IoChevronForwardOutline size={18} />
        Dashboard
      </Link>
      <h1>Dashboard</h1>
      <div className="border-bottom"></div>
      {isLoading && (
        <motion.div
          className="posts"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {Array(3)
            .fill()
            .map((_, index) => (
              <div className="post-dashboard" key={index}>
                <div className="text">
                  <Skeleton width={350} height={15} />
                  <br />
                  <Skeleton width={350} height={10} />
                  <Skeleton width={350} height={10} />
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

      <motion.div
        className="posts"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!isLoading &&
          posts.map((post) => (
            <div key={post.id} className="post-dashboard">
              <div className="text">
                <h2>{post.title}</h2>
                <div
                  className="body-dashboard"
                  dangerouslySetInnerHTML={{
                    __html: post.desc.slice(0, 200),
                  }}
                ></div>
              </div>
              <div className="background">
                {post.imageUrl && (
                  <img src={post.imageUrl} width={100} alt="Post" />
                )}
              </div>
              <div className="actions">
                <Link to={`/view-post/${post.id}`}>
                  <MdOutlineVisibility size={18} />
                </Link>
                <button onClick={() => handleEditClick(post)}>
                  {" "}
                  <MdEdit size={18} />
                </button>
                <button onClick={() => handleDeleteClick(post.id)}>
                  {" "}
                  <MdDeleteOutline size={18} />
                </button>
              </div>
            </div>
          ))}
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
