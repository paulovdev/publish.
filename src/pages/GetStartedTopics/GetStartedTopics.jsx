import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/Firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Blog } from '../../context/Context';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';

import "./GetStartedTopics.scss"

const GetStartedTopics = () => {
  const { currentUser } = Blog();
  const [selectedTopics, setSelectedTopics] = useState([]);
  const navigate = useNavigate();

  // Fetch topics from Firestore
  const { data: topics, isLoading: isLoadingTopics, isError: isErrorTopics } = useQuery('topics', async () => {
    const topicsCollection = collection(db, 'topics');
    const topicsSnapshot = await getDocs(topicsCollection);
    return topicsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  });

  // Fetch user selected topics from Firestore
  const { isLoading: isLoadingUser, isError: isErrorUser } = useQuery('userSelectedTopics', async () => {
    const userDoc = doc(db, 'users', currentUser.uid);
    const userSnapshot = await getDoc(userDoc);
    const userData = userSnapshot.data();
    setSelectedTopics(userData.selectedTopics || []);
  }, {
    enabled: !!currentUser,
  });

  const handleTopicSelect = (topicId) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSaveTopics = async () => {
    if (!currentUser) return;

    const userDoc = doc(db, 'users', currentUser.uid);
    await updateDoc(userDoc, {
      selectedTopics,
    });
    navigate("/feed/all-posts")
  };

  if (isLoadingTopics || isLoadingUser) return <p>Carregando...</p>;
  if (isErrorTopics || isErrorUser) return <p>Ocorreu um erro ao buscar os tópicos.</p>;

  return (
    <section id='get-started'>
      <h1>Selecione seus tópicos de interesse</h1>
      <div className="border-bottom"></div>
      <div className="selected-topics">
        <h1>Tópicos escolhidos: <span>{selectedTopics.map(id => topics.find(topic => topic.id === id)?.name).join(', ')}</span></h1>
      </div>

      <ul>
        {topics.map(topic => (
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

      <button onClick={handleSaveTopics}>SALVAR TÓPICOS</button>

      <span>Você pode escolher novamente em "Configurações"</span>
    </section>
  );
};

export default GetStartedTopics;
