import HomeHeader from "../components/HomeHeader/Header";
import Carousel from "../components/Carousel/Carousel";

// IA: Este componente About é a página principal de informações
// Serve para apresentar o objetivo, soluções e funcionamento da plataforma
const About = () => {
  // IA: Array de frases de impacto para inspirar e motivar usuários
  // Metodologia: Usar dados estáticos em array facilita manutenção e escalabilidade
  // Serves para renderizar cada frase em um card separado
  const impactPhrases = [
    "Enquanto você vê esse slide, uma pessoa está pedindo ajuda",
    "Cada clique pode salvar uma vida",
    "Só você pode fazer a diferença",
    "Juntos somos mais fortes",
  ];

  return (
    // IA: Wrapper principal da página com classe "about-page"
    // Funciona como container para toda estrutura e aplica background e estilos globais
    <div className="about-page">
      <HomeHeader />
      
      {/* IA: Seção dedicada ao carousel e frases de impacto
          Metodologia: Separação de concerns - carousel, frases e conteúdo em seções distintas
          Serves para organizar visualmente e aplicar estilos específicos */}
      <div className="about-carousel-section">
        <Carousel />
        
        {/* IA: Container de frases de impacto com grid responsivo
            Funciona com map() para renderizar cada frase em um card com animação hover
            Serves para criar efeito visual atraente e motivacional */}
        <div className="impact-phrases">
          {impactPhrases.map((phrase, index) => (
            <div key={index} className="impact-item">
              <span className="impact-text">{phrase}</span>
            </div>
          ))}
        </div>
      </div>

      {/* IA: Seção principal de conteúdo com classe "about-content"
          Metodologia: Estrutura semântica com múltiplos títulos (h1, h2)
          Serves para apresentar informações de forma hierárquica e acessível */}
      <section className="about-content">
        
        {/* IA: Título principal com classe especial para sublinha decorativa
            Funciona como h1 e estabelece hierarquia de conteúdo */}
        <h1 className="about-title">Objetivo</h1>

        {/* IA: Container de parágrafos com estrutura modular
            Metodologia: Múltiplos parágrafos em div única facilita gestão de espaçamento
            Serves para manter consistência visual entre seções */}
        <div className="about-paragraphs">
          <p>
            {/* IA: Uso de <mark> para destacar texto importante visualmente
                Funciona com background color gradiente no CSS
                Serves para guiar olho do leitor aos pontos-chave */}
            Nosso objetivo é funcionar como uma <mark>ponte na internet</mark>, ligando quem quer ajudar direto com as{" "}
            {/* IA: Uso de <strong> para negrito semântico
                Metodologia: Semântica HTML - strong indica importância
                Serves para enfatizar informação crítica */}
            <strong>ONGs e projetos do seu bairro ou cidade</strong> que precisam de braços para trabalhar. Hoje em dia, existem <strong>milhares de pequenas organizações</strong> fazendo trabalhos incríveis perto de você — como cuidar de idosos ou limpar praias —, mas que <mark>quase ninguém conhece</mark> porque elas não têm redes sociais fortes ou sites para se divulgar.
          </p>

          <p>
            Essa é a nossa realidade: <strong>a vontade de ajudar existe</strong> e o trabalho a ser feito também, mas <mark>os dois lados não conseguem se encontrar</mark>. Foi por isso que criamos este projeto. Nós resolvemos esse problema <strong>juntando tudo em um só lugar</strong>, onde você consegue ver os eventos da sua região, escolher a causa que toca o seu coração e se inscrever em apenas um clique para <strong>começar a mudar o mundo</strong>.
          </p>
        </div>

        {/* IA: Segundo título com classe secundária para tamanho menor
            Funciona com ::after pseudo-elemento para sublinha decorativa
            Serves para manter padrão visual mas com hierarquia diferente */}
        <h2 className="about-title-secondary">O que solucionamos</h2>

        <div className="about-paragraphs">
          <p>
            Muitas <strong>ONGs enfrentam dificuldades</strong> para divulgar suas necessidades. Elas precisam encontrar <mark>pessoas disponíveis</mark> que queiram contribuir com suas causas. Do outro lado, pessoas interessadas em fazer <strong>trabalho voluntário</strong> não conseguem encontrar oportunidades certas para elas.
          </p>

          <p>
            Por isso, criamos uma <mark>plataforma centralizada</mark>. Ela conecta essas duas pontas, facilitando a comunicação, aumentando o alcance das ações sociais e incentivando mais gente a participar de <strong>projetos de impacto social</strong>.
          </p>
        </div>

        {/* IA: Terceiro título seguindo mesmo padrão das seções anteriores
            Metodologia: Consistência visual e estrutural - reutiliza className about-title-secondary
            Serves para organizar conteúdo em tópicos principais */}
        <h2 className="about-title-secondary">Como funciona</h2>

        <div className="about-paragraphs">
          <p>
            Nossa plataforma é um <strong>sistema web simples e acessível</strong>. Os <mark>voluntários</mark> podem se cadastrar, criar um perfil com suas informações e buscar oportunidades de voluntariado disponíveis na sua região.
          </p>

          <p>
            As <strong>ONGs também têm seu espaço</strong>: elas podem cadastrar suas instituições, <mark>criar e gerenciar oportunidades</mark> de voluntariado, além de visualizar os candidatos interessados em ajudar suas causas. Tudo de forma prática e organizada.
          </p>
        </div>

        {/* IA: Seção de Informações com dados e estudos relevantes
            Metodologia: Estrutura organizada por categorias com links clicáveis
            Serves para fundamentar a importância da plataforma com dados reais */}
        <h2 className="about-title-secondary">Informações</h2>

        {/* IA: Dados sobre voluntariado - primeira categoria */}
        <div className="info-section">
          <h3 className="info-category-title">📈 Dados sobre o Apagão do Voluntariado e Visibilidade</h3>
          <div className="info-items">
            <div className="info-item">
              <strong>57 Milhões de Voluntários Ativos no Brasil</strong>
              <p>A pesquisa IDIS/Datafolha aponta o potencial gigantesco, mas também o desconhecimento de canais práticos.</p>
              <a href="https://www.idis.org.br/o-brasil-conta-com-57-milhoes-de-voluntarios-ativos-segundo-pesquisa-voluntariado-no-brasil-2021/" target="_blank" rel="noopener noreferrer" className="info-link">
                Acesse o estudo completo →
              </a>
            </div>

            <div className="info-item">
              <strong>Desafios de Visibilidade das Pequenas ONGs</strong>
              <p>O Mapa das OSCs do Ipea detalha como centenas de pequenas organizações lutam contra invisibilidade.</p>
              <a href="https://mapaosc.ipea.gov.br/sobre" target="_blank" rel="noopener noreferrer" className="info-link">
                Conheça o Mapa das OSCs →
              </a>
            </div>

            <div className="info-item">
              <strong>7,2 Milhões de Pessoas em Trabalho Voluntário</strong>
              <p>Dados oficiais do IBGE mostram o panorama de quem já dedica tempo a ações sociais desinteressadas.</p>
              <a href="https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/24268-pais-tem-7-2-milhoes-de-pessoas-que-fazem-trabalho-voluntario" target="_blank" rel="noopener noreferrer" className="info-link">
                Veja as estatísticas do IBGE →
              </a>
            </div>

            <div className="info-item">
              <strong>Mais da Metade dos Brasileiros Quer Ajudar</strong>
              <p>O Itaú Social destaca que alimentação e apoio comunitário são as causas mais urgentes para os brasileiros.</p>
              <a href="https://www.itausocial.org.br/noticias/estudo-mostra-que-mais-da-metade-dos-brasileiros-ja-realizou-acao-voluntaria/" target="_blank" rel="noopener noreferrer" className="info-link">
                Leia o estudo Itaú Social →
              </a>
            </div>
          </div>
        </div>

        {/* IA: Dados sobre meio ambiente - segunda categoria */}
        <div className="info-section">
          <h3 className="info-category-title">🌍 Dados sobre a Crise de Resíduos e Meio Ambiente</h3>
          <div className="info-items">
            <div className="info-item">
              <strong>1,3 Milhão de Toneladas de Plástico nos Oceanos</strong>
              <p>O Brasil joga essa quantidade nos mares anualmente. 1 em cada 10 animais marinhos que ingerem plástico morre.</p>
              <a href="https://brasil.oceana.org/campanhas/combate-a-poluicao-marinha-por-plasticos/" target="_blank" rel="noopener noreferrer" className="info-link">
                Conheça a campanha Oceana Brasil →
              </a>
            </div>

            <div className="info-item">
              <strong>8% do Plástico Global Vem do Brasil</strong>
              <p>O Instituto Humanitas Unisinos alerta para a responsabilidade brasileira na epidemia de plástico.</p>
              <a href="https://www.ihu.unisinos.br/categorias/644951-brasil-descarta-8-de-todo-o-plastico-que-chega-aos-oceanos" target="_blank" rel="noopener noreferrer" className="info-link">
                Leia a matéria completa →
              </a>
            </div>

            <div className="info-item">
              <strong>80 Milhões de Toneladas de Plástico nos Mares</strong>
              <p>O Jornal da USP detalha a urgência de ações locais de limpeza urbana e mutirões de coleta.</p>
              <a href="https://jornal.usp.br/radio-usp/existem-mais-de-80-milhoes-de-toneladas-de-plastico-no-mar-mas-o-total-de-residuos-e-ainda-maior/" target="_blank" rel="noopener noreferrer" className="info-link">
                Acesse o artigo da Rádio USP →
              </a>
            </div>
          </div>
        </div>

        {/* IA: Dados sobre envelhecimento - terceira categoria */}
        <div className="info-section">
          <h3 className="info-category-title">👴 Dados sobre a Solidão e o Envelhecimento</h3>
          <div className="info-items">
            <div className="info-item">
              <strong>Idosos Isolados: 68% Mais Chances de Hospitalização</strong>
              <p>O Ipea mostra o impacto dramático da solidão crônica na saúde e na saúde mental de idosos.</p>
              <a href="https://repositorio.ipea.gov.br/bitstreams/948d9902-e771-4dd8-9773-4c6a7d78210f/download" target="_blank" rel="noopener noreferrer" className="info-link">
                Consulte o estudo técnico Ipea →
              </a>
            </div>

            <div className="info-item">
              <strong>Solidão e Depressão na População Idosa</strong>
              <p>Pesquisas da UFMG correlacionam isolamento com altos índices de depressão, demandando redes de apoio urgentes.</p>
              <a href="https://www.medicina.ufmg.br/numero-de-brasileiros-com-50-anos-ou-mais-em-solidao-na-pandemia-foi-menor-do-que-antes-dela/" target="_blank" rel="noopener noreferrer" className="info-link">
                Veja o artigo da UFMG →
              </a>
            </div>

            <div className="info-item">
              <strong>Isolamento Social é Prioridade de Saúde Pública Global</strong>
              <p>A OMS e OPAS tratam a solidão na terceira idade como emergência equivalente a grandes doenças.</p>
              <a href="https://www.paho.org/pt/noticias/3-5-2021-isolamento-social-e-solidao-entre-pessoas-idosas-devem-ser-reconhecidos-como" target="_blank" rel="noopener noreferrer" className="info-link">
                Leia o comunicado OPAS/OMS →
              </a>
            </div>
          </div>
        </div>

        {/* IA: Informações motivacionais - quarta categoria */}
        <div className="info-section info-section-highlight">
          <h3 className="info-category-title">💡 Por Que Você Deveria Participar</h3>
          <div className="info-items">
            <div className="info-item">
              <strong>🏥 Benefício para Sua Saúde</strong>
              <p>Ajudar o próximo faz bem para quem ajuda. O voluntariado diminui estresse, melhora a saúde do coração e combate depressão e ansiedade.</p>
            </div>

            <div className="info-item">
              <strong>⏱️ Apenas 2 Horas por Mês</strong>
              <p>Você não precisa mudar sua rotina. Doe apenas 2 horas de um sábado por mês para uma limpeza de praia ou para jogar baralho com idosos. O impacto será gigantesco.</p>
            </div>

            <div className="info-item">
              <strong>✨ Sem Burocracia</strong>
              <p>Chega de processos complicados. No nosso site você escolhe o dia, clica em participar e pronto. A ONG já vai estar te esperando de braços abertos.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
