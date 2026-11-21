import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import ManagementLayout from "../../components/ManagementLayout/ManagementLayout";
import Confirmation from "../../components/Confirmation/Confirmation";
import requestsIcon from "../../assets/icons/requests.png";
import organizationIcon from "../../assets/icons/organization.png";
import volunteeringIcon from "../../assets/icons/volunteering.png";
import { useEntity } from "../../contexts/EntityContexts";
import { api } from "../../services/api";
import { requestLabels } from "../../utils/management";
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
  const canManage = isAdmin || membership?.position === "editor";

  const { state } = useLocation();
  const fromNotification = Boolean(state?.fromNotification);
  const [tab, setTab] = useState(state?.tab ?? "vacancies");
  const [entityRequests, setEntityRequests] = useState(null);
  const [vacancyRequests, setVacancyRequests] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [pendingDecision, setPendingDecision] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState("pending");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reload, setReload] = useState(0);
  const inFlight = useRef(false);

  const fetchRequests = useCallback(async () => {
    const vacanciesResponse = await api.get(
      `/vacancies?id_entity=${entityId}`,
      true,
    );
    const vacancies = vacanciesResponse.data ?? [];
    const lists = await Promise.all(
      vacancies.map((vacancy) =>
        api
          .get(`/vacancies/${vacancy.id}/join-requests?pending_only=false`, true)
          .then((response) => response.data),
      ),
    );

    let entity = [];
    if (isAdmin) {
      const response = await api.get(
        `/entities/${entityId}/join-requests?pending_only=false`,
        true,
      );
      entity = response.data ?? [];
    }
    return { vacancies: lists.flat(), entity };
  }, [entityId, isAdmin]);

  useEffect(() => {
    if (!entityId || !canManage) return;
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
  }, [entityId, canManage, fetchRequests, reload]);

  const handleDecision = async (confirmed) => {
    if (inFlight.current) return;
    const decision = pendingDecision;
    if (!confirmed || !decision) { setPendingDecision(null); return; }

    const { kind, request, status } = decision;
    const path =
      kind === "entity"
        ? `/entities/${entityId}/join-requests/${request.id}`
        : `/vacancies/${request.vacancy.id}/join-requests/${request.id}`;

    inFlight.current = true;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const response = await api.patch(path, { status }, true);
      setPendingDecision(null);
      const update = list => list.map(item => item.id === request.id ? response.data : item);
      if (kind === "entity") setEntityRequests(update);
      else setVacancyRequests(update);
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
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const askDecision = (kind, request, status) => {
    setFeedback(null);
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
    <ManagementLayout className="requests-page" title="Solicitações da entidade"
      subtitle={membership?.entity?.name ?? "Analise os pedidos de participação na sua organização."}>
      {content}
    </ManagementLayout>
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
    { id: "vacancies", label: "Vagas voluntárias", list: vacancyRequests },
    ...(isAdmin
      ? [{ id: "entity", label: "Entrada na entidade", list: entityRequests }]
      : []),
  ];
  const activeTab = tabs.find((item) => item.id === tab) ?? tabs[0];
  const normalize = value => (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const matchesView = request => view === "pending" ? request.status === "pending" : request.status !== "pending";
  const list = activeTab.list === null ? null : activeTab.list.filter(request =>
    matchesView(request) && (view === "pending" || statusFilter === "all" || request.status === statusFilter) &&
    normalize(`${request.user.name} ${request.vacancy?.title ?? ""}`).includes(normalize(search.trim())),
  ).sort((a, b) => new Date(b.reviewed_at ?? b.created_at) - new Date(a.reviewed_at ?? a.created_at));

  return (
    <>
      {renderShell(
        <>
          {pendingDecision && (
            <Confirmation
              mode="confirm"
              text={pendingDecision.text}
              onResponse={handleDecision}
              isLoading={isSubmitting}
              error={feedback?.ok === false ? feedback.text : null}
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
                  {item.list?.filter(matchesView).length ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="requests-page__views" role="group" aria-label="Exibir solicitações">
            <button type="button" className="management-button" aria-pressed={view === "pending"} disabled={isSubmitting} onClick={() => setView("pending")}>Pendentes</button>
            <button type="button" className="management-button" aria-pressed={view === "history"} disabled={isSubmitting} onClick={() => setView("history")}>Histórico</button>
          </div>
          <div className="management-toolbar">
            <label className="management-field">Buscar solicitante ou vaga<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Digite um nome ou título" /></label>
            {view === "history" && <label className="management-field">Status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="all">Todos os encerrados</option>{Object.entries(requestLabels).filter(([value]) => value !== "pending").map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
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

          <div className="requests-page__list-heading">
            <h2>{activeTab.id === "entity" ? "Pedidos de entrada" : "Pedidos para vagas"}</h2>
            {list !== null && <span>{list.length} {view === "pending" ? "aguardando análise" : "no histórico"}</span>}
          </div>
          <div className="requests-page__list">
            {errorMessage ? (
              <p className="requests-page__feedback" role="alert">
                {errorMessage}
                <button className="management-button management-button--secondary" onClick={() => setReload(n => n + 1)}>Tentar novamente</button>
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
                      <span className={`request-card__status request-card__status--${request.status}`}>
                        <span
                          aria-hidden="true"
                          className="request-card__status-dot"
                        />
                        {requestLabels[request.status] ?? request.status}
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
                      {request.reviewed_at && <span className="request-card__date"><span>{request.status === "canceled" ? "Encerrado em" : "Respondido em"}</span><time dateTime={request.reviewed_at}>{formatDate(request.reviewed_at)}</time>{request.reviewed_by && <span>Por {request.reviewed_by.name}</span>}</span>}
                      {request.status === "pending" && <div className="request-card__actions">
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
                      </div>}
                    </footer>
                  </article>
                );
              })
            ) : (
              <div className="requests-page__empty">
                <span className="requests-page__icon" aria-hidden="true">
                  <img src={requestsIcon} alt="" />
                </span>
                <div><h2>{view === "history" || search ? "Nenhuma solicitação encontrada" : "Tudo em dia por aqui"}</h2>
                <p>
                  {view === "history" ? "As solicitações aceitas, recusadas ou canceladas aparecem aqui. Se você aplicou filtros, experimente alterá-los." : search ? "Tente buscar por outro nome ou título de vaga." : fromNotification
                    ? "A solicitação desta notificação já foi respondida por você ou por outro responsável."
                    : "Nenhum pedido pendente nesta categoria. As novas solicitações aparecerão aqui."}
                </p></div>
              </div>
            )}
          </div>
        </>,
      )}
    </>
  );
};

export default Requests;
