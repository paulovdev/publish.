import React from 'react';

import SelectedTopicsPosts from '../../components/PostsComp/SelectedTopicsPosts/SelectedTopicsPosts';
import AllUsers from '../../components/PostsComp/AllUsers/AllUsers';
import PopularPosts from '../../components/PostsComp/PopularPosts/PopularPosts';

import "./Home.scss"
import AllTopics from '../../components/PostsComp/AllTopics/AllTopics';

const Home = () => {

  return (
    <section id='home'>

      <h1>Destaques</h1>
      <p>Veja o que está em alta e sendo discutido pela comunidade.</p>
      <div className="border-bottom"></div>
      <PopularPosts />

      <div className="user-text">
        <h2>Usuários para Seguir</h2>
        <p>Descubra novos usuários interessantes e siga suas postagens.</p>
      </div>
      <AllUsers />

      <div className="emphasis-text">
        <h2>Tópicos</h2>
        <p>Explore os tópicos</p>
      </div>
      <AllTopics />

   
      <SelectedTopicsPosts />

    </section>
  );
};

export default Home;
