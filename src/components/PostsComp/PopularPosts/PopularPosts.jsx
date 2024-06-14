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
        const postsQuery = query(collection(db, 'posts'), orderBy('views', 'desc'), limit(5));
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
                    <div className="popular-posts__slides">
                        <Link className="post-container">

                            <div className="post-left-content">

                                <Skeleton width={50} height={15} />
                               
                            </div>
                            <div className="post-right-content">

                                <h1><Skeleton width={685} height={10} /></h1>
                                <div
                                ><Skeleton width={685} height={10} /></div>

                                <div className="profile-content">
                                    <div className="left-profile-text">
                                        <Skeleton width={30} height={30} borderRadius={`100%`} />
                                    </div>
                                    <div className="right-profile-text">
                                        <Skeleton width={75} height={10} />
                                        <Skeleton width={50} height={8} />
                                    </div>
                                </div>
                            </div>

                        </Link>
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
                            <Link to={`/view-post/${post.id}`} className="post-container">

                                <div className="post-left-content">
                                    <span className="topic">{post.topicName}</span>
                                    {post.imageUrl && <img src={post.imageUrl} alt="Post" className="post-image" loading="lazy" />}
                                </div>
                                <div className="post-right-content">

                                    <h1>{post.title}</h1>
                                    <div
                                        className="body-posts body-popular"
                                        dangerouslySetInnerHTML={{
                                            __html: post.desc
                                        }}
                                    ></div>

                                    <div className="profile-content">
                                        <div className="left-profile-text">
                                            {post.user && post.user.profilePicture && (
                                                <img src={post.user.profilePicture} loading="lazy" alt="User" className="user-photo" />
                                            )}
                                        </div>
                                        <div className="right-profile-text">
                                            {post.user && post.user.name && <p>{post.user.name}</p>}
                                            <span>{readTime({ __html: post.desc })} min de leitura</span>
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
