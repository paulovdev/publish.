import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { SiReadme } from "react-icons/si";
import { FaClock } from "react-icons/fa";
import Skeleton from 'react-loading-skeleton';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/Firebase';

import "./SearchPage.scss";

const SearchPage = () => {
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const search = new URLSearchParams(location.search).get("q");
    const [fetchedPosts, setFetchedPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const postsQuery = query(collection(db, 'posts'), where("title", "==", search));
                const postsSnapshot = await getDocs(postsQuery);

                const postsData = [];

                for (const postDoc of postsSnapshot.docs) {
                    const postData = postDoc.data();

                    const userDoc = await getDoc(doc(db, 'users', postData.userId));
                    const userData = userDoc.exists() ? userDoc.data() : null;

                    const topicDoc = await getDoc(doc(db, 'topics', postData.topic));
                    const topicData = topicDoc.exists() ? topicDoc.data() : null;

                    if (userData && topicData) {
                        const postWithUserAndTopic = {
                            id: postDoc.id,
                            ...postData,
                            user: userData,
                            topicName: topicData.name
                        };
                        postsData.push(postWithUserAndTopic);
                    }
                }

                setFetchedPosts(postsData);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        if (search) {
            fetchPosts();
        }
    }, [search]);

    return (
        <section id="search">
            <Link to="/" className="back">
                <IoIosArrowRoundBack size={32} />
                <p>Voltar</p>
            </Link>
            <h1>
                Encontramos {loading ? "..." : fetchedPosts.length} resultado{fetchedPosts.length === 1 ? "" : "s"} para "{search}":
            </h1>
            <div className="border-bottom"></div>

            {loading && (
                <div id="search-posts">
                    {[...Array(1)].map((_, i) => (
                        <div className="post-container" key={i}>
                            <div className="post-left-content">
                                <Skeleton width={300} height={200} />
                            </div>
                            <div className="post-right-content">
                                <Skeleton width={100} height={20} />
                                <div className="topic-profile-container">
                                    <div className="profile-content">
                                        <Skeleton width={24} height={24} />
                                        <div className="profile-text-wrapper">
                                            <p><Skeleton width={100} height={10} /></p>
                                            <p><Skeleton width={100} height={10} /></p>
                                        </div>
                                    </div>
                                </div>
                                <h1><Skeleton width={600} height={20} /></h1>
                                <div className="body-posts">
                                    <Skeleton count={4} height={15} />
                                </div>
                                <span><Skeleton width={50} height={10} /></span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && fetchedPosts.length === 0 && (
                <div className="no-result">
                    <span>
                        <p>Ops! Não encontramos nada para "{search}".</p>
                        <p>Tente usar outros termos.</p>
                    </span>
                </div>
            )}

            {!loading && fetchedPosts.length > 0 && (
                <div id="search-posts">
                    {fetchedPosts.map((post, i) => (
                        <Link to={`/post/${post.id}`} className="post-container" key={i}>
                            <div className="post-left-content">
                                <img src={post.postImg} alt="postImg" />
                            </div>
                            <div className="post-right-content">
                                <span className="topic">{post.topicName}</span>
                                <h1>{post.title}</h1>
                                <div
                                    className="body-posts"
                                    dangerouslySetInnerHTML={{
                                        __html: post.desc.slice(0, 250),
                                    }}
                                ></div>
                                <div className="read-topic">
                                    <div className="topic-profile-container">
                                        <div className="profile-content">
                                            {post.user && post.user.name &&
                                                <>
                                                    <img src={post.user.userImg} alt="" />
                                                    <div className="profile-text-wrapper">
                                                        <p>{post.user.name.split(" ")[0]}</p>
                                                        <span>•</span>
                                                        <p>
                                                            <FaClock />
                                                            {post.created}
                                                        </p>
                                                    </div>
                                                </>}
                                        </div>
                                    </div>
                                    <span><SiReadme /> min de leitura</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
};

export default SearchPage;
