import React from "react";
import { Link } from "react-router-dom";
import { Blog } from "../../context/Context";

import { MdDesignServices } from "react-icons/md";
import { RiFunctionAddFill } from "react-icons/ri";
import { RiCommunityFill } from "react-icons/ri";
import { HiOutlineArrowRight } from "react-icons/hi";


import "./FirstHome.scss";

const FirstHome = () => {
  const { currentUser } = Blog();

  return (
    <>
      <section id="home-intro">
        <h1>Todo mundo tem uma história para contar.</h1>

        <p>
          Suas palavras têm um poder imensurável na internet. Aqui, você pode usá-las para inspirar, educar e conectar-se com pessoas ao redor do globo.
        </p>
        
        <div className="home-buttons">
          <Link to={!currentUser ? "/login" : "post/create"}>
            Entrar
          </Link>
          <Link to={!currentUser ? "/register" : "post/create"}>
            Comece a publicar
          </Link>
        </div>

      </section>

      <section id="home-image">
        <img src="/home-image.jpg" alt="" />
      </section>

      <section id="home-design">
        <div className="home-design-content">
          <MdDesignServices size={32} />
          <h1>Escolha o design perfeito</h1>

          <p>
            Crie um blog lindo que combine com seu estilo. Selecione um dos diversos modelos fáceis de usar, com layouts flexíveis e centenas de imagens de plano de fundo, ou crie o que quiser.
          </p>

          <Link to={!currentUser ? "/register" : "post/create"}>
            <button>Comece a publicar <HiOutlineArrowRight /></button>
          </Link>
        </div>
      </section>

      <section id="home-features">
        <div className="left-container">
          <RiFunctionAddFill size={32} />
          <h1>Funcionalidades avançadas</h1>
          <p>
            Explore ferramentas poderosas para gerenciar seu blog. Desde análise detalhada de tráfego até opções de monetização, nós oferecemos tudo o que você precisa.
          </p>

          <Link to={!currentUser ? "/register" : "post/create"}>
            <button>Comece a publicar <HiOutlineArrowRight /></button>
          </Link>
        </div>
        <div className="right-container">
          <RiCommunityFill size={32} />
          <h1>Comunidade Engajada</h1>
          <p>
            Conecte-se com uma comunidade de leitores e escritores apaixonados. Participe de discussões, compartilhe ideias e construa seu público.
          </p>

          <Link to={!currentUser ? "/register" : "post/create"}>
            <button>Comece a publicar <HiOutlineArrowRight /></button>
          </Link>
        </div>
      </section>

      <section id="home-security">
        <h1>Segurança em primeiro lugar</h1>
        <p>
          Suas informações e conteúdo estão seguros conosco. Utilizamos as mais recentes tecnologias de segurança para proteger seus dados.
        </p>
      </section>
    </>
  );
};

export default FirstHome;
