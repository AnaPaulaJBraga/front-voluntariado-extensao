import { useMemo, useState, useEffect } from "react";
import { api } from "../../services/api";
import Header from "../../components/Header/Header";
import "./Organizations.css";
import { Link } from "react-router-dom";

const STATIC_ORGANIZATIONS = [
  {
    id: 1,
    name: "Instituto Linha D'Água",
    categories: ["Meio Ambiente", "Cultura"],
    city: "Cananéia",
    uf: "SP",
    description:
      "Atuamos na conservação marinha e costeira do estuário, promovendo o fortalecimento de comunidades tradicionais e caiçaras através da pesca artesanal sustentável.",
    website: "https://www.linhadagua.org.br/",
  },
  {
    id: 2,
    name: "Quilombo Ivaporunduva (ACTC)",
    categories: ["Cultura", "Direitos Humanos"],
    city: "Eldorado",
    uf: "SP",
    description:
      "Preservamos a cultura quilombola tradicional e organizamos mutirões de agricultura orgânica de banana e pupunha, além de ações voltadas ao turismo comunitário.",
    website: "http://www.quilomboivaporunduva.org.br/",
  },
  {
    id: 3,
    name: "Instituto Socioambiental (ISA)",
    categories: ["Meio Ambiente", "Assistência Social"],
    city: "Registro",
    uf: "SP",
    description:
      "Apoiamos povos indígenas e comunidades quilombolas do Vale no manejo florestal, regularização de territórios e comercialização justa de sementes nativas. Atua também em outras localidades da região.",
    website: "https://www.socioambiental.org/",
  },
  {
    id: 4,
    name: "COOREV (Reciclagem)",
    categories: ["Meio Ambiente", "Assistência Social"],
    city: "Cajati",
    uf: "SP",
    description:
      "Promovemos a coleta seletiva e a inclusão social de catadores de materiais recicláveis, realizando também oficinas de educação ambiental em escolas locais.",
  },
  {
    id: 5,
    name: "Instituto de Pesquisas Cananéia (IPeC)",
    categories: ["Animais", "Meio Ambiente"],
    city: "Cananéia",
    uf: "SP",
    description:
      "Desenvolvemos a pesquisa científica e o monitoramento de praias para a reabilitação de animais marinhos, como tartarugas, pinguins e o boto-cinza.",
    website: "http://www.ipecpesquisa.org.br/",
  },
  {
    id: 6,
    name: "COOPERQUIVALE",
    categories: ["Cooperativa", "Cultura"],
    city: "Iporanga",
    uf: "SP",
    description:
      "Reunimos agricultores quilombolas para escoar a produção da roça tradicional, distribuindo alimentos saudáveis e orgânicos para redes de merenda escolar.",
    website: "https://www.socioambiental.org/",
  },
  {
    id: 7,
    name: "Grupo de Apoio à Adoção de Registro (GAAR)",
    categories: ["Animais", "ONG"],
    city: "Registro",
    uf: "SP",
    description:
      "Atuamos no resgate, tratamento e castração de cães e gatos abandonados, organizando feiras frequentes e campanhas digitais para a adoção responsável.",
  },
];

