import { onAuthStateChanged } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/Firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

const BlogContext = createContext();

const fetchUsers = async () => {
  const postRef = query(collection(db, "users"));
  const snapshot = await getDocs(postRef);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  }));
};

const Context = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const updatePosts = () => {
    setPostsUpdated(true);
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const { data: allUsers = [], isLoading: userLoading } = useQuery("users", fetchUsers, {
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
  });

  if (loading || userLoading) {
    return (
      <div className="loading-container initial">
        <div className="loading initial"></div>
      </div>
    );
  }

  return (
    <BlogContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers,
        userLoading
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

const queryClient = new QueryClient();

const App = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Context>{children}</Context>
  </QueryClientProvider>
);

export default App;

export const Blog = () => useContext(BlogContext);
