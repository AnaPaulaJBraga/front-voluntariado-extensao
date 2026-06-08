import { useState, useEffect } from "react";
import slide1 from "../../assets/slidesCarousel/1.png";
import slide2 from "../../assets/slidesCarousel/2.png";
import slide3 from "../../assets/slidesCarousel/3.png";
import "./Carousel.css";

// IA: Componente Carousel - Slideshow automático com navegação manual
// Metodologia: Reutilizável, funcional e com controle completo do usuário
// Serves para exibir múltiplas imagens com rotação automática e botões de navegação
const Carousel = () => {
  // IA: Hook useState para gerenciar o índice do slide atual
  // Funciona como state local do componente - permite re-render ao mudar
  const [currentSlide, setCurrentSlide] = useState(0);

  // IA: Array de slides - cada elemento é um caminho de imagem
  // Metodologia: Dados em array facilita iteração e reutilização
  // Serves para centralizar fonte de dados das imagens
  const slides = [slide1, slide2, slide3];

  // IA: Hook useEffect para autoplay do carousel
  // Metodologia: useEffect com intervalo para atualizar slide a cada 4500ms
  // Funciona automaticamente - dispara quando o componente monta
  // Serves para criar o efeito de slideshow automático contínuo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    // IA: Cleanup function - remove o intervalo ao desmontar o componente
    // Funciona para prevenir memory leaks e múltiplos intervalos rodando
    // Serves para limpeza de recursos quando componente é destruído
    return () => clearInterval(interval);
  }, [slides.length]);

  // IA: Função para avançar slide manualmente
  // Metodologia: Usa módulo (%) para criar loop infinito
  // Funciona passando para o próximo slide ou volta ao primeiro se for o último
  // Serves para ligação com botão "Next"
  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // IA: Função para voltar slide manualmente
  // Metodologia: Subtrai 1 e soma length para evitar números negativos
  // Funciona passando para o slide anterior ou vai ao último se for o primeiro
  // Serves para ligação com botão "Prev"
  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // IA: Função para ir direto a um slide específico
  // Metodologia: Recebe índice e atualiza state diretamente
  // Funciona quando usuário clica em um dos dots (pontos) abaixo
  // Serves para navegação direta via indicadores visuais
  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    // IA: Container principal do carousel com classe wrapper
    // Funciona como flex column - alinha elementos verticalmente
    // Serves para estruturar carousel e dots em camadas
    <div className="carousel-container">
      
      {/* IA: Wrapper da imagem e botões - posicionamento relativo
          Funciona como contenedor para posicionar botões de forma absoluta dentro
          Serves como contexto de posicionamento para elementos filhos */}
      <div className="carousel-wrapper">
        
        {/* IA: Imagem do slide atual com transition suave
            Funciona mostrando apenas currentSlide do array
            Serve para exibir conteúdo visual principal do carousel */}
        <img
          src={slides[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          className="carousel-image"
        />

        {/* IA: Botão Previous - posicionado absolutamente à esquerda
            Funciona chamando handlePrev ao clicar
            Serves para navegação manual para o slide anterior */}
        <button className="carousel-btn carousel-prev" onClick={handlePrev}>
          ❮
        </button>

        {/* IA: Botão Next - posicionado absolutamente à direita
            Funciona chamando handleNext ao clicar
            Serves para navegação manual para o próximo slide */}
        <button className="carousel-btn carousel-next" onClick={handleNext}>
          ❯
        </button>
      </div>

      {/* IA: Container dos dots (indicadores) - renderizados dinamicamente
          Metodologia: Usa map() para criar um dot para cada slide
          Funciona com flex e gap para distribuir horizontalmente
          Serves para navegação visual e indicação do slide ativo */}
      <div className="carousel-dots">
        {slides.map((_, index) => (
          // IA: Cada dot individual com classe dinâmica 'active'
          // Funciona adicionando classe active quando index === currentSlide
          // Serves para destacar visualmente qual slide está sendo exibido
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
