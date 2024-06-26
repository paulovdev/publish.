import React from "react";
import { Link } from "react-router-dom";
import { Blog } from "../../context/Context";

import { Swiper, SwiperSlide } from "swiper/react";

import { MdDesignServices } from "react-icons/md";
import { RiCommunityFill, RiFunctionAddFill } from "react-icons/ri";

import "./FirstHome.scss";


const FirstHome = () => {
  const { currentUser } = Blog();

  // Testimonials
  const testimonials = [
    {
      text: "A publique transformou a maneira como compartilho minhas histórias. A interface é incrível e a comunidade é muito acolhedora.",
      author: "Ana Souza",
      job: "Escritora",
      img: "/landing-images/img-1.webp"
    },
    {
      text: "Finalmente encontrei uma plataforma que combina simplicidade com recursos avançados. Publicar meus artigos nunca foi tão fácil!",
      author: "João Matheus",
      job: "Blogger",
      img: "/landing-images/img-2.webp"
    },
    {
      text: "A publique é o melhor lugar para qualquer pessoa que queira se expressar através da escrita.",
      author: "Carla Thomas",
      job: "Jornalista",
      img: "/landing-images/img-3.webp"
    },
    {
      text: "Eu adoro como a publique me permite conectar com outros escritores e leitores. A plataforma é intuitiva e cheia de recursos úteis!",
      author: "Lucas Felipe",
      job: "Poeta",
      img: "/landing-images/img-4.webp"
    }
  ];


  // How It Works steps
  const howItWorksSteps = [
    "Inscreva-se gratuitamente e personalize seu perfil.",
    "Use nosso editor intuitivo para escrever e formatar sua publicação.",
    "Publique seu texto com um clique e compartilhe com sua rede de leitores.",
    "Receba feedback, comente em outras publicações e participe da comunidade.",
  ];

  // FAQ items
  const faqItems = [
    {
      question: "É gratuito usar a publique?",
      answer: "Sim, você pode se inscrever e publicar gratuitamente. Oferecemos também planos premium com recursos adicionais.",
    },
    {
      question: "Posso importar meus textos de outras plataformas?",
      answer: "Sim, nossa ferramenta de importação facilita trazer seus textos de outras plataformas para a publique.",
    },
    {
      question: "Como posso personalizar meu perfil?",
      answer: "Você pode adicionar uma foto de perfil, escrever uma biografia e personalizar o layout do seu perfil nas configurações da conta.",
    },
    {
      question: "A publique está disponível em outros idiomas?",
      answer: "Atualmente, a publique está disponível em português e inglês, com mais idiomas a caminho.",
    },
  ];

  return (
    <>
      {/* Seção 1: Hero (Cabeçalho) */}
      <section id="home-hero">
        <h1>Todo mundo tem uma história para contar.</h1>
        <p>Bem vindo ao <span>publique</span> a plataforma ideal para escrever, compartilhar e descobrir histórias incríveis.</p>
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

      {/* Seção 2: Sobre a publique */}
      <section id="home-about">
        <h1>Sobre a <span>publique</span></h1>
        <p>
          A <span>publique</span> é uma plataforma intuitiva e poderosa, projetada para escritores de todos os níveis. Nossa aplicação permite que você crie, edite e publique seus textos com facilidade. Seja você um blogueiro, jornalista, escritor ou apenas alguém com uma história para contar, a publique é o lugar perfeito para compartilhar suas ideias com o mundo.
        </p>
       
          <Link to={!currentUser ? "/register" : "post/create"}>
            Comece a publicar
          </Link>
      
      </section>
    </>
  );
};

export default FirstHome;
