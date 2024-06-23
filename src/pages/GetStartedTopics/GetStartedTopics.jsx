import React, { useState } from "react";
import { db } from "../../firebase/Firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Blog } from "../../context/Context";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";

import "./GetStartedTopics.scss";

const GetStartedTopics = () => {
  const { currentUser } = Blog();
  const [selectedTopics, setSelectedTopics] = useState([]);
  const navigate = useNavigate();

  const {
    data: topics,
    isLoading: isLoadingTopics,
    isError: isErrorTopics,
  } = useQuery("topics", async () => {
    const topicsCollection = collection(db, "topics");
    const topicsSnapshot = await getDocs(topicsCollection);
    return topicsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });

  const { isLoading: isLoadingUser, isError: isErrorUser } = useQuery(
    "userSelectedTopics",
    async () => {
      const userDoc = doc(db, "users", currentUser.uid);
      const userSnapshot = await getDoc(userDoc);
      const userData = userSnapshot.data();
      setSelectedTopics(userData.selectedTopics || []);
    },
    {
      enabled: !!currentUser,
    }
  );

  const handleTopicSelect = (topicId) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSaveTopics = async () => {
    if (!currentUser) return;

    const userDoc = doc(db, "users", currentUser.uid);
    await updateDoc(userDoc, {
      selectedTopics,
    });
    navigate("/feed/all-posts");
  };

  if (isLoadingTopics || isLoadingUser) return;
  if (isErrorTopics || isErrorUser)
    return <p>Ocorreu um erro ao buscar os tópicos.</p>;

  return (
    <section id="get-started">

      <div className="edit-started-modal-content">

        <div className="head-text">
          <h1>Selecione seus tópicos de interesse</h1>
        </div>
        <div className="select-topics-container">
          <ul>
            {topics.map((topic) => (
              <li key={topic.id}>
                <input
                  type="checkbox"
                  id={topic.id}
                  checked={selectedTopics.includes(topic.id)}
                  onChange={() => handleTopicSelect(topic.id)}
                />
                <label htmlFor={topic.id}>{topic.name}</label>
              </li>
            ))}
          </ul>
          <span>Você pode escolher novamente em Configurações {">"} Selecionar Topicos</span>

          <button onClick={handleSaveTopics}>Salvar e fechar</button>

        </div>
      </div>

    </section >
  );
};

export default GetStartedTopics;
