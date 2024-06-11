import React, { useState, useEffect } from 'react';
import { getDocs, collection, query, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/Firebase';

const AllPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const postsQuery = query(collection(db, 'posts'));
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

                setPosts(postsData);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div>
            {loading && <p>Loading posts...</p>}
            {!loading && posts.map(post => (
                <div key={post.id}>
                    <div className="user-info">
                        {post.user && post.user.profilePicture && (
                            <img src={post.user.profilePicture} width={100} alt="User" className="user-photo" />
                        )}
                        {post.user && post.user.name && <p> USUARIO: {post.user.name}</p>}
                    </div>
                    <span>TOPICO: {post.topicName}</span>
                    <h2>TITULO: {post.title}</h2>
                    {post.imageUrl && <img src={post.imageUrl} width={100} alt="Post" className="post-image" />}
                    <div
                        className="body-posts"
                        dangerouslySetInnerHTML={{
                            __html: post.desc,
                        }}
                    ></div>
                    <br />
                    <br />
                </div>


            ))}
        </div>
    );
};

export default AllPosts;
