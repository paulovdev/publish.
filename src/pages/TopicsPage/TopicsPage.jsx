import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInfiniteQuery } from 'react-query';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from '../../firebase/Firebase';
import { readTime } from "../../utils/ReadTime";
import { SiReadme } from "react-icons/si";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaClock } from "react-icons/fa";
import Skeleton from 'react-loading-skeleton';

import "./TopicsPage.scss";

const TopicsPage = () => {
    const { id } = useParams();
    const [topicName, setTopicName] = useState('');
    const [topicLoading, setTopicLoading] = useState(true);

    useEffect(() => {
        const fetchTopicName = async () => {
            try {
                const topicDoc = await getDoc(doc(db, 'topics', id));
                if (topicDoc.exists()) {
                    setTopicName(topicDoc.data().name);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setTopicLoading(false);
            }
        };

        fetchTopicName();
    }, [id]);

    const fetchPosts = async ({ pageParam = null }) => {
        try {
            const postsQuery = query(
                collection(db, 'posts'),
                where("topics", "==", id),
                orderBy("created", "desc"),
                limit(5),
                ...(pageParam ? [startAfter(pageParam)] : [])
            );

            const postsSnapshot = await getDocs(postsQuery);

            const postsData = await Promise.all(
                postsSnapshot.docs.map(async (postDoc) => {
                    const postData = postDoc.data();

                    const userDoc = await getDoc(doc(db, 'users', postData.userId));
                    if (!userDoc.exists()) return null;

                    const userData = userDoc.data();

                    return {
                        id: postDoc.id,
                        ...postData,
                        user: userData,
                        topicName: topicName
                    };
                })
            );

            const lastDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];

            return { postsData: postsData.filter(post => post !== null), lastDoc };
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
    } = useInfiniteQuery(['TopicsPage', id], fetchPosts, {
        getNextPageParam: (lastPage) => lastPage?.lastDoc
    });

    const lastPostElementRef = useRef();

    useEffect(() => {
        if (lastPostElementRef.current && isFetchingNextPage) {
            lastPostElementRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isFetchingNextPage]);

    return (
        <>
            <section id='topic-search'>
                <Link to="/" className="back">
                    <IoIosArrowRoundBack size={32} />
                    <p>Inicio</p>
                </Link>

           
                <div className="border-bottom"></div>


                {isLoading || topicLoading ? (
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
                ) : (
                    <>
                        {!isError && data.pages.reduce((acc, page) => acc + page.postsData.length, 0) === 0 && (
                            <div className="no-result">
                                <span>
                                    <p>Ops! Não encontramos nada para "{topicName}".</p>
                                    <p>Tente usar outros termos.</p>
                                </span>
                            </div>
                        )}

                        {!isError && data.pages.length > 0 && (
                            data.pages.map((page, i) => (
                                <React.Fragment key={i}>
                                    {page.postsData.map((post, j) => (
                                        <Link to={`/view-post/${post.id}`} className="post-container" key={j}>
                                            <div className="post-left-content">
                                                {post.imageUrl && <img src={post.imageUrl} alt="Post" className="post-image" loading="lazy" />}
                                            </div>
                                            <div className="post-right-content">

                                                <span className="topic">{post.topicName}</span>
                                                <h1>{topicName}</h1>
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
                                                                <img src={post.user.profilePicture} loading="lazy" alt="User" className="user-photo" />
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
                        )}
                    </>
                )}
            </section>
            {isFetchingNextPage && (
                <div className="loading-container">
                    <div className="loading"></div>
                </div>
            )}
            <div ref={lastPostElementRef}></div>
            {!isFetchingNextPage && hasNextPage && data.pages.length < 5 && (
                <div className="loading-container">
                    <button onClick={() => fetchNextPage()}>Carregar mais</button>
                </div>
            )}
        </>
    );
};

export default TopicsPage
