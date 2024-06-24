import React, { useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

import { Blog } from "../../../context/Context";
import { useLogout } from "../../../hooks/useLogout";

import "./UserModal.scss";
import ConfigModal from "../../Modals/ConfigModal/ConfigModal";

const UserModal = () => {
  const { currentUser, allUsers } = Blog();
  const { handleLogout } = useLogout();
  const getUserData = allUsers.find((user) => user.id === currentUser?.uid);
  const username = getUserData?.name;
  const firstWord = username ? username.split(" ").slice(0, 2).join(" ") : "";
  const [modal, setModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const openUserModal = () => {
    setModal(!modal);
  };

  const closeConfigModal = () => {
    setShowConfigModal(false);
  };
  const openConfigModal = () => {
    setShowConfigModal(true);
    setModal(false);
  };

  return (
    <>
      <div className="user-modal">
        <div className="profile-image" onClick={openUserModal}>
          <img
            src={getUserData?.profilePicture || "/logo-publish.png"}
            loading="eager"
            fetchpriority="high"
            alt="Profile"
          />
        </div>
        {modal && (
          <motion.div
            className="dropdown"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="text">
              <p>{firstWord}</p>
              <span>{getUserData?.email}</span>
            </div>

            <NavLink
              to={`/profile/${getUserData?.uid}`}
              className="profile-button"
              onClick={() => setModal(!modal)}
            >
              Perfil
            </NavLink>
            <button onClick={openConfigModal}>Configurações</button>
            <button onClick={handleLogout}>Sair</button>
          </motion.div>
        )}
      </div>

      {showConfigModal && (
        <ConfigModal onClick={closeConfigModal} closeModal={closeConfigModal} />
      )}
    </>
  );
};

export default UserModal;