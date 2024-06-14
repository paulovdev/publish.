import React from 'react';
import { useQuery } from 'react-query';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../firebase/Firebase';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react';

import "./AllTopics.scss";
import SelectedTopicsPosts from '../SelectedTopicsPosts/SelectedTopicsPosts';

const AllTopics = () => {
    const { data: topics, isLoading } = useQuery('allTopics', async () => {
        const topicsCollection = collection(db, 'topics');
        const topicsSnapshot = await getDocs(topicsCollection);
        return topicsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    });

    return (
        <div id='all-topics'>
            <div className="emphasis-text">
                <h2>Tópicos</h2>
                <p>Explore os tópicos</p>
            </div>
            {isLoading && (<Skeleton width={160} height={40} />)}

            {!isLoading && (
                <Swiper
                    slidesPerView={5}
                    spaceBetween={30}
                    navigation={true}
                    className="all-topics__slides"
                >
                    {topics.map(topic => (
                        <SwiperSlide key={topic.id}>
                            <Link to={`/topics/${topic.id}`} className="topic-info">
                                <p>{topic.name}</p>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}

            <SelectedTopicsPosts />
        </div>
    );
};

export default AllTopics;
