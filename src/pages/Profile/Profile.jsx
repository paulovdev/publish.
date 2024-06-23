import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../../firebase/Firebase";
import { doc, getDoc, onSnapshot, collection, getDocs, query, where } from "firebase/firestore";
import FollowButton from "../../components/FollowButton/FollowButton";
import Skeleton from "react-loading-skeleton";
import { useQuery, useQueryClient } from "react-query";

import "./Profile.scss";
import { Blog } from "../../context/Context";
import EditProfileModal from "../../components/Modals/EditProfileModal/EditProfileModal";

const Profile = () => {
  const { id } = useParams();
  const { currentUser } = Blog();
  const queryClient = useQueryClient();

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const fetchUserPosts = useCallback(async () => {
    const userDocRef = doc(db, "users", id);
    const userDocSnapshot = await getDoc(userDocRef);
    const userData = userDocSnapshot.data();
    const userPostIds = userData.posts || [];

    const userPostsQuery = query(
      collection(db, "posts"),
      where("__name__", "in", userPostIds)
    );
    const userPostsSnapshot = await getDocs(userPostsQuery);

    const postsData = [];
    const userIds = [];
    const topicIds = [];

    userPostsSnapshot.forEach((postDoc) => {
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

    return combinedData;
  }, [id]);

  const { data: userPosts, isLoading: isLoadingPosts } = useQuery(
    ["userPosts", id],
    fetchUserPosts
  );

  useEffect(() => {
    const userDocRef = doc(db, "users", id);

    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      const userData = doc.data();
      setUserData(userData);
      setFollowers(userData.followers || []);
      setFollowing(userData.following || []);
    });

    return () => {
      unsubscribeUser();
    };
  }, [id]);

  useEffect(() => {
    const unsubscribeFollowings =
      userData?.following.map((followId) => {
        const followingDocRef = doc(db, "users", followId);

        return onSnapshot(followingDocRef, (doc) => {
          const followingData = doc.data();
          setFollowing((prevFollowing) => {
            const newFollowing = prevFollowing.map((f) =>
              f.id === followId ? followingData : f
            );
            return newFollowing.some((f) => f.id === followId)
              ? newFollowing
              : [...newFollowing, followingData];
          });
        });
      }) || [];

    return () => {
      unsubscribeFollowings.forEach((unsub) => unsub());
    };
  }, [userData?.following]);

  const handleEditClick = () => setShowProfileModal(true);
  const closeEditModal = () => setShowProfileModal(false);

  const setUser = (newUserData) => {
    queryClient.setQueryData(["user", id], newUserData);
    closeEditModal();
  };

  if (!userData || isLoadingPosts) {
    return (
      <section id="my-profile">
        <div className="post-profile">
          <div>
            <div className="container">
              <div className="profile-photo">
                <Skeleton width={150} height={150} borderRadius={100} />
                <div className="wrapper-text">
                  <div className="follow-container">
                    <div className="follow-content">
                      <Skeleton width={10} height={25} />
                      <Skeleton width={75} height={10} />
                    </div>
                    <div className="follow-content">
                      <Skeleton width={10} height={25} />
                      <Skeleton width={75} height={10} />
                    </div>
                    <div className="follow-content">
                      <Skeleton width={10} height={25} />
                      <Skeleton width={75} height={10} />
                    </div>
                  </div>
                  <Skeleton width={300} height={40} borderRadius={20} />
                </div>
              </div>

              <div className="profile-text">
                <Skeleton width={150} height={15} />
                <Skeleton width={300} height={10} />
              </div>
              <div className="border-bottom"></div>
            </div>
          </div>
        </div>
        <div className="my-posts-profile">
          <div className="post-profile">
            <span>
              <Skeleton width={75} height={15} />
            </span>
            <h1>
              <Skeleton width={`100%`} height={10} />
            </h1>
            <div>
              <Skeleton width={`100%`} height={10} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="my-profile">
        <div>
          <div className="container">
            <div className="profile-photo">
              <img
                src={userData.profilePicture}
                alt="Profile"
                className="profile-picture"
              />
            </div>

            <div className="profile-text">
              <h1>{userData.name}</h1>
              <p>{userData.bio}</p>
            </div>

            <div className="wrapper-text">
              <div className="follow-container">
                <div className="follow-content">
                  <span>{followers.length}</span>
                  <p>Seguidores</p>
                </div>
                <div className="follow-content">
                  <span>{following.length}</span>
                  <p>Seguindo</p>
                </div>
                <div className="follow-content">
                  <span>{userPosts.length}</span>
                  <p>Publicações</p>
                </div>
              </div>
              {currentUser.uid === id && (
                <button onClick={handleEditClick}>Editar perfil</button>
              )}
              {currentUser.uid !== id && <FollowButton userId={id} />}
            </div>
          </div>

          <div className="border-bottom"></div>
        </div>

        <div className="my-posts-profile">
          {!isLoadingPosts &&
            userPosts.map((post) => (
              <Link
                to={`/view-post/${post.id}`}
                onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
                key={post.id}
              >
                <div className="post-container">

                  <div className="post-right-content">
                    <div className="topic">
                      <span>
                        {post.topicName}
                      </span>
                    </div>

                    <h1>{post.title}</h1>
                    <p>{post.subTitle}</p>
                  </div>

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
                </div>
              </Link>
            ))}
        </div>
      </section>

      {showProfileModal && (
        <EditProfileModal
          user={userData}
          setUser={setUser}
          onClick={closeEditModal}
        />
      )}
    </>
  );
};

export default Profile;
