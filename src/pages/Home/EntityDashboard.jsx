import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import { api } from "../../services/api";
import "./EntityDashboard.css";

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

const EntityDashboard = ({ membership }) => {
  const [vacancies, setVacancies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const entity = membership.entity;
  const canManageVacancies = useMemo(
    () => membership.position === "admin" || membership.position === "editor",
    [membership.position]
  );

  useEffect(() => {
    let isCurrentPage = true;
    api
      .get(`/vacancies/?id_entity=${entity.id}`)
      .then((response) => {
        if (isCurrentPage) {
          setVacancies(response.data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isCurrentPage) {
          setErrorMessage("Não foi possível carregar as vagas da entidade.");
          setIsLoading(false);
        }
      });
    return () => {
      isCurrentPage = false;
    };
  }, [entity.id]);

  return (
    <>
      <Header />
      <main className="entity-dashboard-page">
        <section className="entity-dashboard-page__layout">
          <header className="entity-dashboard-page__hero">
            <h1>{entity.name}</h1>
            <p>Você participa desta entidade como {membership.position}.</p>
          </header>

          <section className="entity-dashboard-page__content">
            <h2>Vagas da entidade</h2>
            {isLoading && (
              <p className="entity-dashboard-page__status">
                Carregando vagas...
              </p>
            )}
            {errorMessage && (
              <p
                className="entity-dashboard-page__status entity-dashboard-page__status--error"
                role="alert"
              >
                {errorMessage}
              </p>
            )}
            {!isLoading && !errorMessage && vacancies.length === 0 && (
              <p className="entity-dashboard-page__empty">
                Sua entidade ainda não possui vagas voluntárias.
              </p>
            )}
            {!isLoading && !errorMessage && vacancies.length > 0 && (
              <div className="entity-dashboard-page__grid">
                {vacancies.map((vacancy) => (
                  <Card
                    key={vacancy.id}
                    id={vacancy.id}
                    title={vacancy.title}
                    branch={vacancy.branch}
                    desc={vacancy.description}
                    modality={vacancy.modality}
                    image={BRANCH_IMAGE[vacancy.branch] ?? ""}
                  />
                ))}
              </div>
            )}
            {canManageVacancies && (
              <Link className="entity-dashboard-page__cta" to="/vagas/cadastro">
                Criar nova vaga voluntária
              </Link>
            )}
          </section>
        </section>
      </main>
    </>
  );
};

export default EntityDashboard;
