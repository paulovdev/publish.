import React, { useState } from 'react';
import { db } from '../../../firebase/Firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { MdOutlineClose } from "react-icons/md";
import { motion } from 'framer-motion';
import { FaSave } from "react-icons/fa";
import Editor from '../../../utils/Editor/Editor';
import './EditPostModal.scss';
import { useQuery } from 'react-query';

const EditPostModal = ({ postId, onClick }) => {
    const [title, setTitle] = useState(postId.title);
    const [desc, setDesc] = useState(postId.desc);
    const [selectedTopics, setSelectedTopics] = useState(postId.topic); // Inicializa com postId.topic
    const [loading, setLoading] = useState(false);

    const { data: topics } = useQuery('topics', async () => {
        const topicsCollection = collection(db, 'topics');
        const topicsSnapshot = await getDocs(topicsCollection);
        return topicsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    });

    const handleSelectChange = (e) => {
        const selectedOption = e.target.value;
        setSelectedTopics(selectedOption);
    };

    const updatePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateDoc(doc(db, 'posts', postId.id), {
                title,
                desc,
                topics: selectedTopics
            });
            onClick();
        } catch (error) {
            console.error('Error updating post:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div id="edit-post-modal"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            <div className="modal-content">
                <div className="header-text">
                    <div className="profile-information-text">
                        <h1>Editar {title}</h1>
                    </div>

                    <div className="close-edit">
                        <MdOutlineClose className="close-svg" onClick={onClick} size={32} />
                    </div>
                </div>

                <div className="border-bottom"></div>

                <form onSubmit={updatePost}>
                    <div className="input-wrapper-container">
                        <div className="input-wrapper">
                            <label>Título:</label>
                            <input
                                type="text"
                                placeholder="Título"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="input-wrapper">
                            <label>Tópico:</label>
                            <select value={selectedTopics} onChange={handleSelectChange}>
                                {topics && topics.map(topic => (
                                    <option key={topic.id} value={topic.id}>
                                        {topic.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <label>Edite o conteúdo do seu post:</label>
                    <Editor
                        placeholder="Texto"
                        value={desc}
                        onChange={setDesc}
                    />
                    <button
                        type="submit"
                        className="btn"
                        title="Salvar"
                        disabled={loading}
                    >
                        <div className="icon-content">
                            <FaSave size={26} />
                        </div>
                        <p>{loading ? 'Salvando...' : 'Salvar'}</p>
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default EditPostModal;
