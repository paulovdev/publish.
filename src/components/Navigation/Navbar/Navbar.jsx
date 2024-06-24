import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Blog } from "../../../context/Context";
import { db } from "../../../firebase/Firebase";
import { doc, onSnapshot } from "firebase/firestore";
import "./Navbar.scss";

import UserModal from "../UserModal/UserModal";
import SearchInput from "./SearchInput/SearchInput";
import NotificationModal from "../../Modals/NotificationModal/NotificationModal";

import { IoNotifications } from "react-icons/io5";
import { IoBookSharp } from "react-icons/io5";

const Navbar = () => {
  const { currentUser } = Blog();
  const [notifications, setNotifications] = useState([]);
  const [notificationModal, setNotificationModal] = useState(false);

  useEffect(() => {
    let unsubscribe;

    const fetchNotifications = async () => {
      try {
        if (!currentUser) return;

        const userDocRef = doc(db, "users", currentUser.uid);
        unsubscribe = onSnapshot(userDocRef, (userDocSnapshot) => {
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            const fetchedNotifications = userData.notifications || [];
            setNotifications(fetchedNotifications);
          } else {
            console.log("User not found");
          }
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const openNotificationModal = () => {
    setNotificationModal(!notificationModal);
  };

  return (
    <>
      <header className={currentUser ? "logged-in" : "logged-out"}>
        {currentUser && (
          <div className="user-content-modal">
            <SearchInput />
            <div className="notify-container" onClick={openNotificationModal}>
              <div className="side-icon">
                <IoNotifications size={22} />
                {notifications.length > 0 && (
                  <div className="notification-container"></div>
                )}
              </div>
            </div>
            <UserModal />
          </div>
        )}

        {!currentUser && (
          <div className="logo">
            <IoBookSharp />publique
          </div>
        )}


        {!currentUser ? (
          <nav>

            <>
              <li>
                <NavLink to="/">Inicio</NavLink>
              </li>
              <li>
                <NavLink to="/login">Entrar</NavLink>
              </li>
              <li>
                <NavLink to="/register">Cadastrar</NavLink>
              </li>
            </>

          </nav>
        ) : null}

      </header>
      {notificationModal && <NotificationModal />}
    </>
  );
};

export default Navbar;