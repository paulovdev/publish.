import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdVisibilityOff, MdVisibility } from 'react-icons/md';
import { useLogin } from '../../../hooks/useLogin';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Login.scss";

const Login = () => {
    const { loginUser, loading } = useLogin();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await loginUser(email, password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <section id="login">
            <ToastContainer />
            <div className="container">
                <h1>Entrar</h1>
                <p>Digite seu e-mail e senha para continuar</p>
                <div className="border-bottom"></div>
            </div>

            <form onSubmit={handleLogin}>
                <label>E-mail</label>
                <input
                    type="email"
                    name="email"
                    placeholder="Seu e-mail"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label>Senha</label>
                <div className="password-input">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Senha"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <MdVisibility size={24} /> : <MdVisibilityOff size={24} />}
                    </span>
                </div>

                <div className="no-have-account">
                    <p>Ainda não possui uma conta?</p>
                    <Link to="/register">Crie uma agora!</Link>
                </div>

                {!loading && <button className="btn">Entrar</button>}
                {loading && (
                    <button className="btn" disabled>
                        Entrando...
                    </button>
                )}
            </form>
        </section>
    );
};

export default Login;
