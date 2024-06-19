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
import { db } from "../../firebase/Firebase";
import { Link, useLocation } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { FaClock } from "react-icons/fa";
import { IoReader } from "react-icons/io5";
import { MdCategory } from "react-icons/md";
import Skeleton from "react-loading-skeleton";
import { readTime } from "../../utils/ReadTime";
import "./SearchPage.scss";

const SearchPage = () => {
  const location = useLocation();
  const search = new URLSearchParams(location.search).get("q");

  const fetchPosts = async ({ pageParam = null }) => {
    try {
      const postsCollection = collection(db, "posts");
      const postsQuery = query(
        postsCollection,
        orderBy("created", "desc"),
        limit(5),
        ...(pageParam ? [startAfter(pageParam)] : [])
      );

      const postsSnapshot = await getDocs(postsQuery);

      const postsData = [];
      const userIds = [];

      postsSnapshot.forEach((postDoc) => {
        const postData = postDoc.data();
        userIds.push(postData.userId);

        if (
          !search ||
          postData.title.toLowerCase().includes(search.toLowerCase())
        ) {
          postsData.push({
            id: postDoc.id,
            ...postData,
          });
        }
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

      const combinedData = postsData.map((post) => ({
        ...post,
        user: userMap[post.userId] || null,
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
  } = useInfiniteQuery(["searchPosts", search], fetchPosts, {
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
    <section id="search">
      <Link to="/" className="back">
        Inicio / {search}
      </Link>
      <h1>Resultados da pesquisa para "{search}":</h1>
      <div className="border-bottom"></div>

      <div id="search-posts">
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
                  <Link to={`/view-post/${post.id}`} key={j}>
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
                        <h1>{post.title}</h1>
                        <div
                          className="body-posts"
                          dangerouslySetInnerHTML={{
                            __html: post.desc.slice(0, 200),
                          }}
                        ></div>
                        <div className="several-content">
                          <span>
                            {" "}
                            <MdCategory size={14} />
                            {post.topicName}
                          </span>
                          <span>
                            {" "}
                            <IoReader size={14} />
                            {readTime({ __html: post.desc })} min de leitura
                          </span>
                          <span>
                            <FaClock size={12} /> {post.created}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-bottom"></div>
                  </Link>
                ))}
              </React.Fragment>
            ))
          : !isLoading && <p>Sem resultados para "{search}"</p>}

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
    </section>
  );
};

export default SearchPage;
