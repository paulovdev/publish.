import React, { useState, useEffect } from 'react';
import { FaCamera } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { db } from "../../../firebase/Firebase";
import { doc, updateDoc } from "firebase/firestore";
import { motion } from 'framer-motion';
import { useQueryClient } from 'react-query';

import "./EditProfileModal.scss";

const EditProfileModal = ({ user, setUser, closeModal, onClick }) => {
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureURL, setProfilePictureURL] = useState(user?.profilePicture || ''); // Definir a URL inicial da foto
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModified, setIsModified] = useState(false);
    const queryClient = useQueryClient();

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
            setProfilePictureURL(URL.createObjectURL(e.target.files[0])); // Atualizar a URL da foto apenas quando uma nova foto for selecionada
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isModified) {
            setError('Nenhuma alteração feita.');
            return;
        }
        if (!name.trim() || !bio.trim()) {
            setError('Por favor, preencha todos os campos.');
            return;
        }
        setLoading(true);
        try {
            let imageUrl = profilePictureURL; // Use a URL atual se nenhuma nova foto for selecionada
            if (profilePicture) {
                const storage = getStorage();
                const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${profilePicture.name}`);
                await uploadBytes(storageRef, profilePicture);
                imageUrl = await getDownloadURL(storageRef);
            }

            await updateDoc(doc(db, 'users', user.uid), {
                name,
                bio,
                profilePicture: imageUrl,
            });
            queryClient.invalidateQueries('user');
            setUser(prevUser => ({
                ...prevUser,
                name,
                bio,
                profilePicture: imageUrl,
            }));
            setLoading(false);
            closeModal();
        } catch (error) {
            setLoading(false);
            setError('Erro ao salvar as alterações. Tente novamente mais tarde.');
            console.log(error)
        }
    };

    return (

        <motion.div id="edit-profile-modal"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            <div className="modal-content">
                <div className="header-text">
                    <div className="profile-information-text">
                        <h1>Informações do Perfil</h1>
                    </div>
                    <div className="close-edit">
                        <MdOutlineClose className="close-svg" onClick={onClick} size={32} />
                    </div>
                </div>
                <div className="border-bottom"></div>
                <form onSubmit={handleSubmit} className="edit-profile-form">
                    <div className="image-profile" role="button" tabIndex={0}>
                        <label htmlFor="file-upload">
                            <div className="profile-photo">
                                <img
                                    src={profilePictureURL || "/profile.jpg"} // Usar a URL atual da foto ou uma foto padrão
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
                            style={{ display: 'none' }}
                        />
                    </div>
                    <label>Nome</label>
                    <input
                        name="username"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        type="text"
                        placeholder="Seu nome"
                        minLength={6}
                        maxLength={24}
                        inputMode="text"
                    />
                    <label>Biografia</label>
                    <textarea
                        name="bio"
                        onChange={(e) => setBio(e.target.value)}
                        value={bio}
                        placeholder="Sua biografia"
                        rows={5}
                        maxLength={150}
                        inputMode="text"
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button id="save-button" type="submit" disabled={loading || !isModified}>
                        {loading ? "Salvando..." : "Salvar"}
                    </button>
                </form>
            </div>
        </motion.div>

    );
};

export default EditProfileModal;
