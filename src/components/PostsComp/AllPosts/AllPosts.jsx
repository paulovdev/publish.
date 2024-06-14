import React, { useEffect, useRef } from 'react';
import { useInfiniteQuery } from 'react-query';
import { doc, getDoc, collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from '../../../firebase/Firebase';
import { Link } from 'react-router-dom';
import { readTime } from "../../../utils/ReadTime";
import { FaPlus } from "react-icons/fa6";

import Skeleton from 'react-loading-skeleton';

import "./AllPosts.scss"

const AllPosts = () => {



    const fetchPosts = async ({ pageParam = null }) => {
        try {
            const postsQuery = query(
                collection(db, 'posts'),
                orderBy("created", "desc"),
                limit(5),
                ...(pageParam ? [startAfter(pageParam)] : [])
            );

            const postsSnapshot = await getDocs(postsQuery);

            const postsData = [];

            for (const postDoc of postsSnapshot.docs) {
                const postData = postDoc.data();

                const userDoc = await getDoc(doc(db, 'users', postData.userId));
                if (!userDoc.exists()) {
                    continue;
                }
                const userData = userDoc.data();

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

            const lastDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];

            return { postsData, lastDoc };
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
        isFetchingNextPage
    } = useInfiniteQuery(['allPosts'], fetchPosts, {
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.lastDoc;
        }
    });

    const lastPostElementRef = useRef();

    useEffect(() => {
        if (lastPostElementRef.current && isFetchingNextPage) {
            lastPostElementRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isFetchingNextPage]);

    return (
        <>
            <div id='all-posts'>
                {isLoading && (
                    <Link >
                        <div className="post-container">
                            <div className="post-left-content">
                                <Skeleton width={200} height={125} />
                            </div>
                            <div className="post-right-content">
                                <Skeleton width={50} height={15} borderRadius={50} />

                                <h1> <Skeleton width={460} height={15} /></h1>
                                <Skeleton width={460} height={10} />
                                <Skeleton width={460} height={10} />

                                <div className="profile-content">
                                    <Skeleton width={20} height={30} borderRadius={'100%'} />

                                    <p> <Skeleton width={50} height={10} /></p>

                                    <span> <Skeleton width={50} height={10} /></span>

                                    <span>  <Skeleton width={50} height={10} /></span>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {!isLoading && !isError && data.pages.length > 0 ? (
                    data.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.postsData.map((post, j) => (
                                <Link to={`/view-post/${post.id}`} key={j}>
                                    <div className="post-container">
                                        <div className="post-left-content">
                                            {post.imageUrl && <img src={post.imageUrl} alt="Post" className="post-image" loading="lazy" />}
                                        </div>
                                        <div className="post-right-content">
                                            <span className="topic">{post.topicName}</span>
                                            <h1>{post.title}</h1>
                                            <div
                                                className="body-posts"
                                                dangerouslySetInnerHTML={{
                                                    __html: post.desc
                                                }}
                                            ></div>
                                            <div className="profile-content">

                                                {post.user && post.user.profilePicture && (
                                                    <img src={post.user.profilePicture} loading="lazy" alt="User" className="user-photo" />
                                                )}
                                                {post.user && post.user.name && <p>{post.user.name}</p>}
                                                <p>•</p>
                                                <span>{readTime({ __html: post.desc })} min de leitura</span>
                                                <p>•</p>
                                                <span> {post.created}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-bottom"></div>
                                </Link>
                            ))}
                        </React.Fragment>
                    ))
                ) : (
                    !isLoading && <p>Sem posts disponíveis</p>
                )}
            </div>

            {isFetchingNextPage && (
                <div className="loading-container">
                    <div className="loading"></div>
                </div>
            )}
            <div ref={lastPostElementRef}></div>
            {!isFetchingNextPage && hasNextPage && (
                <div className="loading-container">
                    <button onClick={() => fetchNextPage()}><FaPlus /></button>
                </div>
            )}
        </>
    );
}

export default AllPosts;



{/*     <p>
                                            <FaClock />
                                            {post.created}
                                        </p> */}