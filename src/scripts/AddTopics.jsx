import React, { useState } from 'react';
import { db } from '../firebase/Firebase';
import { collection, addDoc } from 'firebase/firestore';
import './AddTopics.scss';

const AddTopics = () => {
  const [topicInput, setTopicInput] = useState('');

  const handleAddTopic = async (e) => {
    e.preventDefault();
    const topics = topicInput.split(',').map((topic) => topic.trim());
    const topicPromises = [];
    topics.forEach((topic) => {
      if (topic !== '') {
        const topicPromise = addDoc(collection(db, 'topics'), {
          name: topic,
        });
        topicPromises.push(topicPromise);
      }
    });

    try {
      await Promise.all(topicPromises);
      setTopicInput('');
      alert('Topics added successfully!');
    } catch (error) {
      console.error('Error adding topics: ', error);
      alert('Failed to add topics.');
    }
  };

  return (
    <section id="add-topics">
      <h1>Adicionar tópicos</h1>
      <div className="border-bottom"></div>
      <form onSubmit={handleAddTopic}>
        <input
          type="text"
          placeholder="Nomes de tópicos (separados por vírgula)"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
        />
        <button type="submit">Add Topics</button>
      </form>
    </section>
  );
};

export default AddTopics;
