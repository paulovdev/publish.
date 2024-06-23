import React from "react";
import { useQuery } from "react-query";
import {
  doc,
  getDocs,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../../firebase/Firebase";

import { MdDateRange } from "react-icons/md";
import { FaClock } from "react-icons/fa";
import { MdCategory } from "react-icons/md";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import { readTime } from "../../../utils/ReadTime";
import Skeleton from "react-loading-skeleton";

import "./PopularPosts.scss";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PopularPosts = () => {

  const { isLoading, data: posts = [] } = useQuery("popularPosts", async () => {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("views", "desc"),
      limit(5)
    );
    const postsSnapshot = await getDocs(postsQuery);

    const postsData = [];
    const userIds = [];
    const topicIds = [];

    postsSnapshot.forEach((postDoc) => {
      const postData = postDoc.data();
      userIds.push(postData.userId);
      topicIds.push(postData.topics);
      postsData.push({
        id: postDoc.id,
        ...postData,
      });
    });

    const uniqueUserIds = [...new Set(userIds)];
    const userDocsPromises = uniqueUserIds.map((userId) =>
      getDoc(doc(db, "users", userId))
    );
    const userDocs = await Promise.all(userDocsPromises);
    const userMap = {};
    userDocs.forEach((userDoc) => {
      if (userDoc.exists()) {
        userMap[userDoc.id] = userDoc.data();
      }
    });

    const uniqueTopicIds = [...new Set(topicIds)];
    const topicDocsPromises = uniqueTopicIds.map((topicId) =>
      getDoc(doc(db, "topics", topicId))
    );
    const topicDocs = await Promise.all(topicDocsPromises);
    const topicMap = {};
    topicDocs.forEach((topicDoc) => {
      if (topicDoc.exists()) {
        topicMap[topicDoc.id] = topicDoc.data();
      }
    });

    const combinedData = postsData.map((post) => ({
      ...post,
      user: userMap[post.userId] || null,
      topicName: topicMap[post.topics]?.name || null,
    }));

    return combinedData;
  });

  return (
    <motion.div
      id="popular-posts"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isLoading &&
        <Link>
          <div className="post-container">
            <div className="post-left-content">
              <Skeleton width={750} height={400} />
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
      }
      {!isLoading && (
        <Swiper
          loop={posts.length > 1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          modules={[Autoplay, Pagination, Navigation]}
          slidesPerView={1}
          spaceBetween={50}
          className="popular-posts__slides"
        >
          {posts.map((post) => (
            <SwiperSlide key={post.id}>
              <Link to={`/view-post/${post.id}`}>
                <div className="post-container">
                  <div className="post-left-content">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="post-image"
                      />
                    )}
                  </div>
                  <div className="post-right-content">
                    <div className="topic">
                      <span>
                        {" "}
                        <MdCategory size={14} />
                        {post.topicName}
                      </span></div>


                    <h1>{post.title}</h1>
                    <p>{post.subTitle}</p>
                    <div className="several-content">
                      <div className="profile-content">
                        {post.user && post.user.profilePicture && (
                          <img
                            src={post.user.profilePicture}
                            loading="lazy"
                            alt="User"
                            className="user-photo"
                          />
                        )}
                        {post.user && post.user.name && (
                          <p>{post.user.name}</p>
                        )}
                      </div>
                      <span>
                        {" "}
                        <FaClock size={12} />
                        {readTime({ __html: post.desc })} min de leitura
                      </span>
                      <span>
                        <MdDateRange size={14} />{post.created}
                      </span>
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
