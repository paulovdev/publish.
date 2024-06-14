import React from 'react';

import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from "./components/Navigation/Navbar/Navbar"
import SideBar from './components/Navigation/SideBar/SideBar';

import FirstHome from "./pages/FirstHome/FirstHome"
import Home from './pages/Home/Home';
import Login from './pages/Registration/Login/Login';
import Register from './pages/Registration/Register/Register';
import GetStartedTopics from './pages/GetStartedTopics/GetStartedTopics';
import AddTopics from './scripts/AddTopics';
import Profile from './pages/Profile/Profile';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';
import CreatePostPage from './pages/CreatePostPage/CreatePostPage';
import ViewPostPage from './pages/ViewPostPage/ViewPostPage';
import { Blog } from './context/Context';
import SearchPage from './pages/SearchPage/SearchPage';
import Dashboard from './pages/Dashboard/Dashboard';
import TopicsPage from './pages/TopicsPage/TopicsPage';
import AllUsers from './components/PostsComp/AllUsers/AllUsers';
/* import AllTopics from './components/PostsComp/AllTopics/AllTopics'; */
import AllPosts from './components/PostsComp/AllPosts/AllPosts';
import SelectedTopicsPosts from './components/PostsComp/SelectedTopicsPosts/SelectedTopicsPosts';
import FollowingPosts from './components/PostsComp/FollowingPosts/FollowingPosts';

const App = () => {
  const { currentUser } = Blog();
  const location = useLocation();
  return (
    <SkeletonTheme baseColor="#3a3a3a" highlightColor="#262626">
      <Navbar />
      {currentUser && <SideBar />}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={!currentUser ? <FirstHome /> : <Home />}>
          <Route path="feed/all-posts" element={<AllPosts />} />
          <Route path="feed/following" element={<FollowingPosts />} />
          <Route path="feed/topic/:id" element={<SelectedTopicsPosts />} />
        </Route>
        <Route path="/dashboard" element={!currentUser ? <Login /> : <Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/get-started/topics" element={<GetStartedTopics />} />
        <Route path="/me/notifications" element={<NotificationsPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/view-post/:id" element={<ViewPostPage />} />
        <Route path="/feed/topics/:id" element={<TopicsPage />} />
        <Route path="/search" element={<SearchPage />} />
        {/* script route */}
        <Route path="/U2FsdGVkX18W14So8Z+jlcy7OTyMZ5a1PzX76+R+VnYpiroca" element={<AddTopics />} />
      </Routes>
    </SkeletonTheme>
  );
};

export default App;
