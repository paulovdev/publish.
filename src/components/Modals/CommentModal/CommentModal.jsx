import React, { useState, useEffect } from "react";
import {
  getDoc,
  updateDoc,
  query,
  onSnapshot,
  collection,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/Firebase";
import { MdOutlineClose } from "react-icons/md";
import { motion } from "framer-motion";
import { IoIosSend } from "react-icons/io";
import { FaRegHeart, FaRegTrashAlt } from "react-icons/fa";
import { useQueryClient } from "react-query";
import "./CommentModal.scss";

const CommentModal = ({ postId, currentUser, onClose }) => {
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [showReply, setShowReply] = useState({});
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchComments = () => {
      const q = query(collection(db, `posts/${postId}/comments`));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setComments(data);
      });

      return unsubscribe;
    };

    fetchComments();
  }, [postId]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userIds = comments.map((comment) => comment.userId);
      const uniqueUserIds = [...new Set(userIds)];

      const userPromises = uniqueUserIds.map((userId) =>
        getDoc(doc(db, "users", userId))
      );

      try {
        const userDocs = await Promise.all(userPromises);

        const usersData = {};
        userDocs.forEach((userDoc) => {
          if (userDoc.exists()) {
            usersData[userDoc.id] = userDoc.data();
          }
        });

        setUsers(usersData);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };

    if (comments.length > 0) {
      fetchUsers();
    }
  }, [comments]);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const timeDiff = now - new Date(timestamp);
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ${days > 1 ? "dias" : "dia"}`;
    if (hours > 0) return `${hours} ${hours > 1 ? "horas" : "hora"}`;
    if (minutes > 0) return `${minutes} ${minutes > 1 ? "minutos" : "minuto"}`;
    return `${seconds} ${seconds > 1 ? "segundos" : "segundo"}`;
  };

  const handleAddComment = async () => {
    if (currentUser && commentText) {
      setLoading(true);
      try {
        const newComment = {
          userId: currentUser.uid,
          text: commentText,
          timestamp: new Date().toISOString(),
        };

        const docRef = await addDoc(
          collection(db, `posts/${postId}/comments`),
          newComment
        );
        queryClient.invalidateQueries(["post", postId]);

        setCommentText("");
        setLoading(false);
      } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        setLoading(false);
      }
    }
  };

  const handleAddReply = async (commentId) => {
    if (currentUser && replyText[commentId]) {
      setLoading(true);
      try {
        const newReply = {
          userId: currentUser.uid,
          text: replyText[commentId],
          timestamp: new Date().toISOString(),
        };

        const commentRef = doc(
          db,
          `posts/${postId}/comments/${commentId}`
        );
        const commentSnapshot = await getDoc(commentRef);
        if (commentSnapshot.exists()) {
          const commentData = commentSnapshot.data();
          const updatedReplies = {
            ...commentData.replies,
            [new Date().toISOString()]: newReply,
          };

          await updateDoc(commentRef, { replies: updatedReplies });
          queryClient.invalidateQueries(["post", postId]);

          setReplyText((prev) => ({
            ...prev,
            [commentId]: ""
          }));
        } else {
          console.error("Comentário não encontrado para responder.");
        }
        setLoading(false);
      } catch (error) {
        console.error("Erro ao adicionar resposta:", error);
        setLoading(false);
      }
    }
  };

  const toggleReply = (commentId) => {
    setShowReply((prev) => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleLikeComment = async (commentId) => {
    if (currentUser) {
      try {
        const commentRef = doc(
          db,
          `posts/${postId}/comments/${commentId}`
        );
        const commentSnapshot = await getDoc(commentRef);

        if (commentSnapshot.exists()) {
          const commentData = commentSnapshot.data();
          const likes = commentData.likes || {};
          const newLikes = {
            ...likes,
            [currentUser.uid]: !likes[currentUser.uid]
          };

          await updateDoc(commentRef, { likes: newLikes });
          queryClient.invalidateQueries(["post", postId]);
        } else {
          console.error("Comentário não encontrado para curtir.");
        }
      } catch (error) {
        console.error("Erro ao curtir comentário:", error);
      }
    }
  };

  const handleDeleteComment = async (commentId, replyKey) => {
    try {
      const commentRef = doc(
        db,
        `posts/${postId}/comments/${commentId}`
      );
      const commentSnapshot = await getDoc(commentRef);

      if (commentSnapshot.exists()) {
        const commentData = commentSnapshot.data();
        if (replyKey) {
          // Se replyKey estiver definido, estamos excluindo uma resposta específica
          const updatedReplies = { ...commentData.replies };
          delete updatedReplies[replyKey];

          await updateDoc(commentRef, { replies: updatedReplies });
        } else {
          // Caso contrário, estamos excluindo o comentário pai
          await deleteDoc(commentRef);
        }
        queryClient.invalidateQueries(["post", postId]);
      } else {
        console.error("Comentário não encontrado para excluir.");
      }
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
    }
  };
  return (
    <motion.div
      id="comment-modal"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="modal-content">
        <div className="header-text">
          <div className="information-text">
            <h1>Comentários</h1>
          </div>
          <div className="close-edit">
            <MdOutlineClose className="close-svg" onClick={onClose} size={32} />
          </div>
        </div>
        <div className="border-bottom"></div>

        <div className="comments-section">
          {comments.map((comment) => {
            const user = users[comment.userId];
            return (
              <div key={comment.id} className="comment">
                {user && (
                  <div className="comment-header">
                    <img src={user.profilePicture} alt={user.name} className="user-photo" />
                    <span>{user.name}</span>
                  </div>
                )}
                <p>{comment.text}</p>
                <div className="several-content">
                  <span>{formatTimestamp(comment.timestamp)}</span>
                  <button className="reply-button" onClick={() => toggleReply(comment.id)}>
                    Responder
                  </button>
                  <button className="like-button" onClick={() => handleLikeComment(comment.id)}>
                    <FaRegHeart />
                  </button>
                  {currentUser && currentUser.uid === comment.userId && (
                    <button className="delete-button" onClick={() => handleDeleteComment(comment.id)}>
                      <FaRegTrashAlt />
                    </button>
                  )}
                </div>
                {showReply[comment.id] && (
                  <div className="reply-section">
                    <textarea
                      value={replyText[comment.id] || ""}
                      onChange={(e) =>
                        setReplyText({ ...replyText, [comment.id]: e.target.value })
                      }
                      placeholder="Responda"
                    />
                    <button onClick={() => handleAddReply(comment.id)} disabled={loading}>
                      <IoIosSend size={23} />
                    </button>
                  </div>
                )}
                {comment.replies &&
                  Object.entries(comment.replies).map(([replyKey, reply]) => {
                    const replyUser = users[reply.userId];
                    return (
                      <div key={replyKey} className="reply">
                        {replyUser && (
                          <div className="reply-header">
                            <img
                              src={replyUser.profilePicture}
                              alt={replyUser.name}
                              className="user-photo"
                            />
                            <span>{replyUser.name}</span>
                          </div>
                        )}
                        <p>{reply.text}</p>
                        <div className="several-content">
                          <span>{formatTimestamp(reply.timestamp)}</span>
                          {currentUser && currentUser.uid === reply.userId && (
                            <button
                              className="delete-button"
                              onClick={() => handleDeleteComment(comment.id, replyKey)}
                            >
                              <FaRegTrashAlt />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>

        <div className="actual-comment">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`Comente`}
          />
          <button onClick={handleAddComment} disabled={loading}>
            <IoIosSend size={23} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentModal;