// IA: Referências bibliográficas no padrão ABNT do documento do projeto.
// Intuito: registrar a fonte das informações exibidas na página.
// Aplicação: renderizadas no rodapé da página; url é opcional quando o documento não informa site público.
const REFERENCES = [
  {
    id: 1,
    text: "INSTITUTO LINHA D'ÁGUA. Quem somos e atuação no estuário. Disponível em:",
    url: "https://www.linhadagua.org.br/",
    access: "06 jun. 2026",
  },
  {
    id: 2,
    text: "QUILOMBO IVAPORUNDUVA. Associação Cultural dos Tunicos e Caçulas (ACTC): história e turismo comunitário. Eldorado, SP. Disponível em:",
    url: "http://www.quilomboivaporunduva.org.br/",
    access: "06 jun. 2026",
  },
  {
    id: 3,
    text: "INSTITUTO SOCIOAMBIENTAL (ISA). Programa Vale do Ribeira: territórios, povos e conservação da Mata Atlântica. Registro, SP. Disponível em:",
    url: "https://www.socioambiental.org/",
    access: "06 jun. 2026",
  },
  {
    id: 4,
    text: "COOREV. Cooperativa de Reciclagem de Cajati: gestão de resíduos sólidos e inclusão social. Cajati, SP. Cadastro Municipal de Entidades de Logística Reversa e Triagem. Disponível via consulta pública municipal. Acesso em:",
    access: "06 jun. 2026",
  },
  {
    id: 5,
    text: "INSTITUTO DE PESQUISAS CANANÉIA (IPeC). Projetos de monitoramento da fauna costeira e conservação do boto-cinza. Cananéia, SP. Disponível em:",
    url: "http://www.ipecpesquisa.org.br/",
    access: "06 jun. 2026",
  },
  {
    id: 6,
    text: "COOPERQUIVALE. Cooperativa dos Agricultores Quilombolas do Vale do Ribeira: patrimônio imaterial da roça tradicional. Eldorado, SP. Registro institucional via Instituto Socioambiental. Disponível em:",
    url: "https://www.socioambiental.org/",
    access: "06 jun. 2026",
  },
  {
    id: 7,
    text: "GRUPO DE APOIO À ADOÇÃO DE REGISTRO (GAAR). Rede comunitária de proteção, castração e adoção de animais domésticos. Registro, SP. Registro de coletivos e associações locais de proteção animal. Acesso em:",
    access: "06 jun. 2026",
  },
];

const getEntityCategories = (entity) => {
  if (Array.isArray(entity.categories)) return entity.categories;
  return entity.sector ? [entity.sector] : [];
};

