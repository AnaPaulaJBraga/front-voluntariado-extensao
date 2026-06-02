import { useMemo, useState } from "react";
import HomeHeader from "../../components/HomeHeader/HomeHeader";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import OpportunityCard from "../../components/OpportunityCard/OpportunityCard";
import "./Home.css";
import { api } from "../../services/api";

const OPPORTUNITIES = [
  {
    id: 1,
    title: "Aulas de Reforço Escolar",
    cause: "Educação",
    mode: "Presencial",
    city: "São Paulo",
    location: "São Paulo, SP",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Plantio de Árvores",
    cause: "Meio Ambiente",
    mode: "Presencial",
    city: "Rio de Janeiro",
    location: "Rio de Janeiro, RJ",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Apoio a Idosos",
    cause: "Saúde",
    mode: "Híbrido",
    city: "Belo Horizonte",
    location: "Belo Horizonte, MG",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    title: "Distribuição de Alimentos",
    cause: "Assistência Social",
    mode: "Presencial",
    city: "Curitiba",
    location: "Curitiba, PR",
    image:
      "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    title: "Mentoria Online",
    cause: "Educação",
    mode: "Remoto",
    city: "Remoto",
    location: "Remoto - Todo Brasil",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    title: "Limpeza de Praias",
    cause: "Meio Ambiente",
    mode: "Presencial",
    city: "Florianópolis",
    location: "Florianopolis, SC",
    image:
      "https://images.unsplash.com/photo-1618477462146-050d2767eac4?auto=format&fit=crop&w=900&q=80",
  },
];

const Home = () => {
  const [selectedCauses, setSelectedCauses] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("Presencial");
  const [city, setCity] = useState("");

  const filteredOpportunities = useMemo(() => {
    return OPPORTUNITIES.filter((item) => {
      const causeOk =
        selectedCauses.length === 0 || selectedCauses.includes(item.cause);
      const activityOk = selectedActivity
        ? item.mode === selectedActivity
        : true;
      const cityOk = city
        ? item.city.toLowerCase().includes(city.trim().toLowerCase())
        : true;

      return causeOk && activityOk && cityOk;
    });
  }, [selectedCauses, selectedActivity, city]);

  const handleToggleCause = (cause) => {
    setSelectedCauses((current) =>
      current.includes(cause)
        ? current.filter((item) => item !== cause)
        : [...current, cause],
    );
  };

  const handleClearFilters = () => {
    setSelectedCauses([]);
    setSelectedActivity("Presencial");
    setCity("");
  };

  const handleTestApi = async () => {
    const body = {
      nome: "Ana",
      email: "teste@teste.com",
      senha: "senha123",
      data_nasc: "2026-05-15",
      cidade: "Cidade de Teste",
      uf: "SP",
      admin: false,
    };

    try {
      const response = await api.post("/auth/register", body);
      console.log("Teste API resposta:", response);
    } catch (error) {
      console.error("Erro ao testar API:", error);
    }
  };

  return (
    <div className="home-page">
      <HomeHeader />

      <main className="home-page__layout">
        <FilterSidebar
          selectedCauses={selectedCauses}
          selectedActivity={selectedActivity}
          city={city}
          onToggleCause={handleToggleCause}
          onActivityChange={setSelectedActivity}
          onCityChange={setCity}
          onClear={handleClearFilters}
        />

        <section className="home-page__content" id="oportunidades">
          <header className="home-page__title-wrap">
            <h1>Oportunidades de Voluntariado</h1>
            <p>Encontre a causa perfeita para você</p>
          </header>

          <section className="home-page__api-test">
            <button
              type="button"
              className="home-page__api-button"
              onClick={handleTestApi}
            >
              Testar API
            </button>
          </section>

          {filteredOpportunities.length > 0 ? (
            <div className="home-page__grid">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              ))}
            </div>
          ) : (
            <div className="home-page__empty">
              <p>Nenhuma oportunidade encontrada para este filtro.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
