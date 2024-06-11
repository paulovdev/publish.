import React, { useState } from 'react';
import { useRegister } from '../../../hooks/useRegister';
import { Link, useNavigate } from 'react-router-dom';

import "./Register.scss";

const Register = () => {
    const { registerUser, error, loading } = useRegister();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault();
        await registerUser({
            name,
            email,
            password,
            bio,
            profilePicture: "public/logo-publish.png",
        });
        navigate('/get-started/topics');
    };

    return (
        <section id='register'>
            <div className="container">
                <h1>Cadastre-se</h1>
                <p>Preencha os campos abaixo para criar uma nova conta</p>
                <div className="border-bottom"></div>
            </div>
            <form onSubmit={handleRegister}>
                <label>Nome</label>
                <input
                    type="text"
                    required
                    placeholder="Nome"
                    minLength={6}
                    maxLength={24}
                    inputMode="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <label>E-mail</label>
                <input
                    type="email"
                    name="email"
                    minLength={1}
                    placeholder="Example@email.com"
                    required
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label>Senha</label>
                <input
                    type="password"
                    name="password"
                    placeholder="Senha"
                    minLength={6}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <label>Biografia</label>
                <input
                    type="text"
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />

                <div className="no-have-account">
                    <p>Já tem uma conta?</p>
                    <Link to="/login">Faça login</Link>
                </div>
                {!loading && <button type="submit" className="btn">Continuar</button>}
                {loading && (
                    <button className="btn" disabled>
                        Cadastrando...
                    </button>
                )}
                {error && <span className="error">Ocorreu um erro. Tente novamente mais tarde.</span>}
            </form>
        </section>
    );
};

export default Register;
