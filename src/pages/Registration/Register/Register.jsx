import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../../../hooks/useRegister";
import { ToastContainer } from "react-toastify";
import { MdVisibilityOff, MdVisibility } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import { useQueryClient } from "react-query";
import "react-toastify/dist/ReactToastify.css";
import "./Register.scss";

const Register = () => {
  const { registerUser, error, loading } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.log("As senhas não coincidem");
      return;
    }

    await registerUser({
      name,
      email,
      password,
      confirmPassword,
      bio,
      profilePicture: "public/logo-publish.png",
    });
    queryClient.invalidateQueries("users")
    navigate("/get-started/topics");
  };

  const clearInput = (input) => {
    switch (input) {
      case "name":
        setName("");
        break;
      case "bio":
        setBio("");
        break;
      default:
        break;
    }
  };

  const goToLogin = () => {
    navigate("/login")
  }

  return (
    <section id="register">
      <ToastContainer />
      <h1>Complete os campos abaixo para criar sua conta</h1>
      <form onSubmit={handleRegister}>
        <div className="grid-1">

          <div className="input-container text-input">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
            />
            <label>Nome</label>
            {name && (
              <span onClick={() => clearInput("name")}>
                <IoCloseOutline size={24} />
              </span>
            )}
          </div>

          <div className="input-container">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
            />
            <label>E-mail</label>
          </div>
        </div>

        <div className="grid-1">
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

          <div className="input-container password-input">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=" "
            />
            <label>Confirmar senha</label>
            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <MdVisibility size={24} />
              ) : (
                <MdVisibilityOff size={24} />
              )}
            </span>
          </div>
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
            <span onClick={() => clearInput("bio")}>
              <IoCloseOutline size={24} />
            </span>
          )}
        </div>


        <div className="cient-text">
          <p >Eu li, estou ciente das condições de tratamento dos meus dados pessoais e dou meu consentimento, quando aplicável, conforme descrito nesta <a>Politica de Privacidade</a></p>

        </div>
        <div className="buttons-register-wrapper">
          <div className="button-register-wrapper" onClick={goToLogin}>
            <button type="button" className="btn">Já tenho uma conta</button>
          </div>
          <div className="button-register-wrapper">
            {!loading && <button className="btn">Continuar</button>}
            {loading && (
              <button className="btn" disabled>
                <div className="loading-container">
                  <div className="loading"></div>
                </div>
              </button>
            )}</div>
        </div>
        {error && (
          <span className="error">
            Ocorreu um erro. Tente novamente mais tarde.
          </span>
        )}
      </form>
    </section >
  );
};

export default Register;
