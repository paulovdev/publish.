import React, { useEffect, useRef } from "react";
import { useInfiniteQuery } from "react-query";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../../firebase/Firebase";
import { Link } from "react-router-dom";
import { readTime } from "../../../utils/ReadTime";

import { FaPlus } from "react-icons/fa6";
import { MdDateRange } from "react-icons/md";
import { FaClock } from "react-icons/fa";
import { MdCategory } from "react-icons/md";

import Skeleton from "react-loading-skeleton";
import "./AllPosts.scss";

const AllPosts = () => {
  const fetchPosts = async ({ pageParam = null }) => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("created", "desc"),
        limit(5),
        ...(pageParam ? [startAfter(pageParam)] : [])
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

      // Fetch all user documents in a batch
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

      // Fetch all topic documents in a batch
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

      // Combine post data with user and topic data
      const combinedData = postsData.map((post) => ({
        ...post,
        user: userMap[post.userId] || null,
        topicName: topicMap[post.topics]?.name || null,
      }));

      const lastDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];

      return { postsData: combinedData, lastDoc };
    } catch (error) {
      console.log(error);
    }
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(["allPosts"], fetchPosts, {
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.lastDoc;
    },
  });

  const lastPostElementRef = useRef();

  useEffect(() => {
    if (lastPostElementRef.current && isFetchingNextPage) {
      lastPostElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isFetchingNextPage]);

  return (
    <>
      <div id="all-posts">
        {isLoading && (
          <>
            <Link>
              <div className="post-container">
                <div className="post-left-content">
                  <Skeleton width={225} height={150} />
                </div>
                <div className="post-right-content">
                  <div className="profile-content">
                    <Skeleton width={24} height={24} borderRadius={100} />
                    <Skeleton width={50} height={7} />
                  </div>
                  <h1>
                    <Skeleton width={300} height={15} />
                  </h1>
                  <div>
                    <Skeleton width={500} height={10} />
                  </div>
                  <div className="several-content">
                    <Skeleton width={25} height={10} />
                    <Skeleton width={25} height={10} />
                    <Skeleton width={25} height={10} />
                  </div>
                </div>
              </div>
              <div className="border-bottom"></div>
            </Link>
          </>
        )}

        {!isLoading && !isError && data.pages.length > 0
          ? data.pages.map((page, i) => (
            <React.Fragment key={i}>
              {page.postsData.map((post, j) => (
                <Link
                  to={`/view-post/${post.id}`}
                  onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
                  key={j}
                >
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
                          {" "}
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
                  <div className="border-bottom"></div>
                </Link>
              ))}
            </React.Fragment>
          ))
          : !isLoading && <p>Sem posts disponíveis</p>}

        {isFetchingNextPage && (
          <div className="loading-container">
            <div className="loading"></div>
          </div>
        )}
        <div ref={lastPostElementRef}></div>
        {!isFetchingNextPage && hasNextPage && (
          <div className="loading-container">
            <button onClick={() => fetchNextPage()}>
              <FaPlus />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AllPosts;