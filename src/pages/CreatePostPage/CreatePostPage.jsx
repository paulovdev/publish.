import React, { useState, useRef, useEffect } from "react";
import {
    collection,
    doc,
    setDoc,
    getDocs,
    updateDoc,
    arrayUnion,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebase/Firebase";
import { Blog } from "../../context/Context";
import { useNavigate } from "react-router-dom";

import { IoImageOutline } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { motion } from "framer-motion";

import Editor from "../../utils/Editor/Editor";
import "./CreatePostPage.scss";

const CreatePostPage = () => {
    const { currentUser } = Blog();
    const [title, setTitle] = useState("");
    const [subTitle, setSubTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [topics, setTopics] = useState([]);
    const [image, setImage] = useState(null);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();

    const [isTitleValid, setIsTitleValid] = useState(false);
    const [isPhotoValid, setIsPhotoValid] = useState(false);
    const [isDescValid, setIsDescValid] = useState(false);

    useEffect(() => {
        const fetchTopics = async () => {
            const topicsCollection = collection(db, "topics");
            const topicsSnapshot = await getDocs(topicsCollection);
            const topicsList = topicsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTopics(topicsList);
        };

        fetchTopics();
    }, []);

    const imageRef = useRef(null);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
            setIsPhotoValid(true);
        }
    };

    const handleClick = () => {
        imageRef.current.click();
    };

    function formatDateToDayMonth(date) {
        const options = { day: "2-digit", month: "short" };
        const formattedDate = new Date(date).toLocaleDateString("pt-BR", options);
        return formattedDate
            .replace(".", "")
            .replace(/^(\d{2})\s+de\s+(\w{3})$/, "$1 de $2");
    }

    const handleCreatePost = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            console.error("User not logged in");
            return;
        }

        if (!isTitleValid || !isPhotoValid || !isDescValid) {
            console.error("Invalid form fields");
            return;
        }

        let imageUrl = "";
        if (image) {
            const storage = getStorage();
            const storageRef = ref(
                storage,
                `posts/${currentUser.uid}/${Date.now()}_${image.name}`
            );
            await uploadBytes(storageRef, image);
            imageUrl = await getDownloadURL(storageRef);
        }

        try {
            const newPostRef = doc(collection(db, "posts"));
            await setDoc(newPostRef, {
                userId: currentUser.uid,
                title: title,
                subTitle: subTitle,
                desc: desc,
                imageUrl: imageUrl,
                views: 0,
                likes: {},
                comments: {},
                created: formatDateToDayMonth(new Date().toISOString()),
                topics: selectedTopics.map((topic) => topic.id).join(","),
            });

            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                posts: arrayUnion(newPostRef.id),
            });


            // Limpar os campos do formulário e navegar para a página de todos os posts
            setTitle("");
            setSubTitle("");
            setDesc("");
            setSelectedTopics([]);
            setImage(null);

            navigate(`/view-post/${newPostRef.id}`);
        } catch (error) {
            console.error("Erro ao criar post:", error);
        }
    };

    const handleSelectChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => {
            return topics.find((topic) => topic.id === option.value);
        });
        setSelectedTopics(selectedOptions);
    };

    const handleNextStep = () => {
        if (currentStep < 2) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    useEffect(() => {
        setIsTitleValid(title.length >= 6);
    }, [title]);

    useEffect(() => {
        setIsDescValid(desc.trim().length > 0);
    }, [desc]);

    const clearInput = (input) => {
        switch (input) {
            case "title":
                setTitle("");
                break;
            case "subTitle":
                setSubTitle("");
                break;
            default:
                break;
        }
    };

    return (
        <section id="create-post">
            <div className="head-text">
                <h1>Informações sobre a postagem</h1>
            </div>

            <form onSubmit={handleCreatePost}>
                {currentStep === 1 && (
                    <motion.div
                        key="step-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="create-post-container"
                    >
                        <div className="grid-column">
                            <div className="input-container text-input">
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder=" "
                                />
                                <label>Título</label>
                                {title && (
                                    <span onClick={() => clearInput("title")}>
                                        <IoCloseOutline size={24} />
                                    </span>
                                )}
                            </div>
                            <div className="input-container text-input sub-text-input">
                                <input
                                    type="text"
                                    required
                                    value={subTitle}
                                    onChange={(e) => setSubTitle(e.target.value)}
                                    placeholder=" "
                                />
                                <label>Sub título</label>
                                {subTitle && (
                                    <span onClick={() => clearInput("subTitle")}>
                                        <IoCloseOutline size={24} />
                                    </span>
                                )}

                            </div>

                        </div>

                        <div className="grid-flex">
                            <div className="step-topic">
                                <label>Tópico</label>
                                <select
                                    value={selectedTopics.map((topic) => topic.id)}
                                    onChange={handleSelectChange}
                                >
                                    {topics.map((topic) => (
                                        <option key={topic.id} value={topic.id}>
                                            {topic.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="step-image">
                                <label>Selecione uma Imagem</label>
                                <div className="image-select">
                                    <button
                                        type="button"
                                        className="prf-file"
                                        onClick={handleClick}
                                    >
                                        <IoImageOutline size={75} />
                                        <p>{image ? 'Imagem carregada...' : ''}</p>
                                    </button>
                                    {image && (
                                        <img
                                            width={150}
                                            src={URL.createObjectURL(image)}
                                            alt="Imagem carregada"
                                            className="preview-image"
                                        />
                                    )}
                                </div>

                                <input
                                    onChange={handleImageChange}
                                    ref={imageRef}
                                    type="file"
                                    hidden
                                />
                                {!isPhotoValid && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        A imagem é obrigatória
                                    </motion.p>
                                )}

                                <div className="next-prev">
                                    <button
                                        type="button"
                                        className="next"
                                        onClick={handleNextStep}
                                        disabled={!isTitleValid}
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div
                        key="step-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="create-post-container"
                    >
                        <div className="step-text">
                            <label>Edição de Texto</label>
                            <Editor
                                placeholder="Escreva sobre o que quiser e compartilhe o seu conhecimento..."
                                value={desc}
                                onChange={setDesc}
                            />
                            {!isDescValid && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    O conteúdo do post é obrigatório
                                </motion.p>
                            )}
                            <div className="next-prev">
                                <button
                                    type="button"
                                    className="prev"
                                    onClick={handlePreviousStep}
                                >
                                    Voltar
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="save-btn"
                                title="Salvar"
                                disabled={!isTitleValid || !isPhotoValid || !isDescValid}
                            >
                                <div className="icon-content">
                                    <FaSave size={26} />
                                </div>
                                <p>Publicar</p>
                            </button>
                        </div>
                    </motion.div>
                )}
            </form>
        </section>
    );
};

export default CreatePostPage;
