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

const POSITION_LABEL = {
  admin: "Administrador",
  editor: "Editor",
  member: "Membro",
};

const getEntityInitials = (name) => {
  if (!name) return "OR";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const formatDateTimeBR = (isoDate) => {
  if (!isoDate) return "";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCreatedDateBR = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = String(dateStr).split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
};

const EntityDashboard = ({ membership }) => {
  const [vacancies, setVacancies] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [vacancyFilter, setVacancyFilter] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const entity = membership.entity;
  const canManageVacancies = useMemo(
    () => membership.position === "admin" || membership.position === "editor",
    [membership.position]
  );

  useEffect(() => {
    let isCurrentPage = true;

    Promise.all([
      api.get(`/vacancies?id_entity=${entity.id}`),
      api.get(`/entities/${entity.id}/dashboard`, true).catch(() => null),
    ])
      .then(([vacanciesResponse, statsResponse]) => {
        if (!isCurrentPage) return;
        setVacancies(vacanciesResponse.data || []);
        if (statsResponse?.data) {
          setDashboardStats(statsResponse.data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!isCurrentPage) return;
        setErrorMessage("Não foi possível carregar os dados do painel da entidade.");
        setIsLoading(false);
      });

    return () => {
      isCurrentPage = false;
    };
  }, [entity.id]);

  const { activeVacancies, endedVacancies, nextUpcomingVacancy } = useMemo(() => {
    const now = new Date();
    const active = [];
    const ended = [];

    vacancies.forEach((v) => {
      const endsAt = v.ends_at ? new Date(v.ends_at) : null;
      if (!endsAt || endsAt >= now) {
        active.push(v);
      } else {
        ended.push(v);
      }
    });

    const upcoming =
      active
        .filter((v) => v.starts_at && new Date(v.starts_at) >= now)
        .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))[0] ||
      null;

    return {
      activeVacancies: active,
      endedVacancies: ended,
      nextUpcomingVacancy: upcoming,
    };
  }, [vacancies]);

  const filteredVacancies = useMemo(() => {
    if (vacancyFilter === "active") return activeVacancies;
    if (vacancyFilter === "ended") return endedVacancies;
    return vacancies;
  }, [vacancyFilter, activeVacancies, endedVacancies, vacancies]);

  const vacanciesSummary = dashboardStats?.vacancies ?? {
    total: vacancies.length,
    active: activeVacancies.length,
    ended: endedVacancies.length,
    in_person: vacancies.filter((v) => v.modality === "in_person").length,
    remote: vacancies.filter((v) => v.modality === "remote").length,
  };

  const membersSummary = dashboardStats?.members ?? {
    total: "—",
    admins: 0,
    editors: 0,
    members: 0,
  };

  const participantsSummary = dashboardStats?.participants ?? {
    total_enrollments: 0,
    unique_volunteers: 0,
  };

  const pendingRequestsSummary = dashboardStats?.pending_requests ?? {
    total: 0,
    entity: 0,
    vacancies: 0,
  };

  const positionLabel = POSITION_LABEL[membership.position] || membership.position;
  const initials = getEntityInitials(entity.name);

  return (
    <>
      <Header />
      <main className="entity-dashboard-page">
        <section className="entity-dashboard-page__layout">
          <header className="entity-dashboard-page__hero">
            <div className="entity-dashboard-page__hero-identity">
              <div
                className="entity-dashboard-page__avatar"
                aria-hidden="true"
              >
                {initials}
              </div>

              <div className="entity-dashboard-page__hero-main">
                <div className="entity-dashboard-page__badges">
                  <span className="entity-dashboard-page__badge entity-dashboard-page__badge--role">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    {positionLabel}
                  </span>

                  {entity.sector && (
                    <span className="entity-dashboard-page__badge">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      {entity.sector}
                    </span>
                  )}

                  {entity.city && entity.uf && (
                    <span className="entity-dashboard-page__badge">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {entity.city} - {entity.uf}
                    </span>
                  )}

                  {entity.created_at && (
                    <span className="entity-dashboard-page__badge entity-dashboard-page__badge--muted">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Desde {formatCreatedDateBR(entity.created_at)}
                    </span>
                  )}
                </div>

                <h1>{entity.name}</h1>
                {entity.description && (
                  <p className="entity-dashboard-page__description">
                    {entity.description}
                  </p>
                )}
              </div>
            </div>

            <div className="entity-dashboard-page__hero-actions">
              <Link
                className="entity-dashboard-page__secondary-cta"
                to={`/entidade/sobre/${entity.slug}`}
              >
                Sobre a entidade
              </Link>
              {canManageVacancies && (
                <Link className="entity-dashboard-page__cta" to="/vagas/cadastro">
                  + Criar vaga voluntária
                </Link>
              )}
            </div>
          </header>

          <section
            className="entity-dashboard-page__kpis"
            aria-label="Indicadores da organização"
          >
            <Link
              to="/entidade/vagas"
              className="entity-dashboard-page__kpi-card"
            >
              <div className="entity-dashboard-page__kpi-top">
                <span className="entity-dashboard-page__kpi-label">
                  Vagas Ativas
                </span>
                <span
                  className="entity-dashboard-page__kpi-icon entity-dashboard-page__kpi-icon--indigo"
                  aria-hidden="true"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </span>
              </div>
              <strong className="entity-dashboard-page__kpi-value">
                {vacanciesSummary.active}
              </strong>
              <div className="entity-dashboard-page__kpi-footer">
                <span className="entity-dashboard-page__kpi-sub">
                  {vacanciesSummary.in_person} presenciais · {vacanciesSummary.remote} remotas ({vacanciesSummary.total} total)
                </span>
                <span className="entity-dashboard-page__kpi-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            </Link>

            <Link
              to="/entidade/membros"
              className="entity-dashboard-page__kpi-card"
            >
              <div className="entity-dashboard-page__kpi-top">
                <span className="entity-dashboard-page__kpi-label">
                  Membros da Entidade
                </span>
                <span
                  className="entity-dashboard-page__kpi-icon entity-dashboard-page__kpi-icon--purple"
                  aria-hidden="true"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
              </div>
              <strong className="entity-dashboard-page__kpi-value">
                {membersSummary.total}
              </strong>
              <div className="entity-dashboard-page__kpi-footer">
                <span className="entity-dashboard-page__kpi-sub">
                  {dashboardStats
                    ? `${membersSummary.admins} admin · ${membersSummary.editors} editores · ${membersSummary.members} membros`
                    : "Ver equipe da organização"}
                </span>
                <span className="entity-dashboard-page__kpi-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            </Link>

            <div className="entity-dashboard-page__kpi-card entity-dashboard-page__kpi-card--static">
              <div className="entity-dashboard-page__kpi-top">
                <span className="entity-dashboard-page__kpi-label">
                  Voluntários nas Vagas
                </span>
                <span
                  className="entity-dashboard-page__kpi-icon entity-dashboard-page__kpi-icon--emerald"
                  aria-hidden="true"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </span>
              </div>
              <strong className="entity-dashboard-page__kpi-value">
                {participantsSummary.total_enrollments}
              </strong>
              <div className="entity-dashboard-page__kpi-footer">
                <span className="entity-dashboard-page__kpi-sub">
                  {participantsSummary.unique_volunteers} voluntário(s) único(s) inscrito(s)
                </span>
              </div>
            </div>

            <Link
              to="/entidade/solicitacoes"
              className={`entity-dashboard-page__kpi-card ${
                pendingRequestsSummary.total > 0
                  ? "entity-dashboard-page__kpi-card--highlight"
                  : ""
              }`}
            >
              <div className="entity-dashboard-page__kpi-top">
                <span className="entity-dashboard-page__kpi-label">
                  Solicitações Pendentes
                </span>
                <span
                  className={`entity-dashboard-page__kpi-icon ${
                    pendingRequestsSummary.total > 0
                      ? "entity-dashboard-page__kpi-icon--amber"
                      : "entity-dashboard-page__kpi-icon--slate"
                  }`}
                  aria-hidden="true"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {pendingRequestsSummary.total > 0 && (
                    <span className="entity-dashboard-page__kpi-pulse" />
                  )}
                </span>
              </div>
              <strong className="entity-dashboard-page__kpi-value">
                {pendingRequestsSummary.total}
              </strong>
              <div className="entity-dashboard-page__kpi-footer">
                <span className="entity-dashboard-page__kpi-sub">
                  {pendingRequestsSummary.entity} para a entidade · {pendingRequestsSummary.vacancies} para vagas
                </span>
                <span className="entity-dashboard-page__kpi-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            </Link>
          </section>

          {nextUpcomingVacancy && (
            <section
              className="entity-dashboard-page__next-event"
              aria-label="Próxima ação voluntária"
            >
              <div className="entity-dashboard-page__next-content">
                <span className="entity-dashboard-page__next-tag">
                  Próxima ação voluntária
                </span>
                <h3>{nextUpcomingVacancy.title}</h3>
                <p>
                  Início em{" "}
                  <strong>{formatDateTimeBR(nextUpcomingVacancy.starts_at)}</strong>
                  {nextUpcomingVacancy.city && nextUpcomingVacancy.uf
                    ? ` · ${nextUpcomingVacancy.city} - ${nextUpcomingVacancy.uf}`
                    : " · Modalidade remota"}
                </p>
              </div>
              <Link
                to={`/vagas/${nextUpcomingVacancy.id}`}
                className="entity-dashboard-page__next-link"
              >
                Ver detalhes →
              </Link>
            </section>
          )}

          <section className="entity-dashboard-page__content">
            <div className="entity-dashboard-page__content-header">
              <h2>Vagas da entidade</h2>
              <div
                className="entity-dashboard-page__tabs"
                role="tablist"
                aria-label="Filtrar vagas por status"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={vacancyFilter === "active"}
                  className={`entity-dashboard-page__tab ${
                    vacancyFilter === "active"
                      ? "entity-dashboard-page__tab--active"
                      : ""
                  }`}
                  onClick={() => setVacancyFilter("active")}
                >
                  Ativas ({activeVacancies.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={vacancyFilter === "ended"}
                  className={`entity-dashboard-page__tab ${
                    vacancyFilter === "ended"
                      ? "entity-dashboard-page__tab--active"
                      : ""
                  }`}
                  onClick={() => setVacancyFilter("ended")}
                >
                  Encerradas ({endedVacancies.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={vacancyFilter === "all"}
                  className={`entity-dashboard-page__tab ${
                    vacancyFilter === "all"
                      ? "entity-dashboard-page__tab--active"
                      : ""
                  }`}
                  onClick={() => setVacancyFilter("all")}
                >
                  Todas ({vacancies.length})
                </button>
              </div>
            </div>

            {isLoading && (
              <div
                className="entity-dashboard-page__skeleton-grid"
                aria-label="Carregando vagas"
              >
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="entity-dashboard-page__skeleton-card"
                  />
                ))}
              </div>
            )}

            {errorMessage && (
              <p
                className="entity-dashboard-page__status entity-dashboard-page__status--error"
                role="alert"
              >
                {errorMessage}
              </p>
            )}

            {!isLoading && !errorMessage && filteredVacancies.length === 0 && (
              <div className="entity-dashboard-page__empty">
                <div
                  className="entity-dashboard-page__empty-icon"
                  aria-hidden="true"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3>
                  {vacancyFilter === "active"
                    ? "Nenhuma vaga ativa no momento"
                    : vacancyFilter === "ended"
                    ? "Nenhuma vaga encerrada até o momento"
                    : "Sua entidade ainda não possui vagas voluntárias"}
                </h3>
                <p>
                  {vacancyFilter === "ended"
                    ? "As vagas cujo prazo já terminou aparecerão listadas aqui."
                    : "Publique uma oportunidade para atrair voluntários para as ações da sua organização."}
                </p>
                {canManageVacancies && vacancyFilter !== "ended" && (
                  <Link
                    className="entity-dashboard-page__cta"
                    to="/vagas/cadastro"
                  >
                    + Criar vaga voluntária
                  </Link>
                )}
              </div>
            )}

            {!isLoading && !errorMessage && filteredVacancies.length > 0 && (
              <div className="entity-dashboard-page__grid">
                {filteredVacancies.map((vacancy) => (
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
          </section>
        </section>
      </main>
    </>
  );
};

export default EntityDashboard;
