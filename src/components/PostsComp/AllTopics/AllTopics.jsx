import React, { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { collection, query, limit, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/Firebase';
import Skeleton from 'react-loading-skeleton';
import { Blog } from '../../../context/Context';
import { motion } from 'framer-motion';

import "./AllTopics.scss";
import SelectedTopicsPosts from '../SelectedTopicsPosts/SelectedTopicsPosts';
import { Link, useNavigate } from "react-router-dom";

const AllTopics = () => {
    const { currentUser } = Blog();
    const queryClient = useQueryClient();
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const topicsCollection = collection(db, 'topics');
        const topicsQuery = query(topicsCollection, limit(15));
        const unsubscribe = onSnapshot(topicsQuery, (snapshot) => {
            const topicsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTopics(topicsData);
            setIsLoading(false);
            queryClient.setQueryData('allTopics', topicsData);
        });

        return () => unsubscribe();
    }, [queryClient]);

    const handleTopicClick = async (topicId) => {
        if (!currentUser) return;

        const userDoc = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userDoc);
        const userData = userSnapshot.data();
        const userSelectedTopics = userData.selectedTopics || [];

        if (!userSelectedTopics.includes(topicId)) {
            await updateDoc(userDoc, {
                selectedTopics: [...userSelectedTopics, topicId],
            });
            scrollTo({ "top": 0, behavior: "smooth" })
            navigate(`/feed/topic/${topicId}`)
        }

    };

    return (
        <div id='all-topics' >
            <h1>Tópicos</h1>
            {isLoading && (<Skeleton width={160} height={40} />)}

            {!isLoading && (
                <>
                    <div className="topic-info-container">
                        {topics.map(topic => (
                            <motion.p
                                key={topic.id}
                                className="topic-info"
                                onClick={() => handleTopicClick(topic.id)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, ease: 'easeInOut' }}
                            >
                                {topic.name}
                            </motion.p>
                        ))}
                        <Link to={"/get-started/topics"}>Ver todos os tópicos</Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default AllTopics;