const Organizations = () => {
  // IA: Estado da categoria selecionada no filtro de botões.
  // Intuito: controlar qual área de atuação está ativa; "Todas" exibe todas as organizações.
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // IA: Estado do campo de busca textual.
  // Intuito: filtrar em tempo real conforme o usuário digita no input.
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isCurrentPage = true;

    api.get("/entities/near-me", true)
    .then((response) => {
      if (isCurrentPage) {
        setEntities(response.data);
        setIsLoading(false);
        
      }
    }).then(() => console.log(entities))
    .catch((error) => {
      if (isCurrentPage) {
        console.error(error);
        setErrorMessage("Não foi possível carregar as organizações.");
        setIsLoading(false);
      }
    });

    return () => {
      isCurrentPage = false;
    };
  }, []);

  const allOrganizations = useMemo(
    () => [
      ...entities.map((entity) => ({
        ...entity,
        source: "api",
      })),
      ...STATIC_ORGANIZATIONS.map((organization) => ({
        ...organization,
        source: "static",
      })),
    ],
    [entities],
  );

  const categories = useMemo(
    () => [
      "Todas",
      ...[
        ...new Set(
          allOrganizations.flatMap((organization) =>
            getEntityCategories(organization),
          ),
        ),
      ].sort(),
    ],
    [allOrganizations],
  );

  // IA: Lista derivada que combina filtro por categoria e busca por texto.
  // Intuito: recalcular a grade só quando search ou selectedCategory mudam (useMemo evita trabalho desnecessário a cada render).
  // filter: percorre ORGANIZATIONS e mantém apenas itens que passam nos dois critérios abaixo.
  const filteredOrganizations = useMemo(() => {
    // trim + toLowerCase: ignora espaços extras e diferença de maiúsculas/minúsculas na busca.
    const normalizedSearch = search.trim().toLowerCase();

    return allOrganizations.filter((organization) => {
      const entityCategories = getEntityCategories(organization);
      const categoryOk =
        selectedCategory === "Todas" ||
        entityCategories.includes(selectedCategory);

      const searchOk = normalizedSearch
        ? `${organization.name} ${organization.city} ${organization.uf} ${organization.sector ?? ""} ${organization.description}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      return categoryOk && searchOk;
    });
  }, [allOrganizations, search, selectedCategory]);

  return (
    <div className="organizations-page">
      <Header />

      <main className="organizations-page__layout">
        <section className="organizations-page__hero" aria-labelledby="organizations-title">
          <div>
            <h1 id="organizations-title">Organizações parceiras</h1>
            <p>
              Conheça instituições do Vale do Ribeira que cadastram oportunidades
              e mobilizam voluntários em diferentes causas sociais.
            </p>
          </div>

          <div className="organizations-page__summary" aria-label="Resumo das organizações">
            <strong>{allOrganizations.length}</strong>
            <span>organizações ativas</span>
          </div>
        </section>

        <section className="organizations-page__filters" aria-label="Filtros de organizações">
          <label htmlFor="organization-search">Buscar organização</label>
          <input
            id="organization-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, cidade, categoria ou UF"
          />

          {/* IA: Botões de filtro gerados a partir do array categories.
              Intuito: permitir filtrar por uma área de atuação (Meio Ambiente, Cultura, etc.).
              map: cria um botão por categoria; onClick atualiza selectedCategory e dispara novo cálculo em filteredOrganizations. */}
          <div className="organizations-page__cause-list" role="group" aria-label="Filtrar por categoria">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "organizations-page__cause organizations-page__cause--active"
                    : "organizations-page__cause"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {isLoading && (
          <section className="organizations-page__empty">
            <p>Carregando organizações...</p>
          </section>
        )}

        {errorMessage && (
          <section className="organizations-page__empty" role="alert">
            <p>{errorMessage}</p>
          </section>
        )}

        {!isLoading && !errorMessage && filteredOrganizations.length > 0 ? (
          <section className="organizations-page__grid" aria-label="Lista de organizações">
            {filteredOrganizations.map((organization) => (
              <article
                className="organization-card"
                key={`${organization.source}-${organization.id}`}
              >
                <div className="organization-card__avatar" aria-hidden="true">
                  {organization.name.charAt(0)}
                </div>

                <div className="organization-card__content">
                  <div className="organization-card__heading">
                    <h2>{organization.name}</h2>
                  </div>

                  <div className="organization-card__categories">
                    {getEntityCategories(organization).map((category) => (
                      <span key={category}>{category}</span>
                    ))}
                  </div>

                  <p>{organization.description}</p>

                  <div className="organization-card__meta">
                    <span>
                      {organization.city}, {organization.uf}
                    </span>
                  </div>

                  {organization.website ? (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="organization-card__button"
                    >
                      Ver organização
                    </a>
                  ) : (
                    <span className="organization-card__button organization-card__button--disabled">
                      Site indisponível
                    </span>
                  )}
                  {organization.source === "api" && (
                    <Link className="organization-card__button" to={`/entidade/${organization.slug}/sobre`}>Visualizar informações</Link>
                  )}
                </div>
              </article>
            ))}
          </section>
        ) : !isLoading && !errorMessage ? (
          <section className="organizations-page__empty">
            <p>Nenhuma organização encontrada com esses filtros.</p>
          </section>
        ) : null}

        {/* IA: Seção de referências bibliográficas (ABNT) do documento do projeto.
            Intuito: dar crédito às fontes das informações das organizações.
            map: percorre REFERENCES; url opcional monta link clicável antes da data de acesso. */}
        <section
          className="organizations-page__references"
          aria-labelledby="organizations-references-title"
        >
          <h2 id="organizations-references-title">Referências bibliográficas (padrão ABNT)</h2>
          <ol className="organizations-page__references-list">
            {REFERENCES.map((reference) => (
              <li key={reference.id}>
                {reference.text}{" "}
                {reference.url ? (
                  <a href={reference.url} target="_blank" rel="noopener noreferrer">
                    {reference.url}
                  </a>
                ) : null}{" "}
                {reference.url ? "Acesso em:" : ""} {reference.access}.
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
};

export default Organizations;
