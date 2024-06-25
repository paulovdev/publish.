import React, { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { db } from "../../../firebase/Firebase";
import { doc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useQueryClient } from "react-query";

import "./EditProfileModal.scss";

const EditProfileModal = ({ user, setUser, onClick }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureURL, setProfilePictureURL] = useState(
    user?.profilePicture || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModified, setIsModified] = useState(false);


  useEffect(() => {
    if (name !== user.name || bio !== user.bio || profilePicture !== null) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [name, bio, profilePicture, user.name, user.bio]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
      setProfilePictureURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isModified) {
      setError("Nenhuma alteração feita.");
      return;
    }
    if (!name.trim() || !bio.trim()) {
      setError("Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = profilePictureURL;
      if (profilePicture) {
        const storage = getStorage();
        const storageRef = ref(
          storage,
          `posts/${user.uid}/${Date.now()}_${profilePicture.name}`
        );
        await uploadBytes(storageRef, profilePicture);
        imageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, "users", user.uid), {
        name,
        bio,
        profilePicture: imageUrl,
      });
      queryClient.invalidateQueries("user");
      setUser((prevUser) => ({
        ...prevUser,
        name,
        bio,
        profilePicture: imageUrl,
      }));
      setLoading(false);
      onClick();
    } catch (error) {
      setLoading(false);
      setError("Erro ao salvar as alterações. Tente novamente mais tarde.");
      console.log(error);
    }
  };

  const clearInput = () => {
    setBio("");
  };

  return (
    <motion.div
      id="edit-profile-modal"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="close-edit" onClick={onClick}>
        <MdOutlineClose size={32} />
      </div>


      <div className="edit-profile-modal-content">
        <div className="head-text">
          <h1>Edite as informações do seu Perfil</h1>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="image-profile" role="button" tabIndex={0}>
            <label htmlFor="file-upload">
              <div className="profile-photo">
                <img
                  src={profilePictureURL || "/profile.jpg"}
                  alt="profile-img"
                />
                <FaCamera />
              </div>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="input-container">
            <input
              name="username"
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder=" "
              minLength={6}
              maxLength={32}
              inputMode="text"
              required
            />
            <label>Nome</label>
          </div>

          <div className="input-container text-input">
            <textarea
              name="bio"
              required
              value={bio}
              maxLength={250}
              onChange={(e) => setBio(e.target.value)}
              placeholder=" "
            />
            <label>Biografia</label>
            {bio && (
              <span onClick={clearInput}>
                <IoCloseOutline size={24} />
              </span>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          <button
            id="save-button"
            type="submit"
            disabled={loading || !isModified}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default EditProfileModal;