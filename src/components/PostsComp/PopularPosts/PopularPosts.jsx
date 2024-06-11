import React from 'react';
import { useQuery } from 'react-query';
import { doc, getDocs, getDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase/Firebase';

import { SiReadme } from "react-icons/si";
import { FaClock } from "react-icons/fa";

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import { readTime } from "../../../utils/ReadTime";
import Skeleton from 'react-loading-skeleton';

import "./PopularPosts.scss";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PopularPosts = () => {
    const { isLoading, data: posts = [] } = useQuery('popularPosts', async () => {
        const postsQuery = query(collection(db, 'posts'), orderBy('views', 'desc'), limit(3));
        const postsSnapshot = await getDocs(postsQuery);

        const postsData = [];
        for (const postDoc of postsSnapshot.docs) {
            const postData = postDoc.data();

            // Obter usuário
            const userDoc = await getDoc(doc(db, 'users', postData.userId));
            if (!userDoc.exists()) {
                continue;
            }
            const userData = userDoc.data();

            // Obter nome do tópico
            const topicDoc = await getDoc(doc(db, 'topics', postData.topics));
            if (!topicDoc.exists()) {
                continue;
            }
            const topicData = topicDoc.data();

            const postWithUserAndTopic = {
                id: postDoc.id,
                ...postData,
                user: userData,
                topicName: topicData.name
            };

            postsData.push(postWithUserAndTopic);
        }

        return postsData;
    });

    return (
        <motion.div id="popular-posts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            {isLoading && (
                <>
                    <div className="post-container large-post">

                        <div className="post">
                            <div className="post-content">
                                <div className="post-right-content">
                                    <Skeleton width={60} height={15} />
                                    <Skeleton width={160} height={15} />
                                    <h1> <Skeleton width={1200} height={10} /></h1>
                                    <div
                                    > <Skeleton width={1200} height={10} /></div>
                                    <div className="read-topic">
                                        <div className="topic-profile-container">
                                            <div className="profile-content">
                                                <Skeleton width={25} height={25} borderRadius={100} />
                                                <Skeleton width={80} height={10} />
                                                <div className="profile-text-wrapper">
                                                    <p> <Skeleton width={3} height={3} borderRadius={100} /></p>

                                                    <p>
                                                        <Skeleton width={20} height={20} borderRadius={100} />
                                                        <Skeleton width={75} height={10} />
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <span> <Skeleton width={20} height={20} borderRadius={5} />
                                            <Skeleton width={75} height={10} /></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {!isLoading && (
                <Swiper
                    loop={posts.length > 1}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={10}
                    className='popular-posts__slides'
                >
                    {posts.map(post => (
                        <SwiperSlide key={post.id} >
                            <Link to={`/view-post/${post.id}`} className="post-container large-post">
                                <div className="post">
                                    <div className="img-post">
                                        {post.imageUrl && <img src={post.imageUrl} loading="lazy" width={100} alt="Post" className="post-image" />}
                                    </div>
                                    <div className="post-content">
                                        <div className="post-right-content">
                                            <span className="topic">{post.topicName}</span>
                                            <h1>{post.title}</h1>
                                            <div
                                                className="body-posts"
                                                dangerouslySetInnerHTML={{
                                                    __html: post.desc,
                                                }}
                                            ></div>
                                            <div className="read-topic">
                                                <div className="topic-profile-container">
                                                    <div className="profile-content">
                                                        {post.user && post.user.profilePicture && (
                                                            <img src={post.user.profilePicture} width={100} loading="lazy" alt="User" className="user-photo" />
                                                        )}
                                                        <div className="profile-text-wrapper">
                                                            <p>{post.user && post.user.name && post.user.name.split(" ")[0]}</p>
                                                            <span>•</span>
                                                            <p>
                                                                <FaClock />
                                                                {post.created}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span>< SiReadme /> {readTime({ __html: post.desc })} min de leitura</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </motion.div>
    );
};

export default PopularPosts;
