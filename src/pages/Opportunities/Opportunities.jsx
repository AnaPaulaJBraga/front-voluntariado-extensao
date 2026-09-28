import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import OpportunityCard from "../../components/OpportunityCard/OpportunityCard";
import { branches } from "../../constants/branches";
import { modalities } from "../../constants/modalities";
import { api } from "../../services/api";
import "./Opportunities.css";

const BRANCH_IMAGE = {
  animals:
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  environment:
    "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80",
  education:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  health:
    "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
  social_assistance:
    "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=900&q=80",
  elderly:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  children_and_teens:
    "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=900&q=80",
  inclusion:
    "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=900&q=80",
  culture_and_art:
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80",
  sports:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
  technology:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  humanitarian_aid:
    "https://images.unsplash.com/photo-1469571486292-b53601020b73?auto=format&fit=crop&w=900&q=80",
  community:
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
  events:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
};

const ACTIVITY_TO_MODALITY = {
  Presencial: "in_person",
  Remota: "remote",
};

const toOpportunityProps = (vacancy) => ({
  id: vacancy.id,
  title: vacancy.title,
  cause:
    branches.find((b) => b.value === vacancy.branch)?.label ?? vacancy.branch,
  mode:
    modalities.find((m) => m.value === vacancy.modality)?.label ??
    vacancy.modality,
  city: vacancy.city ?? "Remoto",
  location: vacancy.city
    ? `${vacancy.city}, ${vacancy.uf}`
    : "Remoto - Todo Brasil",
  image: BRANCH_IMAGE[vacancy.branch] ?? "",
});

const Opportunities = () => {
  const [selectedCauses, setSelectedCauses] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [city, setCity] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");
  const [vacancies, setVacancies] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(city), 400);
    return () => clearTimeout(timer);
  }, [city]);

  useEffect(() => {
    let isCurrentPage = true;
    const params = new URLSearchParams();
    const modality = ACTIVITY_TO_MODALITY[selectedActivity];
    if (modality) params.set("modality", modality);
    if (debouncedCity.trim()) params.set("city", debouncedCity.trim());
    const qs = params.toString();

    api
      .get(`/vacancies/${qs ? `?${qs}` : ""}`)
      .then((response) => {
        if (isCurrentPage) {
          setVacancies(response.data);
          setStatus({ loading: false, error: "" });
        }
      })
      .catch(() => {
        if (isCurrentPage) {
          setStatus({ loading: false, error: "Não foi possível carregar as oportunidades." });
        }
      });

    return () => {
      isCurrentPage = false;
    };
  }, [selectedActivity, debouncedCity]);

  const isLoading = status.loading;
  const errorMessage = status.error;

  const filteredVacancies = useMemo(() => {
    if (selectedCauses.length === 0) return vacancies;
    const selectedBranches = selectedCauses
      .map((cause) => branches.find((b) => b.label === cause)?.value)
      .filter(Boolean);
    return vacancies.filter((v) => selectedBranches.includes(v.branch));
  }, [vacancies, selectedCauses]);

  const opportunities = useMemo(
    () => filteredVacancies.map(toOpportunityProps),
    [filteredVacancies],
  );

  const handleToggleCause = (cause) => {
    setSelectedCauses((current) =>
      current.includes(cause)
        ? current.filter((c) => c !== cause)
        : [...current, cause],
    );
  };

  const handleClearFilters = () => {
    setSelectedCauses([]);
    setSelectedActivity("");
    setCity("");
  };

  return (
    <div className="home-page">
      <Header />

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

          {isLoading && (
            <p className="home-page__status">Carregando oportunidades...</p>
          )}

          {errorMessage && (
            <p
              className="home-page__status home-page__status--error"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          {!isLoading && !errorMessage && opportunities.length === 0 && (
            <div className="home-page__empty">
              <p>Nenhuma oportunidade encontrada para este filtro.</p>
            </div>
          )}

          {!isLoading && !errorMessage && opportunities.length > 0 && (
            <div className="home-page__grid">
              {opportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Opportunities;
