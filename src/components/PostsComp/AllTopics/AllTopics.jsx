import React from "react";
import { useQuery } from "react-query";
import {
  collection,
  query,
  limit,
  doc,
  getDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase/Firebase";
import Skeleton from "react-loading-skeleton";
import { Blog } from "../../../context/Context";
import { Link, useNavigate } from "react-router-dom";

import "./AllTopics.scss";
const fetchTopics = async () => {
  const topicsCollection = collection(db, "topics");
  const topicsQuery = query(topicsCollection, limit(15));
  const snapshot = await getDocs(topicsQuery);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const AllTopics = () => {
  const { currentUser } = Blog();
  const navigate = useNavigate();

  const { data: topics = [], isLoading } = useQuery("allTopics", fetchTopics, {

  });

  const handleTopicClick = async (topicId) => {
    if (!currentUser) return;

    const userDoc = doc(db, "users", currentUser.uid);
    const userSnapshot = await getDoc(userDoc);
    const userData = userSnapshot.data();
    const userSelectedTopics = userData.selectedTopics || [];

    if (!userSelectedTopics.includes(topicId)) {
      await updateDoc(userDoc, {
        selectedTopics: [...userSelectedTopics, topicId],
      });

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate(`/feed/topic/${topicId}`);
    }
  };

  return (
    <div id="all-topics">
      <h1>Tópicos</h1>
      {isLoading && <Skeleton width={160} height={40} />}

      {!isLoading && (
        <>
          <div className="topic-info-container">
            {topics.map((topic) => (
              <p
                key={topic.id}
                className="topic-info"
                onClick={() => handleTopicClick(topic.id)}
              >
                {topic.name}
              </p>
            ))}
            <Link to={"/get-started/topics"}>Ver todos os tópicos</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default AllTopics;
