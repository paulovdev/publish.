import React, { useState } from "react";
import { useRegister } from "../../../hooks/useRegister";
import { Link, useNavigate } from "react-router-dom";

import "./Register.scss";

const Register = () => {
  const { registerUser, error, loading } = useRegister();
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
    navigate("/get-started/topics");
  };

  return (
    <section id="register">
      <div className="container">
        <h1>Cadastre-se</h1>
        <p>Preencha os campos abaixo para criar uma nova conta</p>
        <div className="border-bottom"></div>
      </div>
      <div className="register-container">
        <div className="left-container">
          <form onSubmit={handleRegister}>

            <label>Nome <span>*</span></label>
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
            <label>E-mail <span>*</span></label>
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
            <label>Senha <span>*</span></label>
            <input
              type="password"
              name="password"
              placeholder="Senha"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label>Confirmar senha <span>*</span></label>
            <input
              type="password"
              name="password"
              placeholder="Confirme sua senha"
              minLength={6}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label>Biografia <span>*</span></label>
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
            {!loading && (
              <button type="submit" className="btn">
                Continuar
              </button>
            )}
            {loading && (
              <button className="btn" disabled>
                Cadastrando...
              </button>
            )}
            {error && (
              <span className="error">
                Ocorreu um erro. Tente novamente mais tarde.
              </span>
            )}
          </form>
        </div>
        <div className="right-container">
          <img src="/sign-up-svg.png" alt="" />
        </div>
      </div>
    </section>
  );
};

export default Register;
