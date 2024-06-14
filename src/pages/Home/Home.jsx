import React from 'react';
import { Outlet } from 'react-router-dom';
import "./Home.scss";

import HomeBar from '../../components/Navigation/HomeBar/HomeBar';
import PopularPosts from '../../components/PostsComp/PopularPosts/PopularPosts';


const Home = () => {

  return (
    <section id='home'>
      <h1>Destaques</h1>
      <PopularPosts />
      <HomeBar />
      <div className="border-bottom"></div>
      <Outlet />
    </section>
  );
};

export default Home;
