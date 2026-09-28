import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import { api } from "../../services/api";
import "./EntityDashboard.css";

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
