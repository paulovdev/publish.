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
      img: "/landing-images/img-1.jpg"
    },
    {
      text: "Finalmente encontrei uma plataforma que combina simplicidade com recursos avançados. Publicar meus artigos nunca foi tão fácil!",
      author: "João Matheus",
      job: "Blogger",
      img: "/landing-images/img-2.jpg"
    },
    {
      text: "A publique é o melhor lugar para qualquer pessoa que queira se expressar através da escrita.",
      author: "Carla Thomas",
      job: "Jornalista",
      img: "/landing-images/img-3.jpg"
    },
    {
      text: "Eu adoro como a publique me permite conectar com outros escritores e leitores. A plataforma é intuitiva e cheia de recursos úteis!",
      author: "Lucas Felipe",
      job: "Poeta",
      img: "/landing-images/img-4.jpg"
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
      </section>

      {/* Seção 3: Recursos Principais */}
      <section id="home-features">
        <h1>Recursos Principais</h1>
        <div className="feature-container">
          <div className="feature">
            <MdDesignServices size={32} />
            <h1>Editor de Texto Avançado</h1>
            <p>Desfrute de um editor de texto limpo e fácil de usar, com todas as ferramentas que você precisa para formatar suas publicações de forma profissional.</p>
          </div>
          <div className="feature">
            <MdDesignServices size={32} />
            <h1>Editor de Texto Avançado</h1>
            <p>Desfrute de um editor de texto limpo e fácil de usar, com todas as ferramentas que você precisa para formatar suas publicações de forma profissional.</p>
          </div>
          <div className="feature">
            <MdDesignServices size={32} />
            <h1>Editor de Texto Avançado</h1>
            <p>Desfrute de um editor de texto limpo e fácil de usar, com todas as ferramentas que você precisa para formatar suas publicações de forma profissional.</p>
          </div>
          <div className="feature">
            <RiCommunityFill size={32} />
            <h1>Comunidade Vibrante</h1>
            <p>Conecte-se com outros escritores e leitores, receba feedback e construa sua audiência.</p>
          </div>
          <div className="feature">
            <RiFunctionAddFill size={32} />
            <h1>Publicação Simples</h1>
            <p>Publique seus textos com apenas alguns cliques e alcance leitores de todo o mundo.</p>
          </div>
          <div className="feature">
            <MdDesignServices size={32} />
            <h1>Personalização</h1>
            <p>Customize o layout e o design do seu perfil e das suas publicações para refletir seu estilo pessoal.</p>
          </div>
        </div>
      </section>


      {/* Seção 4: Depoimentos */}
      <section id="home-testimonials">
        <h1>O que nossos usuários dizem</h1>
        <Swiper className="testimonials-container"
          slidesPerView={3}
          spaceBetween={25}>
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index} className="testimonial">
              <p>"{testimonial.text}"</p>
              <img src={testimonial.img} alt="" />
              <span>{testimonial.job}</span>
              <h2>{testimonial.author}</h2>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Seção 5: Como Funciona */}
      <section id="home-how-it-works">
        <h1>Como Funciona</h1>
        <p>
          Publicar na publique é simples e direto:
        </p>
        <ul>
          {howItWorksSteps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </section>

      {/* Seção 6: Chamada para Ação */}
      <section id="home-call-to-action">
        <h1>Junte-se à Comunidade publique</h1>
        <p>Comece hoje mesmo a compartilhar suas histórias e conectar-se com uma comunidade global de escritores e leitores. Não espere mais, sua voz merece ser ouvida.</p>
        <Link to={!currentUser ? "/register" : "post/create"} className="cta-button">
          Crie Sua Conta Gratuitamente
        </Link>
      </section>

      {/* Seção 7: Perguntas Frequentes (FAQ) */}
      <section id="home-faq">
        <h1>Perguntas Frequentes</h1>
        {faqItems.map((faqItem, index) => (
          <div className="faq-item" key={index}>
            <h2>{faqItem.question}</h2>
            <p>{faqItem.answer}</p>
          </div>
        ))}
      </section>
    </>
  );
};

export default FirstHome;
