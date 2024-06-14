import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/Firebase';
import { NavLink } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { IoMdCube } from "react-icons/io";
import { MdFileUpload } from "react-icons/md";

import { IoNotifications } from "react-icons/io5";
import { TbGridDots } from "react-icons/tb";
import NotificationCounter from '../../NotificationsComp/NotificationCounter';
import { motion } from 'framer-motion';
import { Blog } from '../../../context/Context';

import './SideBar.scss';

const SideBar = () => {
    const { currentUser } = Blog()
    const [notifications, setNotifications] = useState([]);
    const [lastItemModal, setLastItemModal] = useState(false)

    useEffect(() => {
        let unsubscribe;

        const fetchNotifications = async () => {
            try {
                if (!currentUser) return;

                const userDocRef = doc(db, 'users', currentUser.uid);
                unsubscribe = onSnapshot(userDocRef, (userDocSnapshot) => {
                    if (userDocSnapshot.exists()) {
                        const userData = userDocSnapshot.data();
                        const fetchedNotifications = userData.notifications || [];
                        setNotifications(fetchedNotifications);
                    } else {
                        console.log('User not found');
                    }
                });
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentUser]);

    return (
        <aside id="sidebar">
            <ul>
                <li>
                    <NavLink to="/feed/all-posts" className={({ isActive }) => isActive ? 'active side-container' : 'side-container'}>
                        <div className='side-icon'>
                            <GoHomeFill size={22} />
                        </div>
                        <div className="side-text">
                            <span>Inicio</span>
                        </div>
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/me/notifications`} className={({ isActive }) => isActive ? 'active side-container' : 'side-container'}>
                        <div className='side-icon'>
                            <IoNotifications size={22} />
                            {notifications.length > 0 &&
                                <div className="notification-container">
                                    <NotificationCounter count={notifications.length} />
                                </div>
                            }
                        </div>
                        <div className="side-text">
                            <span>Notificações</span>
                        </div>

                    </NavLink>
                </li>
                <li>
                    <NavLink to="/create-post" className={({ isActive }) => isActive ? 'active side-container' : 'side-container'}>
                        <div className='side-icon'>
                            <MdFileUpload size={22} />
                        </div>
                        <div className="side-text">
                            <span>Publicar</span>
                        </div>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active side-container' : 'side-container'}>
                        <div className='side-icon'>
                            <IoMdCube size={22} />
                        </div>
                        <div className="side-text">
                            <span>Dashboard</span>
                        </div>
                    </NavLink>
                </li>
            </ul>
            <ul>
                <li>
                    <NavLink className='last-item-sidebar active-side-text'>
                        <div className='side-icon' onClick={() => setLastItemModal(!lastItemModal)}>
                            <TbGridDots size={22} />
                        </div>
                        {lastItemModal &&
                            <motion.div
                                className='side-text active-side-text'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ ease: 'easeIn' }}>
                                <span>Quem somos</span>
                                <span>+Informações</span>
                                <span>Política de Cookies</span>
                            </motion.div>
                        }

                    </NavLink>
                </li>
            </ul>
        </aside >
    );
};

export default SideBar;
