import React from "react";
import { Outlet } from "react-router-dom";

import HomeBar from "../../components/Navigation/HomeBar/HomeBar";
import PopularPosts from "../../components/PostsComp/PopularPosts/PopularPosts";
import AllUsers from "../../components/PostsComp/AllUsers/AllUsers";
import AllTopics from "../../components/PostsComp/AllTopics/AllTopics";

import "./Home.scss";

const Home = () => {
  return (
    <section id="home">
      <HomeBar />
      <PopularPosts />
      <div className="border-bottom"></div>

      <div className="home-wrapper">
        <Outlet />
        <div className="border-right"></div>
        <div className="all-wrapper">
          <AllUsers />
          <AllTopics />
        </div>
      </div>
    </section>
  );
};

export default Home;
