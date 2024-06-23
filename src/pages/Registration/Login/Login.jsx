import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdVisibilityOff, MdVisibility } from "react-icons/md";
import { useLogin } from "../../../hooks/useLogin";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.scss";

const Login = () => {
  const { loginUser, loading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await loginUser(email, password);
    if (success) {
      navigate("/");
    }
  };

  const goToRegister = () => {
    navigate("/register")
  }

  return (
    <section id="login">
      <ToastContainer />
      <div className="head-text">
        <h1>Complete os campos abaixo para acessar sua conta</h1>
      </div>
      <form onSubmit={handleLogin}>

        <div className="input-container">
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
          />
          <label>E-mail</label>
        </div>
        <div className="input-container password-input">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=" "
          />
          <label>Senha</label>
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <MdVisibility size={24} />
            ) : (
              <MdVisibilityOff size={24} />
            )}
          </span>

        </div>

        <div className="buttons-login-wrapper">
          <div className="button-login-wrapper" onClick={goToRegister}>
            <button type="button" className="btn">Não tenho conta</button>
          </div>
          <div className="button-login-wrapper">
            {!loading && <button className="btn">Entrar</button>}
            {loading && (
              <button className="btn" disabled>
                <div className="loading-container">
                  <div className="loading"></div>
                </div>
              </button>
            )}</div>
        </div>
      </form>
    </section>
  );
};

export default Login;
