import React, { useState } from 'react';
import { db } from '../../firebase/Firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Blog } from '../../context/Context';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query'; // Importe o useQuery do React Query

import "./GetStartedTopics.scss"

const GetStartedTopics = () => {
  const { currentUser } = Blog();
  const [selectedTopics, setSelectedTopics] = useState([]);
  const navigate = useNavigate();

  const { data: topics, isLoading, isError } = useQuery('topics', async () => {
    const topicsCollection = collection(db, 'topics');
    const topicsSnapshot = await getDocs(topicsCollection);
    return topicsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
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

  if (isLoading) return <p>Carregando...</p>; // Adicione um indicador de carregamento enquanto os dados estão sendo buscados
  if (isError) return <p>Ocorreu um erro ao buscar os tópicos.</p>; // Adicione uma mensagem de erro se houver algum erro durante a busca

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
