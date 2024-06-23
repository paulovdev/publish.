import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/Firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { MdOutlineClose } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { FaSave } from "react-icons/fa";
import Editor from "../../../utils/Editor/Editor";
import "./EditPostModal.scss";
import { useQuery } from "react-query";

const EditPostModal = ({ postId, onClick }) => {
  const [title, setTitle] = useState(postId.title || "");
  const [subTitle, setSubTitle] = useState(postId.subTitle || "");
  const [desc, setDesc] = useState(postId.desc || "");
  const [selectedTopic, setSelectedTopic] = useState(postId.topic || "");
  const [loading, setLoading] = useState(false);

  const { data: topics } = useQuery("topics", async () => {
    const topicsCollection = collection(db, "topics");
    const topicsSnapshot = await getDocs(topicsCollection);
    return topicsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });

  useEffect(() => {
    if (postId.topic) {
      setSelectedTopic(postId.topic);
    }
  }, [postId.topic]);

  const handleSelectChange = (e) => {
    const selectedOption = e.target.value;
    setSelectedTopic(selectedOption);
  };

  const updatePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData = {
        ...(title && { title }),
        ...(subTitle && { subTitle }),
        ...(desc && { desc }),
        ...(selectedTopic && { topic: selectedTopic }),
      };
      await updateDoc(doc(db, "posts", postId.id), updatedData);
      onClick();
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearInput = (input) => {
    switch (input) {
      case "title":
        setTitle("");
        break;
      case "subTitle":
        setSubTitle("");
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      id="edit-post-modal"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="close-edit" onClick={onClick}>
        <MdOutlineClose size={32} />
      </div>

      <div className="edit-post-modal-content">
        <div className="head-text">
          <h1>Edite as informações da sua publicação</h1>
        </div>

        <form onSubmit={updatePost} className="edit-post-form">
          <div className="grid-1">
            <div className="input-container text-input">
              <input
                type="text"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label>Título</label>
              {title && (
                <span onClick={() => clearInput("title")}>
                  <IoCloseOutline size={24} />
                </span>
              )}
            </div>

            <div className="step-topic">
              <label>Tópico</label>
              <select value={selectedTopic} onChange={handleSelectChange}>
                {topics &&
                  topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="input-container text-input editor-container">
            <input
              type="text"
              placeholder="Sub título"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
            />
            <label>Sub título</label>
            {subTitle && (
              <span onClick={() => clearInput("subTitle")}>
                <IoCloseOutline size={24} />
              </span>
            )}
          </div>

          <label>Edite o conteúdo do seu post:</label>
          <Editor placeholder="Texto" value={desc} onChange={setDesc} />

          <button
            type="submit"
            className="btn"
            title="Salvar"
            disabled={loading}
          >
            <div className="icon-content">
              <FaSave size={26} />
            </div>
            <p>{loading ? "Salvando..." : "Salvar"}</p>
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default EditPostModal;
