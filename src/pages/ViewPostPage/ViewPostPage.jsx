import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { readTime } from "../../utils/ReadTime";
import { db } from "../../firebase/Firebase";
import { Blog } from "../../context/Context";

import { FaRegComment } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { FaRegHeart } from "react-icons/fa";

import { MdDateRange } from "react-icons/md";
import { CiClock2 } from "react-icons/ci";
import { MdCategory } from "react-icons/md";

import { useQuery, useMutation, useQueryClient } from "react-query";

import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import { Tooltip } from "react-tooltip";
import CommentModal from "../../components/Modals/CommentModal/CommentModal";

import "./ViewPostPage.scss";

const fetchPost = async (id) => {
  const postDoc = await getDoc(doc(db, "posts", id));
  if (postDoc.exists()) {
    const postData = postDoc.data();

    // Increment view count
    const currentViews = parseInt(postData.views);
    const updatedViews = isNaN(currentViews) ? 1 : currentViews + 1;

    await updateDoc(postDoc.ref, {
      views: updatedViews,
    });

    // Get user data
    const userDoc = await getDoc(doc(db, "users", postData.userId));
    const userData = userDoc.exists() ? userDoc.data() : null;

    // Get topic name
    const topicDoc = await getDoc(doc(db, "topics", postData.topics));
    const topicData = topicDoc.exists() ? topicDoc.data().name : null;

    return {
      id: postDoc.id,
      ...postData,
      user: userData,
      topicName: topicData,
    };
  } else {
    throw new Error("Post not found");
  }
};

const ViewPostPage = () => {
  const { id } = useParams();
  const { currentUser } = Blog();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery(["post", id], () => fetchPost(id));

  const likePostMutation = useMutation(
    async () => {
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const postRef = doc(db, "posts", id);
      const postSnapshot = await getDoc(postRef);
      if (!postSnapshot.exists()) {
        throw new Error("Post not found");
      }

      const currentLikes = postSnapshot.data().likes || {};
      const updatedLikes = { ...currentLikes, [currentUser.uid]: true };

      await updateDoc(postRef, { likes: updatedLikes });

      return updatedLikes;
    },
    {
      onMutate: async () => {
        // Optimistically update UI
        const optimisticLikes = { ...post.likes, [currentUser.uid]: true };

        queryClient.setQueryData(["post", id], (oldData) => ({
          ...oldData,
          likes: optimisticLikes,
        }));

        return () => queryClient.setQueryData(["post", id], post);
      },
      onError: (err, rollback) => {
        // Rollback on error
        rollback();
        console.error("Like mutation error:", err);
      },
      onSuccess: () => {
        // Invalidate post query on success
        queryClient.invalidateQueries(["post", id]);
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

  const sharePost = () => {
    const postUrl = window.location.href;
    if (navigator.share) {
      navigator
        .share({ url: postUrl })
        .then(() => console.log("Post shared successfully!"))
        .catch((error) => console.error("Error sharing post:", error));
    } else {
      console.log("This browser does not support the Web Share API.");
    }
  };

  if (isLoading) {
    return (
      <motion.section
        id="post-solo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          <div className="image-background">
            <Skeleton width={800} height={400} />
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
    <>
      <motion.section
        id="post-solo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          <div className="title-text">
            <div className="topic">
              <span>
                {" "}
                <MdCategory size={14} />
                {post.topicName}
              </span>
            </div>
            <h1>{post.title}</h1>
            <p>{post.subTitle}</p>

            <div className="all-content">
              <div className="several-content">
                <div className="profile-content" onClick={goToProfile}>
                  {post.user && post.user.profilePicture && (
                    <img
                      src={post.user.profilePicture}
                      loading="lazy"
                      alt="User"
                      className="user-photo"
                    />
                  )}
                  {post.user && post.user.name && (
                    <p>{post.user.name}</p>
                  )}
                </div>
                <span>
                  {" "}
                  <CiClock2 size={16} />
                  {readTime({ __html: post.desc })} min de leitura
                </span>
                <span>
                  <MdDateRange size={14} />{post.created}
                </span>
              </div>

              <div className="action-icons">

                <div className="action-icon-wrapper">
                  <div
                    className="action-icon"
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content={`${Object.keys(post.likes || {}).length
                      } Curtida`}
                    onClick={handleLikePost}
                  >
                    <button>
                      <FaRegHeart size={16} />
                    </button>
                  </div>

                  <div
                    className="action-icon"
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Comentar"
                    onClick={() => setIsCommentModalOpen(true)}
                  >
                    <FaRegComment size={16} />
                  </div>
                </div>

                <div
                  className="action-icon"
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Compartilhar"
                  onClick={sharePost}
                >
                  <FiShare2 size={16} />
                </div>
              </div>

            </div>
          </div>

          <div className="image-background">
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                loading="lazy"
                width={100}
                alt="Post"
                className="post-image"
              />
            )}
          </div>
        </div>

        <div className="post">
          <div
            className="body-post"
            dangerouslySetInnerHTML={{
              __html: post.desc,
            }}
          ></div>
        </div>
      </motion.section>

      {isCommentModalOpen && (
        <CommentModal
          postId={id}
          comments={post.comments}
          currentUser={currentUser}
          onClose={() => setIsCommentModalOpen(false)}
        />
      )}
      <Tooltip id="my-tooltip" />
    </>
  );
};

export default ViewPostPage;
