import React, { useEffect, useRef } from 'react';
import { useInfiniteQuery } from 'react-query';
import { doc, getDoc, collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from '../../../firebase/Firebase';
import { Blog } from "../../../context/Context";
import { Link } from 'react-router-dom';
import { readTime } from "../../../utils/ReadTime";
import { SiReadme } from "react-icons/si";
import { FaClock } from "react-icons/fa";
import Skeleton from 'react-loading-skeleton';

import "./SelectedTopicsPosts.scss"

const SelectedTopicsPosts = () => {
    const { currentUser } = Blog();

    const fetchPosts = async ({ pageParam = null }) => {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                const selectedTopics = userData.selectedTopics || [];

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

                    if (!selectedTopics.includes(postData.topics)) {
                        continue;
                    }

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
            }
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
    } = useInfiniteQuery(['selectedTopicsPosts'], fetchPosts, {
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
            <div id='selected-topics-post'>
                {isLoading && (
                    <div className="post-container">
                        <div className="post-left-content">
                            <Skeleton width={350} height={200} />
                        </div>
                        <div className="post-right-content">
                            <Skeleton width={60} height={15} />
                            <Skeleton width={600} height={10} />
                            <Skeleton width={600} height={10} />
                            <div className="read-topic">
                                <div className="topic-profile-container">
                                    <div className="profile-content">
                                        <Skeleton width={30} height={30} borderRadius={100} />
                                        <div className="profile-text-wrapper">
                                            <Skeleton width={50} height={10} />
                                            <p><Skeleton width={50} height={10} /></p>
                                        </div>
                                    </div>
                                </div>
                                <span><Skeleton width={50} height={10} /></span>
                            </div>
                        </div>
                    </div>
                )}

                {!isLoading && !isError && data.pages.length > 0 ? (
                    data.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.postsData.map((post, j) => (
                                <Link to={`/view-post/${post.id}`} className="post-container" key={i}>
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
                                        <div className="read-topic">
                                            <div className="topic-profile-container">
                                                <div className="profile-content">
                                                    {post.user && post.user.profilePicture && (
                                                        <img src={post.user.profilePicture} loading="lazy" alt=" User" className="user-photo" />
                                                    )}
                                                    <div className="profile-text-wrapper">
                                                        {post.user && post.user.name && <p>{post.user.name}</p>}
                                                        <span>•</span>
                                                        <p>
                                                            <FaClock />
                                                            {post.created}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <span><SiReadme /> {readTime({ __html: post.desc })} min de leitura</span>
                                        </div>
                                    </div>
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
                    <button onClick={() => fetchNextPage()}>Carregar mais</button>
                </div>
            )}
        </>
    );
}

export default SelectedTopicsPosts;
