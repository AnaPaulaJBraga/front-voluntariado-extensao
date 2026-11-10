import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import Confirmation from "../../components/Confirmation/Confirmation";
import requestsIcon from "../../assets/icons/requests.png";
import organizationIcon from "../../assets/icons/organization.png";
import volunteeringIcon from "../../assets/icons/volunteering.png";
import { useEntity } from "../../contexts/EntityContexts";
import { api } from "../../services/api";
import "./Requests.css";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// O backend devolve datas em UTC sem indicação de fuso.
const formatDate = (value) => {
  if (!value) return "Data não informada";
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime())
    ? "Data não informada"
    : dateFormatter.format(date);
};

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  return typeof detail === "string"
    ? detail
    : "Não foi possível concluir a ação. Tente novamente.";
};

const Requests = () => {
  const { membership, isLoading } = useEntity();
  const entityId = membership?.entity?.id;
  const isAdmin = membership?.position === "admin";

  const { state } = useLocation();
  const fromNotification = Boolean(state?.fromNotification);
  const [tab, setTab] = useState(state?.tab ?? "vacancies");
  const [entityRequests, setEntityRequests] = useState(null);
  const [vacancyRequests, setVacancyRequests] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [pendingDecision, setPendingDecision] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    const vacanciesResponse = await api.get(
      `/vacancies?id_entity=${entityId}`,
      true,
    );
    const vacancies = vacanciesResponse.data ?? [];
    const lists = await Promise.all(
      vacancies.map((vacancy) =>
        api
          .get(`/vacancies/${vacancy.id}/join-requests`, true)
          .then((response) => response.data),
      ),
    );

    let entity = [];
    if (isAdmin) {
      const response = await api.get(
        `/entities/${entityId}/join-requests`,
        true,
      );
      entity = response.data ?? [];
    }
    return { vacancies: lists.flat(), entity };
  }, [entityId, isAdmin]);

  useEffect(() => {
    if (!entityId) return;
    let cancelled = false;

    fetchRequests()
      .then((data) => {
        if (cancelled) return;
        setVacancyRequests(data.vacancies);
        setEntityRequests(data.entity);
        setErrorMessage("");
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMessage(
          "Não foi possível carregar as solicitações. Tente novamente mais tarde.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [entityId, fetchRequests]);

  const handleDecision = async (confirmed) => {
    const decision = pendingDecision;
    setPendingDecision(null);
    if (!confirmed || !decision) return;

    const { kind, request, status } = decision;
    const path =
      kind === "entity"
        ? `/entities/${entityId}/join-requests/${request.id}`
        : `/vacancies/${request.vacancy.id}/join-requests/${request.id}`;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.patch(path, { status }, true);
      const remove = (list) => list.filter((item) => item.id !== request.id);
      if (kind === "entity") setEntityRequests(remove);
      else setVacancyRequests(remove);
      setFeedback({
        ok: true,
        text:
          status === "accepted"
            ? `Solicitação de ${request.user.name} autorizada.`
            : `Solicitação de ${request.user.name} recusada.`,
      });
    } catch (error) {
      setFeedback({ ok: false, text: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const askDecision = (kind, request, status) => {
    const target =
      kind === "entity"
        ? `na entidade ${request.entity?.name ?? ""}`
        : `na vaga ${request.vacancy?.title ?? ""}`;
    setPendingDecision({
      kind,
      request,
      status,
      text:
        status === "accepted"
          ? `Deseja autorizar a participação de ${request.user.name} ${target}?`
          : `Deseja recusar a solicitação de ${request.user.name} ${target}?`,
    });
  };

  const renderShell = (content) => (
    <>
      <Header />
      <main className="requests-page">
        <section
          className="requests-page__panel"
          aria-labelledby="requests-title"
        >
          <header className="requests-page__heading">
            <span className="requests-page__heading-icon" aria-hidden="true">
              <img src={requestsIcon} alt="" />
            </span>
            <div>
              <span className="requests-page__eyebrow">
                {membership?.entity?.name ?? "Entidade"}
              </span>
              <h1 id="requests-title" className="requests-page__title">
                Solicitações
              </h1>
              <p className="requests-page__subtitle">
                Autorize ou recuse quem pediu para participar das vagas e da
                sua organização.
              </p>
            </div>
          </header>
          {content}
        </section>
      </main>
    </>
  );

  if (isLoading) {
    return renderShell(
      <p className="requests-page__feedback" role="status">
        Carregando sua entidade…
      </p>,
    );
  }

  if (!membership?.entity) {
    return renderShell(
      <p className="requests-page__feedback" role="alert">
        Você precisa participar de uma entidade para ver as solicitações.
      </p>,
    );
  }

  if (membership.position === "member") {
    return renderShell(
      <p className="requests-page__feedback" role="alert">
        Apenas administradores e editores podem gerenciar solicitações.
      </p>,
    );
  }

  const tabs = [
    { id: "vacancies", label: "Vagas", list: vacancyRequests },
    ...(isAdmin
      ? [{ id: "entity", label: "Entidade", list: entityRequests }]
      : []),
  ];
  const activeTab = tabs.find((item) => item.id === tab) ?? tabs[0];
  const list = activeTab.list;

  return (
    <>
      {renderShell(
        <>
          {pendingDecision && (
            <Confirmation
              mode="confirm"
              text={pendingDecision.text}
              onResponse={handleDecision}
            />
          )}

          <div
            className="requests-page__tabs"
            role="tablist"
            aria-label="Tipo de solicitação"
          >
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={activeTab.id === item.id}
                className={`requests-page__tab ${
                  activeTab.id === item.id ? "requests-page__tab--active" : ""
                }`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
                <span className="requests-page__tab-count">
                  {item.list?.length ?? 0}
                </span>
              </button>
            ))}
          </div>

          {feedback && (
            <p
              className={`requests-page__result ${
                feedback.ok
                  ? "requests-page__result--ok"
                  : "requests-page__result--error"
              }`}
              role={feedback.ok ? "status" : "alert"}
            >
              {feedback.text}
            </p>
          )}

          <div className="requests-page__list">
            {errorMessage ? (
              <p className="requests-page__feedback" role="alert">
                {errorMessage}
              </p>
            ) : list === null ? (
              <p className="requests-page__feedback" role="status">
                Carregando solicitações…
              </p>
            ) : list.length > 0 ? (
              list.map((request) => {
                const isEntity = activeTab.id === "entity";
                return (
                  <article key={request.id} className="request-card">
                    <div className="request-card__top">
                      <span
                        className="request-card__type-icon"
                        aria-hidden="true"
                      >
                        <img
                          src={isEntity ? organizationIcon : volunteeringIcon}
                          alt=""
                        />
                      </span>
                      <div className="request-card__identity">
                        <span className="request-card__type">
                          {isEntity
                            ? "Entrada na entidade"
                            : "Participação em vaga"}
                        </span>
                        <h2>{request.user.name}</h2>
                      </div>
                      <span className="request-card__status">
                        <span
                          aria-hidden="true"
                          className="request-card__status-dot"
                        />
                        Pendente
                      </span>
                    </div>

                    <p className="request-card__message">
                      <strong>{request.user.name}</strong> solicitou{" "}
                      {isEntity
                        ? "entrada na sua organização."
                        : "participar da vaga "}
                      {!isEntity && <strong>{request.vacancy?.title}</strong>}
                      {!isEntity && "."}
                    </p>

                    <footer className="request-card__footer">
                      <span className="request-card__date">
                        <span>Solicitado em</span>
                        <time dateTime={request.created_at}>
                          {formatDate(request.created_at)}
                        </time>
                      </span>
                      <div className="request-card__actions">
                        <button
                          type="button"
                          className="request-card__button request-card__button--decline"
                          disabled={isSubmitting}
                          onClick={() =>
                            askDecision(
                              isEntity ? "entity" : "vacancy",
                              request,
                              "rejected",
                            )
                          }
                        >
                          Recusar
                        </button>
                        <button
                          type="button"
                          className="request-card__button request-card__button--accept"
                          disabled={isSubmitting}
                          onClick={() =>
                            askDecision(
                              isEntity ? "entity" : "vacancy",
                              request,
                              "accepted",
                            )
                          }
                        >
                          Autorizar <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </footer>
                  </article>
                );
              })
            ) : (
              <div className="requests-page__empty">
                <span className="requests-page__icon" aria-hidden="true">
                  <img src={requestsIcon} alt="" />
                </span>
                <h2>Nenhuma solicitação pendente</h2>
                <p>
                  {fromNotification
                    ? "A solicitação desta notificação já foi respondida por você ou por outro responsável."
                    : "Quando alguém pedir para participar, a solicitação aparecerá aqui para você autorizar."}
                </p>
              </div>
            )}
          </div>
        </>,
      )}
    </>
  );
};

export default Requests;
