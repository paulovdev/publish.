import React, { useState, useRef, useEffect } from 'react';
import { collection, doc, setDoc, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../firebase/Firebase';
import { Blog } from '../../context/Context';
import StepIndicators from "../../components/StepIndicators/StepIndicators"
import { Link, useNavigate } from "react-router-dom";
import { IoImageOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { AnimatePresence, motion } from 'framer-motion';
import Editor from "../../utils/Editor/Editor";


import "./CreatePostPage.scss"

const CreatePostPage = () => {
    const { currentUser } = Blog();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [topics, setTopics] = useState([]);
    const [image, setImage] = useState(null);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate()

    const [isTitleValid, setIsTitleValid] = useState(false);
    const [isPhotoValid, setIsPhotoValid] = useState(false);
    const [isDescValid, setIsDescValid] = useState(false);

    useEffect(() => {
        const fetchTopics = async () => {
            const topicsCollection = collection(db, 'topics');
            const topicsSnapshot = await getDocs(topicsCollection);
            const topicsList = topicsSnapshot.docs.map(doc => ({
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
        const options = { day: '2-digit', month: 'short' };
        const formattedDate = new Date(date).toLocaleDateString('pt-BR', options);
        return formattedDate.replace('.', '').replace(/^(\d{2})\s+de\s+(\w{3})$/, '$1 de $2');
    }

    const handleCreatePost = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            console.error('User not logged in');
            return;
        }

        if (!isTitleValid || !isPhotoValid || !isDescValid) {
            console.error('Invalid form fields');
            return;
        }

        let imageUrl = '';
        if (image) {
            const storage = getStorage();
            const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}_${image.name}`);
            await uploadBytes(storageRef, image);
            imageUrl = await getDownloadURL(storageRef);
        }

        try {
            const newPostRef = doc(collection(db, 'posts'));
            await setDoc(newPostRef, {
                userId: currentUser.uid,
                title: title,
                desc: desc,
                imageUrl: imageUrl,
                views: 0,
                likes: {},
                comments: {},
                created: formatDateToDayMonth(new Date().toISOString()),
                topics: selectedTopics.map(topic => topic.id).join(',')
            });

            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                posts: arrayUnion(newPostRef.id)
            });

            setTitle('');
            setDesc('');
            setSelectedTopics([]);
            setImage(null);

            alert('Post created successfully');
            navigate("/feed/all-posts")
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const handleSelectChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => {
            return topics.find(topic => topic.id === option.value);
        });
        setSelectedTopics(selectedOptions);
    };

    const handleNextStep = () => {
        if (currentStep < 4) {
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

    return (
        <section id="create-post">
            <Link to="/feed/all-posts" className="back">
                <IoIosArrowRoundBack size={32} />
                <p>Inicio</p>
            </Link>
            <h1>Criar postagem</h1>
            <div className="border-bottom"></div>


            <motion.div
                key={`step-indicator-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="step-indicator-container"
            >
                <StepIndicators currentStep={currentStep} />
            </motion.div>


            <form onSubmit={handleCreatePost}>

                {currentStep === 1 && (
                    <motion.div
                        key="step-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="animate-step"
                    >
                        <div className="step-title">
                            <h1>Informações Iniciais</h1>
                            <p>Preencha o título e continue.</p>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Insira o título da postagem"
                            />
                            {!isTitleValid && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 1 }}
                                    transition={{ duration: 1 }}
                                >
                                    O título deve ter pelo menos 6 letras (Restam {6 - title.length} letras)
                                </motion.p>
                            )}
                            <div className="next-prev">
                                <button type="button" className="next" onClick={handleNextStep} disabled={!isTitleValid}>
                                    Continuar
                                </button>
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
                        className="animate-step"
                    >
                        <div className="step-topic">
                            <h1>Seleção de Tópico</h1>
                            <p>Escolha o tópico do seu post.</p>
                            <select value={selectedTopics.map(topic => topic.id)} onChange={handleSelectChange}>
                                {topics.map(topic => (
                                    <option key={topic.id} value={topic.id}>
                                        {topic.name}
                                    </option>
                                ))}
                            </select>
                            <div className="next-prev">
                                <button type="button" className="prev" onClick={handlePreviousStep}>
                                    Voltar
                                </button>
                                <button type="button" className="next" onClick={handleNextStep}>
                                    Continuar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === 3 && (
                    <motion.div
                        key="step-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="animate-step"
                    >
                        <div className="step-image">
                            <h1>Seleção de Imagem</h1>
                            <p>Carregue uma imagem para o seu post.</p>
                            <div className="image-select">
                                <button type="button" className="prf-file" onClick={handleClick}>
                                    <IoImageOutline size={75} />
                                    <p>{image ? "Imagem carregada..." : ""}</p>
                                </button>
                                {image && <img width={150} src={URL.createObjectURL(image)} alt="Imagem carregada" className="preview-image" />}
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
                                <button type="button" className="prev" onClick={handlePreviousStep}>
                                    Voltar
                                </button>
                                <button type="button" className="next" onClick={handleNextStep} disabled={!isPhotoValid}>
                                    Continuar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {currentStep === 4 && (
                    <motion.div
                        key="step-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="animate-step"
                    >
                        <div className="step-text">
                            <h1>Edição de Texto</h1>
                            <p>Escreva o conteúdo do seu post.</p>
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
                                <button type="button" className="prev" onClick={handlePreviousStep}>
                                    Voltar
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="btn"
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
