import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import { api } from "../../services/api";

const EntityDashboard = ({ membership }) => {
  const [vacancies, setVacancies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const entity = membership.entity;
  const canManageVacancies = membership.position === "admin" || membership.position === "editor";

  useEffect(() => {
    let isCurrentPage = true;
    api.get(`/vacancies/?id_entity=${entity.id}`)
      .then((response) => {
        if (isCurrentPage) setVacancies(response.data);
      })
      .catch(() => {
        if (isCurrentPage) setErrorMessage("Não foi possível carregar as vagas da entidade.");
      })
      .finally(() => {
        if (isCurrentPage) setIsLoading(false);
      });
    return () => { isCurrentPage = false; };
  }, [entity.id]);

  return (
    <>
      <Header />
      <main>
        <h1>{entity.name}</h1>
        <p>Você participa desta entidade como {membership.position}.</p>
        <h2>Vagas da entidade</h2>
        {isLoading && <p>Carregando vagas...</p>}
        {errorMessage && <p role="alert">{errorMessage}</p>}
        {!isLoading && !errorMessage && vacancies.length === 0 && (
          <p>Sua entidade ainda não possui vagas voluntárias.</p>
        )}
        {!isLoading && !errorMessage && vacancies.length > 0 && (
          <div>
            {vacancies.map((vacancy) => (
              <Card
              key={vacancy.id}
                id={vacancy.id}
                title={vacancy.title}
                branch={vacancy.branch}
                desc={vacancy.desc}
                modality={vacancy.modality}
              />
              // <li key={vacancy.id}>#{vacancy.id}: {vacancy.title}</li>
            ))}
          </div>
        )}
        {canManageVacancies && <Link to="/vagas/cadastro">Criar nova vaga voluntária</Link>}
      </main>
    </>
  );
};

export default EntityDashboard;
