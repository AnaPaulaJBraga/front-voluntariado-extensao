import { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Confirmation from "../../components/Confirmation/Confirmation";
import invitationIcon from "../../assets/icons/invitation.png";
import organizationIcon from "../../assets/icons/organization.png";
import volunteeringIcon from "../../assets/icons/volunteering.png";
import friendsIcon from "../../assets/icons/friends.png";
import "./Invitations.css";
import { api } from "../../services/api";

const statusLabels = {
  pending: "Pendente",
  accepted: "Aceito",
  rejected: "Recusado",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const formatDate = (value) => {
  if (!value) return "Data não informada";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data não informada"
    : dateFormatter.format(date);
};

const Invitations = () => {
  const [invitations, setInvitations] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [messageConfirmation, setMessageConfirmation] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetInvitation, setTargetInvitation] = useState({});
  const [result, setResult] = useState({});

  const filteredInvitations = (invitations ?? []).filter(
    (invitation) => statusFilter === "all" || invitation.status === statusFilter,
  );

  useEffect(() => {
    const getInvitations = async () => {
      try {
        const response = await api.get("/invitations", true);
        if (response.status === 200) {
          setInvitations(response.data.received ?? []);
        }
      } catch (error) {
        console.log(error);
        setErrorMessage(
          "Não foi possível carregar seus convites. Tente novamente mais tarde.",
        );
      }
    };
    getInvitations();
  }, []);

  const handleResponse = async (value) => {
    if (!value) {
      setIsConfirmationOpen(false);
      return;
    }

    const body = { "status": "accepted" }
    const response = await api.patch(`/invitations/${targetInvitation.id}/response`, body, true);
    console.log(response);
    if (response.status === 200) {
      setResult({ ok: true, result: `Agora você participa da entidade ${response.data.target.name}` })
      setIsConfirmationOpen(false);
    }

  }

  return (
    <>
      <Header />
      {isConfirmationOpen && (
        <Confirmation
          mode="confirm"
          text={messageConfirmation}
          onResponse={handleResponse}
        />
      )}
      <main className="invitations-page">
        <section
          className="invitations-page__panel"
          aria-labelledby="invitations-title"
        >
          <header className="invitations-page__heading">
            <span className="invitations-page__heading-icon" aria-hidden="true">
              <img src={invitationIcon} alt="" />
            </span>
            <div>
              <span className="invitations-page__eyebrow">Conta pessoal</span>
              <h1 id="invitations-title" className="invitations-page__title">
                Meus convites
              </h1>
              <p className="invitations-page__subtitle">
                Acompanhe os convites recebidos para participar de organizações
                e vagas voluntárias.
              </p>
            </div>
          </header>

          {result && (
            <p
              style={result?.ok
                ? { color: "green", marginTop: 10 }
                : { color: "red", marginTop: 10 }
              }
            >{result.result}</p>
          )}

          {invitations && (
            <div className="invitations-page__toolbar">
              <div
                className="invitations-page__summary"
                aria-label="Resumo dos convites"
              >
                {Object.entries(statusLabels).map(([status, label]) => (
                  <span
                    key={status}
                    className={`invitations-page__summary-item invitations-page__summary-item--${status}`}
                  >
                    <strong>
                      {
                        invitations.filter(
                          (invitation) => invitation.status === status,
                        ).length
                      }
                    </strong>
                    {label === "Pendente"
                      ? "Pendentes"
                      : label === "Aceito"
                        ? "Aceitos"
                        : "Recusados"}
                  </span>
                ))}
              </div>
              <label className="invitations-page__filter">
                <span>Exibir</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">Todos os convites</option>
                  <option value="pending">Pendentes</option>
                  <option value="accepted">Aceitos</option>
                  <option value="rejected">Recusados</option>
                </select>
              </label>
            </div>
          )}

          <div className="invitations-page__list">
            {errorMessage ? (
              <p className="invitations-page__feedback" role="alert">
                {errorMessage}
              </p>
            ) : invitations === null ? (
              <p className="invitations-page__feedback" role="status">
                Carregando seus convites…
              </p>
            ) : filteredInvitations.length > 0 ? (
              filteredInvitations.map((invitation) => {
                const isEntity = invitation.invitation_type === "entity";
                const isVacancy = invitation.invitation_type === "vacancy";
                const isFriend = invitation.invitation_type === "friend";
                const status = statusLabels[invitation.status]
                  ? invitation.status
                  : "unknown";

                return (
                  <article
                    key={invitation.id}
                    className={`invitation-card invitation-card--${status}`}
                  >
                    <div className="invitation-card__top">
                      <span
                        className="invitation-card__type-icon"
                        aria-hidden="true"
                      >
                        <img
                          src={
                            isEntity
                              ? organizationIcon
                              : isVacancy
                                ? volunteeringIcon
                                : isFriend
                                  ? friendsIcon
                                  : invitationIcon
                          }
                          alt=""
                        />
                      </span>
                      <div className="invitation-card__identity">
                        <span className="invitation-card__type">
                          {isEntity
                            ? "Convite para entidade"
                            : isVacancy
                              ? "Convite para vaga"
                              : isFriend
                                ? "Convite de amizade"
                                : "Convite recebido"}
                        </span>
                        <h2>
                          {invitation.target?.name ||
                            invitation.target?.title ||
                            (isFriend ? invitation.sender?.name : null) ||
                            "Convite para participar"}
                        </h2>
                      </div>
                      <span className="invitation-card__status">
                        <span
                          aria-hidden="true"
                          className="invitation-card__status-dot"
                        />
                        {statusLabels[invitation.status] ||
                          "Status não informado"}
                      </span>
                    </div>
                    <p className="invitation-card__sender">
                      <strong>
                        {invitation.sender?.name || "Um participante"}
                      </strong>{" "}
                      convidou você para{" "}
                      {isEntity
                        ? "fazer parte desta organização."
                        : isVacancy
                          ? "participar desta vaga voluntária."
                          : isFriend
                            ? "se conectar como amigos."
                            : "participar."}
                    </p>
                    <footer className="invitation-card__footer">
                      <span className="invitation-card__date">
                        <span>Enviado em</span>
                        <time dateTime={invitation.sent_at || undefined}>
                          {formatDate(invitation.sent_at)}
                        </time>
                      </span>
                      {invitation.status === "pending" && (
                        <div className="invitation-card__actions">
                          <button
                            className="invitation-card__button invitation-card__button--decline"
                            type="button"
                            onClick={() => {
                              setIsConfirmationOpen(true);
                              setTargetInvitation(invitation);
                            }}
                          >
                            Recusar
                          </button>
                          <button
                            className="invitation-card__button invitation-card__button--accept"
                            type="button"
                            onClick={() => {
                              setMessageConfirmation(
                                isEntity
                                  ? `Deseja participar da entidade ${invitation.target?.name || "que enviou o convite"}?`
                                  : isVacancy
                                    ? `Deseja participar da vaga ${invitation.target?.name || "para a qual foi convidado"}?`
                                    : isFriend
                                      ? `Deseja aceitar o convite de amizade de ${invitation.sender?.name || "este usuário"}?`
                                      : "Deseja aceitar este convite?",
                              );
                              setIsConfirmationOpen(true);
                              setTargetInvitation(invitation);
                            }}
                          >
                            Aceitar convite <span aria-hidden="true">→</span>
                          </button>
                        </div>
                      )}
                    </footer>
                  </article>
                );
              })
            ) : (
              <div className="invitations-page__empty">
                <span className="invitations-page__icon" aria-hidden="true">
                  <img src={invitationIcon} alt="" />
                </span>
                <h2>{invitations.length === 0 ? "Nenhum convite por enquanto" : "Nenhum convite neste filtro"}</h2>
                <p>{invitations.length === 0 ? "Quando você receber um convite, ele aparecerá aqui." : "Selecione outro status para ver seus convites."}</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Invitations;
