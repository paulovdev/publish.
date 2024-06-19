import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Blog } from "../../../context/Context";
import { db } from "../../../firebase/Firebase";
import { doc, onSnapshot } from "firebase/firestore";
import "./Navbar.scss";

import UserModal from "../UserModal/UserModal";
import SearchInput from "./SearchInput/SearchInput";
import { IoNotifications } from "react-icons/io5";
import NotificationModal from "../../Modals/NotificationModal/NotificationModal";

const Navbar = () => {
  const { currentUser } = Blog();
  const [notifications, setNotifications] = useState(0);
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
      <header>
        {currentUser && <SearchInput />}

        {!currentUser && (
          <Link to="/">
            <img src="/logo-publish.png" width={40} alt="" />
          </Link>
        )}
        {currentUser && (
          <div className="notify-container" onClick={openNotificationModal}>
            <div className="side-icon">
              <IoNotifications size={22} />
              {notifications.length > 0 && (
                <div className="notification-container"></div>
              )}
            </div>
          </div>
        )}
        <nav>
          {!currentUser && (
            <>
              <li>
                <NavLink to="/login">Entrar</NavLink>
              </li>
              <li>
                <NavLink to="/register">Cadastrar</NavLink>
              </li>
              <li>
                <NavLink to="/about">Sobre</NavLink>
              </li>
            </>
          )}
        </nav>

        {currentUser && <UserModal />}
      </header>
      {notificationModal && <NotificationModal />}
    </>
  );
};

export default Navbar;
