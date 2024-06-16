import React, { useState } from 'react';
import { db } from '../../../firebase/Firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { MdOutlineClose } from "react-icons/md";
import { motion } from 'framer-motion';
import { IoIosSend } from "react-icons/io";
import { useQueryClient } from 'react-query';
import './CommentModal.scss';

const CommentModal = ({ postId, comments, currentUser, onClose }) => {
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleAddComment = async () => {
        if (currentUser && commentText) {
            setLoading(true);
            try {
                const newComment = {
                    userId: currentUser.uid,
                    text: commentText,
                    timestamp: new Date().toLocaleString()
                };
                const commentId = `comment_${new Date().getTime()}`;
                await updateDoc(doc(db, 'posts', postId), {
                    [`comments.${commentId}`]: newComment
                });
                queryClient.invalidateQueries(['post', postId]);
                setCommentText('');
                onClose();
            } catch (error) {
                console.error('Error adding comment:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <motion.div id="comment-modal"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
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
                    {Object.values(comments || {}).map((comment, index) => (
                        <div key={index} className="comment">
                            <p>{comment.text}</p>
                        </div>
                    ))}
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
