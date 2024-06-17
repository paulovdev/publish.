import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

import Navbar from "./components/Navigation/Navbar/Navbar"
import SideBar from './components/Navigation/SideBar/SideBar';

import FirstHome from "./pages/FirstHome/FirstHome"
import Home from './pages/Home/Home';
import Login from './pages/Registration/Login/Login';
import Register from './pages/Registration/Register/Register';
import GetStartedTopics from './pages/GetStartedTopics/GetStartedTopics';
import AddTopics from './scripts/AddTopics';
import Profile from './pages/Profile/Profile';
import CreatePostPage from './pages/CreatePostPage/CreatePostPage';
import ViewPostPage from './pages/ViewPostPage/ViewPostPage';
import { Blog } from './context/Context';
import SearchPage from './pages/SearchPage/SearchPage';
import Dashboard from './pages/Dashboard/Dashboard';
/* import TopicsPage from './pages/TopicsPage/TopicsPage'; */
import AllPosts from './components/PostsComp/AllPosts/AllPosts';
import SelectedTopicsPosts from './components/PostsComp/SelectedTopicsPosts/SelectedTopicsPosts';
import FollowingPosts from './components/PostsComp/FollowingPosts/FollowingPosts';
import ScrollTop from './utils/ScrollTop/ScrollTop';

const App = () => {
  const { currentUser } = Blog();
  const location = useLocation();
  return (
    <SkeletonTheme>
      <Navbar />
      <ScrollTop />
      {currentUser && <SideBar />}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={!currentUser ? <FirstHome /> : <Navigate to="/feed/all-posts" />} />

        <Route path="feed" element={!currentUser ? <Navigate to="/login" /> : <Home />}>
          <Route path="all-posts" element={<AllPosts />} />
          <Route path="following" element={<FollowingPosts />} />
          <Route path="topic/:id" element={<SelectedTopicsPosts />} />
        </Route>

        <Route path="/dashboard" element={!currentUser ? <Navigate to="/login" /> : <Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/get-started/topics" element={!currentUser ? <Navigate to="/login" /> : <GetStartedTopics />} />
        <Route path="/create-post" element={!currentUser ? <Navigate to="/login" /> : <CreatePostPage />} />
        <Route path="/profile/:id" element={!currentUser ? <Navigate to="/login" /> : <Profile />} />
        <Route path="/view-post/:id" element={!currentUser ? <Navigate to="/login" /> : <ViewPostPage />} />
        {/* <Route path="/feed/topics/:id" element={!currentUser ? <Navigate to="/login" /> : <TopicsPage />} /> */}
        <Route path="/search" element={!currentUser ? <Navigate to="/login" /> : <SearchPage />} />
        <Route path="/U2FsdGVkX18W14So8Z+jlcy7OTyMZ5a1PzX76+R+VnYpiroca" element={<AddTopics />} />
      </Routes>
    </SkeletonTheme>
  );
};

export default App;
