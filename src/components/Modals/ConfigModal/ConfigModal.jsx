import React from "react";
import { MdOutlineClose } from "react-icons/md";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { deleteUser } from "firebase/auth";
import { Blog } from "../../../context/Context";

import "./ConfigModal.scss";
import ThemeChange from "../../ThemeChange/ThemeChange";

const ConfigModal = ({ onClick }) => {
  const { currentUser } = Blog();

  const handleDeleteAccount = () => {
    deleteUser(user)
      .then(() => {
        console.log("Conta deletada");
      })
      .catch((error) => {
        console.error("Erro ao deletar conta", error);
      });
  };

  return (
    <motion.div
      id="config-modal"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="modal-content">
        <div className="header-text">
          <div className="profile-information-text">
            <h1>Configurações</h1>
          </div>
          <div className="close-edit">
            <MdOutlineClose className="close-svg" onClick={onClick} size={32} />
          </div>
        </div>

        <div className="border-bottom"></div>

        <div className="config-container">
          <ThemeChange />

          <div className="border-bottom-config"></div>

          <div className="topics-selection">
            <p>Selecionar tópicos</p>
            <Link to={"/get-started/topics"} onClick={onClick}>
              Selecionar
            </Link>
          </div>

          <div className="border-bottom-config"></div>

          <label>Seu e-mail</label>
          <input
            type="email"
            disabled
            value={currentUser.email}
            placeholder="Digite seu email atual"
          />
          <div className="border-bottom-config"></div>

          <div className="delete-account">
            <p>Excluir conta</p>
            <button type="button" onClick={handleDeleteAccount}>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfigModal;
