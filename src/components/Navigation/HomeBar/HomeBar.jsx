import React, { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { collection, getDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase/Firebase";
import "./HomeBar.scss";
import { Blog } from "../../../context/Context";
import Skeleton from "react-loading-skeleton";

const HomeBar = () => {
  const { currentUser } = Blog();
  const queryClient = useQueryClient();
  const [userSelectedTopics, setUserSelectedTopics] = useState([]);
  const [loadingUserTopics, setLoadingUserTopics] = useState(true); // State para controlar o carregamento inicial dos tópicos do usuário

  // Utilizar useMemo para armazenar os tópicos selecionados e controlar a invalidação da query
  const memoizedSelectedTopics = useMemo(() => userSelectedTopics, [userSelectedTopics]);

  useEffect(() => {
    if (!currentUser) return;

    const userDoc = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userDoc, (snapshot) => {
      const userData = snapshot.data();
      const selectedTopics = userData?.selectedTopics || [];
      setUserSelectedTopics(selectedTopics);

      // Invalidar e refetch dos tópicos quando os tópicos selecionados do usuário mudarem
      queryClient.invalidateQueries(["allTopics", selectedTopics]);
    });

    return () => unsubscribe();
  }, [currentUser, queryClient]);

  const { data: topics = [], isLoading: isLoadingTopics } = useQuery(
    ["allTopics", memoizedSelectedTopics],
    async () => {
      if (!memoizedSelectedTopics.length) return [];

      const topicPromises = memoizedSelectedTopics.map((topicId) =>
        getDoc(doc(db, "topics", topicId))
      );
      const topicDocs = await Promise.all(topicPromises);

      const filteredTopics = topicDocs
        .filter((doc) => doc.exists())
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      return filteredTopics;
    },
    {
      enabled: !!memoizedSelectedTopics.length,
      refetchOnWindowFocus: false,
      onSuccess: () => {
        setLoadingUserTopics(false); // Marca que os tópicos do usuário terminaram de carregar
      },
    }
  );

  // Determina o número de Skeletons baseado no número de tópicos selecionados pelo usuário
  const numSkeletons = memoizedSelectedTopics.length;

  // Agora, renderizamos o conteúdo do HomeBar apenas quando todos os dados estiverem prontos
  if (isLoadingTopics || loadingUserTopics) {
    return (
      <div className="home-nav">
        <NavLink to="all-posts">
          <p>Todos</p>
        </NavLink>
        <NavLink to="following">
          <p>Seguindo</p>
        </NavLink>
        {Array.from({ length: numSkeletons }).map((_, index) => (
          <Skeleton key={index} width={75} height={10} />
        ))}
      </div>
    );
  }

  return (
    <div className="home-nav">
      <NavLink to="all-posts">
        <p>Todos</p>
      </NavLink>
      <NavLink to="following">
        <p>Seguindo</p>
      </NavLink>
      {topics.length > 0 &&
        topics.map((topic) => (
          <NavLink key={topic.id} to={`topic/${topic.id}`}>
            <p>{topic.name}</p>
          </NavLink>
        ))}
    </div>
  );
};

export default HomeBar;
