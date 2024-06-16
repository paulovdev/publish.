import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { collection, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/Firebase';
import "./HomeBar.scss";
import { Blog } from '../../../context/Context';
import Skeleton from 'react-loading-skeleton';

const HomeBar = () => {
    const { currentUser } = Blog();
    const queryClient = useQueryClient();
    const [userSelectedTopics, setUserSelectedTopics] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        const userDoc = doc(db, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userDoc, (snapshot) => {
            const userData = snapshot.data();
            const selectedTopics = userData?.selectedTopics || [];
            setUserSelectedTopics(selectedTopics);

            // Invalidate and refetch topics when user selected topics change
            queryClient.invalidateQueries(['allTopics', selectedTopics]);
        });

        return () => unsubscribe();
    }, [currentUser, queryClient]);

    const { data: topics = [], isLoading: isLoadingTopics } = useQuery(['allTopics', userSelectedTopics], async () => {
        if (!userSelectedTopics.length) return [];

        const topicPromises = userSelectedTopics.map(topicId => getDoc(doc(db, 'topics', topicId)));
        const topicDocs = await Promise.all(topicPromises);

        const filteredTopics = topicDocs
            .filter(doc => doc.exists())
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

        return filteredTopics;
    }, {
        enabled: !!userSelectedTopics.length,
    });

    const memoizedTopics = useMemo(() => topics, [topics]);

    return (
        <div className="home-nav">
            <NavLink to="all-posts"><p>Todos</p></NavLink>
            <NavLink to="following"><p>Seguindo</p></NavLink>

            {isLoadingTopics && (
                Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} width={100} height={10} />
                ))
            )}

            {!isLoadingTopics && memoizedTopics.length > 0 && (
                memoizedTopics.map(topic => (
                    <NavLink key={topic.id} to={`topic/${topic.id}`}>
                        <p>{topic.name}</p>
                    </NavLink>
                ))
            )}
        </div>
    );
};

export default HomeBar;
