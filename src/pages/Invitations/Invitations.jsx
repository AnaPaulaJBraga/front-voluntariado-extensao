import { useState, useEffect, useRef } from "react";
import Header from "../../components/Header/Header";
import Confirmation from "../../components/Confirmation/Confirmation";
import Loader from "../../components/Loader/Loader";
import invitationIcon from "../../assets/icons/invitation.png";
import organizationIcon from "../../assets/icons/organization.png";
import volunteeringIcon from "../../assets/icons/volunteering.png";
import friendsIcon from "../../assets/icons/friends.png";
import "./Invitations.css";
import { api } from "../../services/api";
import { useEntity } from "../../contexts/EntityContexts";
import { formatDate, getErrorMessage } from "../../utils/management";

const statusLabels = { pending: "Pendente", accepted: "Aceito", rejected: "Recusado" };
const typeLabels = { entity: "Convite para entidade", vacancy: "Convite para vaga", friend: "Convite de amizade" };
const typeIcons = { entity: organizationIcon, vacancy: volunteeringIcon, friend: friendsIcon };
const sortInvitations = list => [...list].sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at) || b.id - a.id);

export default function Invitations() {
  const [lists, setLists] = useState({ received: null, archived: null });
  const [view, setView] = useState("received");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [decision, setDecision] = useState(null);
  const [result, setResult] = useState(null);
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [reload, setReload] = useState(0);
  const inFlight = useRef(false);
  const { refreshMembership } = useEntity();

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/invitations", true), api.get("/invitations?archived=true", true)])
      .then(([received, archived]) => {
        if (active) { setLists({ received: received.data.received ?? [], archived: archived.data.received ?? [] }); setErrorMessage(""); }
      }).catch(error => { if (active) setErrorMessage(getErrorMessage(error, "Não foi possível carregar seus convites.")); });
    return () => { active = false; };
  }, [reload]);

  const execute = async action => {
    if (inFlight.current) return;
    inFlight.current = true;
    setActiveId(action.invitation.id);
    setIsSubmitting(true); setActionError(""); setResult(null);
    const { invitation, kind, status } = action;
    try {
      if (kind === "response") {
        const response = await api.patch(`/invitations/${invitation.id}/response`, { status }, true);
        setLists(current => ({ ...current, received: current.received.map(item => item.id === invitation.id ? response.data : item) }));
        setResult({ ok: true, text: status === "rejected" ? "Convite recusado." : "Convite aceito com sucesso." });
        if (status === "accepted" && response.data.invitation_type === "entity") await refreshMembership();
      } else {
        await api.patch(`/invitations/${invitation.id}/${kind}`, undefined, true);
        const source = kind === "archive" ? "received" : "archived";
        const destination = kind === "archive" ? "archived" : "received";
        setLists(current => ({
          ...current,
          [source]: current[source].filter(item => item.id !== invitation.id),
          [destination]: sortInvitations([invitation, ...current[destination].filter(item => item.id !== invitation.id)]),
        }));
        setResult({ ok: true, text: kind === "archive" ? "Convite movido para Arquivados. Seu status foi mantido." : "Convite restaurado para Recebidos." });
      }
      setDecision(null);
    } catch (error) {
      const message = getErrorMessage(error);
      if (kind === "restore") setResult({ ok: false, text: message });
      else setActionError(message);
    } finally { inFlight.current = false; setIsSubmitting(false); setActiveId(null); }
  };

  const ask = (invitation, kind, status) => {
    const target = invitation.target?.name ?? invitation.sender?.name ?? "este convite";
    const text = kind === "archive"
      ? `Quer arquivar o convite de ${target}? Ele sairá de Recebidos sem ser aceito ou recusado. Você poderá restaurá-lo na aba Arquivados.`
      : status === "rejected" ? `Quer recusar o convite de ${target}?` : `Quer aceitar o convite de ${target}?`;
    setActionError(""); setResult(null); setDecision({ invitation, kind, status, text });
  };
  const respond = confirmed => {
    if (inFlight.current) return;
    if (!confirmed) setDecision(null);
    else if (decision) execute(decision);
  };

  const invitations = lists[view];
  const filtered = (invitations ?? []).filter(item =>
    (statusFilter === "all" || item.status === statusFilter) && (typeFilter === "all" || item.invitation_type === typeFilter),
  );
  const archived = view === "archived";
  return <>
    <Header />
    {decision && <Confirmation mode="confirm" text={decision.text} onResponse={respond} isLoading={isSubmitting} error={actionError} />}
    <main className="invitations-page">
      <section className="invitations-page__panel" aria-labelledby="invitations-title">
        <header className="invitations-page__heading">
          <span className="invitations-page__heading-icon" aria-hidden="true"><img src={invitationIcon} alt="" /></span>
          <div>
            <span className="invitations-page__eyebrow">Conta pessoal</span>
            <h1 id="invitations-title" className="invitations-page__title">Meus convites</h1>
            <p className="invitations-page__subtitle">Acompanhe seus convites para organizações e vagas voluntárias.</p>
          </div>
        </header>

        <div className="invitations-page__views" role="group" aria-label="Caixa de convites">
          {[{ id: "received", label: "Recebidos" }, { id: "archived", label: "Arquivados" }].map(item =>
            <button key={item.id} type="button" aria-pressed={view === item.id} disabled={isSubmitting} onClick={() => { setView(item.id); setResult(null); }}>
              {item.label}<span>{lists[item.id]?.length ?? "—"}</span>
            </button>,
          )}
        </div>
        <p className="invitations-page__archive-help">{archived ? "Os convites arquivados mantêm seu status. Restaure um convite para voltar a vê-lo em Recebidos e responder, se ainda estiver pendente." : "Arquive convites para organizar sua lista. Arquivar não aceita nem recusa o convite; você pode restaurá-lo depois."}</p>

        {result && <p role={result.ok ? "status" : "alert"} className={`invitations-page__result invitations-page__result--${result.ok ? "ok" : "error"}`}>{result.text}</p>}
        {invitations && <div className="invitations-page__toolbar">
          <div className="invitations-page__summary" aria-label="Resumo desta caixa">
            {Object.entries(statusLabels).map(([status, label]) => <span key={status} className={`invitations-page__summary-item invitations-page__summary-item--${status}`}><strong>{invitations.filter(item => item.status === status).length}</strong>{label === "Pendente" ? "Pendentes" : label === "Aceito" ? "Aceitos" : "Recusados"}</span>)}
          </div>
          <div className="invitations-page__filters">
            <label className="invitations-page__filter">Status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="all">Todos</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="invitations-page__filter">Tipo<select value={typeFilter} onChange={event => setTypeFilter(event.target.value)}><option value="all">Todos</option><option value="entity">Entidade</option><option value="vacancy">Vaga</option><option value="friend">Amizade</option></select></label>
          </div>
        </div>}

        <div className="invitations-page__list">
          {errorMessage ? <div className="invitations-page__feedback" role="alert">{errorMessage}<button type="button" className="invitations-page__retry" onClick={() => setReload(n => n + 1)}>Tentar novamente</button></div> : invitations === null ? <Loader label="Carregando convites..." /> : filtered.length ? filtered.map(invitation => {
            const type = invitation.invitation_type;
            return <article key={invitation.id} className={`invitation-card invitation-card--${invitation.status}`}>
              <div className="invitation-card__top">
                <span className="invitation-card__type-icon" aria-hidden="true"><img src={typeIcons[type] ?? invitationIcon} alt="" /></span>
                <div className="invitation-card__identity"><span className="invitation-card__type">{typeLabels[type] ?? "Convite recebido"}</span><h2>{invitation.target?.name ?? invitation.sender?.name ?? "Convite para participar"}</h2></div>
                <span className="invitation-card__status"><span aria-hidden="true" className="invitation-card__status-dot" />{statusLabels[invitation.status] ?? invitation.status}</span>
              </div>
              <p className="invitation-card__sender"><strong>{invitation.sender?.name ?? "Um participante"}</strong> convidou você {type === "entity" ? "para fazer parte desta organização." : type === "vacancy" ? "para participar desta vaga voluntária." : "para se conectar como amigos."}</p>
              <footer className="invitation-card__footer">
                <span className="invitation-card__date"><span>Enviado em</span><time dateTime={invitation.sent_at}>{formatDate(invitation.sent_at)}</time></span>
                {!archived && invitation.status === "pending" && <div className="invitation-card__actions">
                  <button type="button" className="invitation-card__button invitation-card__button--accept" disabled={isSubmitting} onClick={() => ask(invitation, "response", "accepted")}>Aceitar convite</button>
                  <button type="button" className="invitation-card__button invitation-card__button--decline" disabled={isSubmitting} onClick={() => ask(invitation, "response", "rejected")}>Recusar</button>
                </div>}
              </footer>
              <div className="invitation-card__organization">
                <span>{archived ? "Na caixa de arquivados" : "Organizar convite"}</span>
                <button type="button" className="invitation-card__archive" disabled={isSubmitting} onClick={() => archived ? execute({ invitation, kind: "restore" }) : ask(invitation, "archive")}>
                  {isSubmitting && !decision && activeId === invitation.id ? <Loader label="Restaurando..." /> : archived ? "Restaurar para Recebidos" : "Arquivar convite"}
                </button>
              </div>
            </article>;
          }) : <div className="invitations-page__empty"><span className="invitations-page__icon" aria-hidden="true"><img src={invitationIcon} alt="" /></span>
            <h2>{invitations.length ? "Nenhum convite neste filtro" : archived ? "Nenhum convite arquivado" : "Nenhum convite recebido"}</h2>
            <p>{invitations.length ? "Selecione outro status ou tipo para ver seus convites." : archived ? "Os convites que você arquivar aparecerão aqui." : "Quando você receber um convite, ele aparecerá aqui."}</p>
          </div>}
        </div>
      </section>
    </main>
  </>;
}
