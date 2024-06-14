import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/Firebase'; // Adjust the import according to your Firebase setup
import "./HomeBar.scss";
import { Blog } from '../../../context/Context';

const HomeBar = () => {
    const [underlineStyle, setUnderlineStyle] = useState({ width: 0, transform: 'translateX(0)' });
    const { currentUser } = Blog()

    const { data: userSelectedTopics, isLoading: isLoadingUserTopics } = useQuery('userSelectedTopics', async () => {
        const userDoc = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userDoc);
        return userSnapshot.data().selectedTopics;
    });

    const { data: topics, isLoading: isLoadingTopics } = useQuery(['allTopics', userSelectedTopics], async () => {
        if (!userSelectedTopics) return [];
        const topicsCollection = collection(db, 'topics');
        const topicsSnapshot = await getDocs(topicsCollection);
        return topicsSnapshot.docs
            .filter(doc => userSelectedTopics.includes(doc.id))
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
    }, {
        enabled: !!userSelectedTopics, // Enable this query only when userSelectedTopics is available
    });

    return (
        <div className="home-nav">

            <NavLink to="feed/all-posts" activeClassName="active">Todos</NavLink>
            <NavLink to="feed/following" activeClassName="active">Seguindo</NavLink>

            {topics && topics.map(topic => (
                <NavLink key={topic.id} to={`feed/topic/${topic.id}`} activeClassName="active">
                    {topic.name}
                </NavLink>
            ))}
            <div className="underline" style={underlineStyle}></div>
            <div className="line"></div>
        </div>
    );
};

export default HomeBar;
