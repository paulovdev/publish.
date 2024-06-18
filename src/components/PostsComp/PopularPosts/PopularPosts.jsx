import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { doc, getDocs, getDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase/Firebase';

import { IoReader } from "react-icons/io5";
import { FaClock } from "react-icons/fa";
import { MdCategory } from "react-icons/md";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import { readTime } from "../../../utils/ReadTime";
import Skeleton from 'react-loading-skeleton';

import "./PopularPosts.scss";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PopularPosts = () => {
    const [slidesPerView, setSlidesPerView] = useState(window.innerWidth < 1000 ? 1 : 2);

    const { isLoading, data: posts = [] } = useQuery('popularPosts', async () => {
        const postsQuery = query(collection(db, 'posts'), orderBy('views', 'desc'), limit(5));
        const postsSnapshot = await getDocs(postsQuery);

        const postsData = [];
        const userIds = [];
        const topicIds = [];

        postsSnapshot.forEach(postDoc => {
            const postData = postDoc.data();
            userIds.push(postData.userId);
            topicIds.push(postData.topics);
            postsData.push({
                id: postDoc.id,
                ...postData
            });
        });

        const uniqueUserIds = [...new Set(userIds)];
        const userDocsPromises = uniqueUserIds.map(userId => getDoc(doc(db, 'users', userId)));
        const userDocs = await Promise.all(userDocsPromises);
        const userMap = {};
        userDocs.forEach(userDoc => {
            if (userDoc.exists()) {
                userMap[userDoc.id] = userDoc.data();
            }
        });

        const uniqueTopicIds = [...new Set(topicIds)];
        const topicDocsPromises = uniqueTopicIds.map(topicId => getDoc(doc(db, 'topics', topicId)));
        const topicDocs = await Promise.all(topicDocsPromises);
        const topicMap = {};
        topicDocs.forEach(topicDoc => {
            if (topicDoc.exists()) {
                topicMap[topicDoc.id] = topicDoc.data();
            }
        });

        const combinedData = postsData.map(post => ({
            ...post,
            user: userMap[post.userId] || null,
            topicName: topicMap[post.topics]?.name || null
        }));

        return combinedData;
    });

    useEffect(() => {
        const handleResize = () => {
            setSlidesPerView(window.innerWidth < 1000 ? 1 : 2);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <motion.div id="popular-posts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            {isLoading && (
                Array.from({ length: 2 }).map((_, index) => (
                    <Link key={index}>
                        <div className="post-container">
                            <div className="post-left-content">
                                <Skeleton width={580} height={250} />
                            </div>
                            <div className="post-right-content">
                                <div className="profile-content">
                                    <Skeleton width={30} height={30} borderRadius={100} />
                                    <Skeleton width={100} height={10} />
                                </div>
                                <Skeleton width={400} height={10} />
                                <div className="body-popular">
                                    <Skeleton width={400} height={10} />
                                </div>

                                <div className="several-content">
                                    <Skeleton width={100} height={10} />
                                    <Skeleton width={100} height={10} />
                                    <Skeleton width={100} height={10} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))
            )}
            {!isLoading && (
                <Swiper
                    loop={posts.length > 1}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    modules={[Autoplay, Pagination, Navigation]}
                    slidesPerView={slidesPerView}
                    spaceBetween={50}

                    className='popular-posts__slides'
                >
                    {posts.map(post => (
                        <SwiperSlide key={post.id}>
                            <Link to={`/view-post/${post.id}`}>
                                <div className="post-container">
                                    <div className="post-left-content">
                                        {post.imageUrl && <img src={post.imageUrl} alt="Post" className="post-image" />}
                                    </div>
                                    <div className="post-right-content">
                                        <div className="profile-content">
                                            {post.user && post.user.profilePicture && (
                                                <img src={post.user.profilePicture} alt="User" className="user-photo" />
                                            )}
                                            {post.user && post.user.name && <p>{post.user.name}</p>}
                                        </div>
                                        <h1>{post.title}</h1>
                                        <div
                                            className="body-popular"
                                            dangerouslySetInnerHTML={{
                                                __html: post.desc.slice(0, 200)
                                            }}
                                        ></div>

                                        <div className="several-content">
                                            <span> <MdCategory size={14} />{post.topicName}</span>
                                            <span> <IoReader size={14} />{readTime({ __html: post.desc })} min de leitura</span>
                                            <span><FaClock size={12} />  {post.created}</span>
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
