import React from "react";
import { useQuery } from "react-query";
import { doc, getDocs, collection, query, orderBy, limit, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/Firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { MdDateRange } from "react-icons/md";
import { FaClock } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "./PopularPosts.scss";
import { Link } from "react-router-dom";
import { readTime } from "../../../utils/ReadTime";

const fetchPopularPosts = async () => {
  const postsQuery = query(
    collection(db, "posts"),
    orderBy("views", "desc"),
    limit(5)
  );

  const postsSnapshot = await getDocs(postsQuery);
  const postsData = postsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  const userIds = postsData.map((post) => post.userId);
  const topicIds = postsData.map((post) => post.topics);

  const userDocsPromises = userIds.map((userId) =>
    getDoc(doc(db, "users", userId))
  );
  const topicDocsPromises = topicIds.map((topicId) =>
    getDoc(doc(db, "topics", topicId))
  );

  const [userDocs, topicDocs] = await Promise.all([
    Promise.all(userDocsPromises),
    Promise.all(topicDocsPromises)
  ]);

  const userMap = {};
  userDocs.forEach((userDoc) => {
    if (userDoc.exists()) {
      userMap[userDoc.id] = userDoc.data();
    }
  });

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
};

const PopularPosts = () => {
  const { isLoading, data: posts = [] } = useQuery("popularPosts", fetchPopularPosts, {
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <motion.div id="popular-posts">
        <div className="post-container">

          <div className="post-left-content">
            <Skeleton width={750} height={400} borderRadius={5} />
          </div>
          <div className="post-right-content">

            <span>
              <Skeleton width={75} height={20} borderRadius={20} />
            </span>

            <h1>  <Skeleton width={350} height={30} />  <Skeleton width={350} height={30} /></h1>
            <p>  <Skeleton width={150} height={10} /></p>
            <div className="several-content">
              <div className="profile-content">
                <Skeleton width={24} height={24} borderRadius={100} />
                <Skeleton width={75} height={10} />
              </div>
              <span>
                <Skeleton width={80} height={10} />
              </span>
              <span>
                <Skeleton width={80} height={10} />
              </span>
            </div>
          </div>


        </div>
      </motion.div>
    );
  }

  return (
    <motion.div id="popular-posts">
      <Swiper
        loop={posts.length > 1}
        autoplay={{
          delay: 10000,
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
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="post-right-content">
                  <div className="topic">
                    <span>
                      <MdCategory size={14} />
                      {post.topicName}
                    </span>
                  </div>
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
                      {post.user && post.user.name && <p>{post.user.name}</p>}
                    </div>
                    <span>
                      <FaClock size={12} />
                      {readTime({ __html: post.desc })} min de leitura
                    </span>
                    <span>
                      <MdDateRange size={14} />
                      {post.created}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};

export default PopularPosts;
