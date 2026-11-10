import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Confirmation from "../../components/Confirmation/Confirmation";
import notificationIcon from "../../assets/icons/sino.png";
import organizationIcon from "../../assets/icons/organization.png";
import volunteeringIcon from "../../assets/icons/volunteering.png";
import invitationIcon from "../../assets/icons/invitation.png";
import trashIcon from "../../assets/icons/trash.png";
import { api } from "../../services/api";
import "./Notifications.css";

const PAGE_SIZE = 20;

const resourceLabels = {
  invitation: "Convite",
  entity: "Organização",
  vacancy: "Vaga",
};

const resourceIcons = {
  invitation: invitationIcon,
  entity: organizationIcon,
  vacancy: volunteeringIcon,
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// O backend devolve datas em UTC sem indicação de fuso.
const parseUtc = (value) => {
  if (!value) return null;
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = parseUtc(value);
  return date ? dateFormatter.format(date) : "Data não informada";
};

// Notificações de solicitação levam à tela de solicitações, não ao recurso.
const REQUEST_TABS = {
  entity_join_requested: "entity",
  vacancy_join_requested: "vacancies",
};

const getResourcePath = (notification) => {
  if (REQUEST_TABS[notification.notification_type]) {
    return "/entidade/solicitacoes";
  }
  switch (notification.resource_type) {
    case "invitation":
      return "/convites";
    case "vacancy":
      return `/vagas/${notification.resource_id}`;
    case "entity":
      return "/organizacoes"; // resolvido para o slug em openResource
    default:
      return null;
  }
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  const fetchNotifications = useCallback(
    async (offset, unreadOnly) => {
      const response = await api.get(
        `/notifications?limit=${PAGE_SIZE}&offset=${offset}&unread_only=${unreadOnly}`,
        true,
      );
      return response.data;
    },
    [],
  );

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("notifications-updated", { detail: unreadCount }),
    );
  }, [unreadCount]);

  useEffect(() => {
    let cancelled = false;

    fetchNotifications(0, filter === "unread")
      .then((data) => {
        if (cancelled) return;
        setNotifications(data.items);
        setUnreadCount(data.unread_count);
        setHasMore(data.items.length === PAGE_SIZE);
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMessage(
          "Não foi possível carregar suas notificações. Tente novamente mais tarde.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [filter, fetchNotifications]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setActionError("");
    try {
      const data = await fetchNotifications(
        notifications.length,
        filter === "unread",
      );
      setNotifications((current) => [...current, ...data.items]);
      setUnreadCount(data.unread_count);
      setHasMore(data.items.length === PAGE_SIZE);
    } catch {
      setActionError("Não foi possível carregar mais notificações.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const markAsRead = async (notification) => {
    if (notification.read_at) return;
    try {
      const response = await api.patch(
        `/notifications/${notification.id}/read`,
        undefined,
        true,
      );
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? response.data : item,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      setActionError("Não foi possível marcar a notificação como lida.");
    }
  };

  const markAllAsRead = async () => {
    setActionError("");
    try {
      await api.patch("/notifications/read-all", undefined, true);
      const now = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => ({ ...item, read_at: item.read_at ?? now })),
      );
      setUnreadCount(0);
    } catch {
      setActionError("Não foi possível marcar todas como lidas.");
    }
  };

  const deleteNotification = async (notification) => {
    setActionError("");
    try {
      await api.patch(
        `/notifications/${notification.id}/archive`,
        undefined,
        true,
      );
      setNotifications((current) =>
        current.filter((item) => item.id !== notification.id),
      );
      if (!notification.read_at) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch {
      setActionError("Não foi possível excluir a notificação.");
    }
  };

  const handleDeleteResponse = async (confirmed) => {
    const target = notificationToDelete;
    setNotificationToDelete(null);
    if (confirmed && target) await deleteNotification(target);
  };

  const backState = { from: "/notificacoes" };

  const openResource = async (notification) => {
    setActionError("");
    await markAsRead(notification);

    const requestTab = REQUEST_TABS[notification.notification_type];
    if (requestTab) {
      navigate("/entidade/solicitacoes", {
        state: { from: "/notificacoes", tab: requestTab, fromNotification: true },
      });
      return;
    }

    if (notification.resource_type === "entity") {
      try {
        const response = await api.get(
          `/entities?id=${notification.resource_id}`,
          true,
        );
        const entity = response.data?.[0];
        if (entity?.slug) {
          navigate(`/entidade/sobre/${entity.slug}`, { state: backState });
          return;
        }
      } catch {
        /* cai no erro abaixo */
      }
      setActionError("Não foi possível abrir esta organização.");
      return;
    }

    const path = getResourcePath(notification);
    if (path) navigate(path, { state: backState });
  };

  return (
    <>
      <Header />
      {notificationToDelete && (
        <Confirmation
          mode="confirm"
          text="Deseja excluir esta notificação? Essa ação não pode ser desfeita."
          onResponse={handleDeleteResponse}
        />
      )}
      <main className="notifications-page">
        <section
          className="notifications-page__panel"
          aria-labelledby="notifications-title"
        >
          <header className="notifications-page__heading">
            <span
              className="notifications-page__heading-icon"
              aria-hidden="true"
            >
              <img src={notificationIcon} alt="" />
            </span>
            <div>
              <span className="notifications-page__eyebrow">Conta pessoal</span>
              <h1
                id="notifications-title"
                className="notifications-page__title"
              >
                Minhas notificações
              </h1>
              <p className="notifications-page__subtitle">
                Acompanhe as novidades sobre suas organizações, vagas e
                convites.
              </p>
            </div>
          </header>

          {notifications && (
            <div className="notifications-page__toolbar">
              <span
                className="notifications-page__summary"
                aria-live="polite"
              >
                <strong>{unreadCount}</strong>
                {unreadCount === 1 ? "não lida" : "não lidas"}
              </span>
              <div className="notifications-page__controls">
                <label className="notifications-page__filter">
                  <span>Exibir</span>
                  <select
                    value={filter}
                    onChange={(event) => {
                      setNotifications(null);
                      setErrorMessage("");
                      setActionError("");
                      setFilter(event.target.value);
                    }}
                  >
                    <option value="all">Todas</option>
                    <option value="unread">Não lidas</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="notifications-page__mark-all"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Marcar todas como lidas
                </button>
              </div>
            </div>
          )}

          {actionError && (
            <p className="notifications-page__feedback" role="alert">
              {actionError}
            </p>
          )}

          <div className="notifications-page__list">
            {errorMessage ? (
              <p className="notifications-page__feedback" role="alert">
                {errorMessage}
              </p>
            ) : notifications === null ? (
              <p className="notifications-page__feedback" role="status">
                Carregando suas notificações…
              </p>
            ) : notifications.length > 0 ? (
              <>
                {notifications.map((notification) => {
                  const isUnread = !notification.read_at;
                  const resourceType = notification.resource_type;
                  const path = getResourcePath(notification);

                  return (
                    <article
                      key={notification.id}
                      className={`notification-card ${
                        isUnread
                          ? "notification-card--unread"
                          : "notification-card--read"
                      }`}
                    >
                      <div className="notification-card__top">
                        <span
                          className="notification-card__type-icon"
                          aria-hidden="true"
                        >
                          <img
                            src={resourceIcons[resourceType] ?? notificationIcon}
                            alt=""
                          />
                        </span>
                        <div className="notification-card__identity">
                          <span className="notification-card__type">
                            {resourceLabels[resourceType] ?? "Aviso"}
                          </span>
                          <h2>{notification.title}</h2>
                        </div>
                        <span className="notification-card__status">
                          <span
                            aria-hidden="true"
                            className="notification-card__status-dot"
                          />
                          {isUnread ? "Nova" : "Lida"}
                        </span>
                      </div>

                      <p className="notification-card__message">
                        {notification.message}
                      </p>

                      <footer className="notification-card__footer">
                        <span className="notification-card__date">
                          <span>
                            {notification.actor
                              ? `Por ${notification.actor.name}`
                              : "Recebida em"}
                          </span>
                          <time dateTime={notification.created_at}>
                            {formatDate(notification.created_at)}
                          </time>
                        </span>
                        <div className="notification-card__actions">
                          <button
                            type="button"
                            className="notification-card__button notification-card__button--delete"
                            onClick={() => setNotificationToDelete(notification)}
                            aria-label={`Excluir notificação: ${notification.title}`}
                          >
                            <img src={trashIcon} alt="" />
                            Excluir
                          </button>
                          {isUnread && (
                            <button
                              type="button"
                              className="notification-card__button notification-card__button--read"
                              onClick={() => markAsRead(notification)}
                            >
                              Marcar como lida
                            </button>
                          )}
                          {path && (
                            <button
                              type="button"
                              className="notification-card__button notification-card__button--open"
                              onClick={() => openResource(notification)}
                            >
                              Ver detalhes <span aria-hidden="true">→</span>
                            </button>
                          )}
                        </div>
                      </footer>
                    </article>
                  );
                })}
                {hasMore && (
                  <button
                    type="button"
                    className="notifications-page__load-more"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? "Carregando…" : "Carregar mais"}
                  </button>
                )}
              </>
            ) : (
              <div className="notifications-page__empty">
                <span className="notifications-page__icon" aria-hidden="true">
                  <img src={notificationIcon} alt="" />
                </span>
                <h2>
                  {filter === "unread"
                    ? "Nenhuma notificação não lida"
                    : "Nenhuma notificação por enquanto"}
                </h2>
                <p>
                  {filter === "unread"
                    ? "Você está em dia com tudo. Selecione “Todas” para rever o histórico."
                    : "Quando algo acontecer nas suas organizações, vagas ou convites, aparecerá aqui."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Notifications;
