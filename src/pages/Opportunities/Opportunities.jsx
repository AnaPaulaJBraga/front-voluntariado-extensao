import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import OpportunityCard from "../../components/OpportunityCard/OpportunityCard";
import { branches } from "../../constants/branches";
import { modalities } from "../../constants/modalities";
import { api } from "../../services/api";
import "./Opportunities.css";

import animalsImagem from "../../assets/branches/animals.png";
import children_and_teens from "../../assets/branches/children_and_teens.png";
import community from "../../assets/branches/community.png";
import culture_and_art from "../../assets/branches/culture_and_art.png";
import education from "../../assets/branches/education.png";
import elderly from "../../assets/branches/elderly.png";
import environment from "../../assets/branches/environment.png";
import events from "../../assets/branches/events.png";
import health from "../../assets/branches/health.png";
import humanitarian_aid from "../../assets/branches/humanitarian_aid.png";
import inclusion from "../../assets/branches/inclusion.png";
import social_assistance from "../../assets/branches/social_assistance.png";
import sports from "../../assets/branches/sports.png";
import technology from "../../assets/branches/technology.png";

const BRANCH_IMAGE = {
  animals: animalsImagem,
  environment: environment,
  education: education,
  health: health,
  social_assistance: social_assistance,
  elderly: elderly,
  children_and_teens: children_and_teens,
  inclusion: inclusion,
  culture_and_art: culture_and_art,
  sports: sports,
  technology: technology,
  humanitarian_aid: humanitarian_aid,
  community: community,
  events: events,
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
