import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ManagementLayout from "../../components/ManagementLayout/ManagementLayout";
import Confirmation from "../../components/Confirmation/Confirmation";
import Loader from "../../components/Loader/Loader";
import EntityInviteModal from "../../components/EntityInviteModal/EntityInviteModal";
import { useEntity } from "../../contexts/EntityContexts";
import { api } from "../../services/api";
import { branches } from "../../constants/branches";
import { modalities } from "../../constants/modalities";
import { canManageVacancy, formatDate, getErrorMessage } from "../../utils/management";
import styles from "./VacancyDetail.module.css";

export default function VacancyDetail() {
  const { id } = useParams();
  return <VacancyDetails key={id} id={id} />;
}

function VacancyDetails({ id }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { membership } = useEntity();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [personal, setPersonal] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState(null);
  const [busy, setBusy] = useState(false);
  const [decisionError, setDecisionError] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const inFlight = useRef(false);
  const manage = canManageVacancy(membership, vacancy);
  const loggedIn = Boolean(localStorage.getItem("access_token"));
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await api.get("/vacancies?id=" + id);
        const found = response.data[0];
        if (!found) throw new Error("not-found");
        if (active) setVacancy(found);
        if (loggedIn) {
          const [requests, participation] = await Promise.all([api.get("/vacancies/join-requests/me", true), api.get("/vacancies/" + id + "/participants/me", true)]);
          if (active) setPersonal({ ...participation.data, request: requests.data.find(item => item.vacancy.id === found.id && item.status === "pending") ?? null });
        } else if (active) setPersonal({ is_participant: false, request: null });
      } catch (failure) {
        if (active) setError(failure.message === "not-found" ? "Vaga não encontrada." : getErrorMessage(failure, "Não foi possível carregar a vaga e sua participação."));
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [id, loggedIn]);
  const join = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true); setError(""); setFeedback("");
    try {
      const response = await api.post("/vacancies/" + id + "/join-requests", null, false, true);
      setPersonal({ is_participant: response.data.status === "accepted", request: response.data });
      setFeedback(response.data.status === "pending" ? "Solicitação enviada. Aguarde a aprovação dos responsáveis." : "Participação confirmada! Você já está inscrito nesta vaga.");
    } catch (failure) { setError(getErrorMessage(failure)); }
    finally { setBusy(false); inFlight.current = false; }
  };
  const showParticipants = async () => {
    if (participantsLoading || busy) return;
    if (participants !== null) { setParticipants(null); return; }
    setParticipantsLoading(true); setError("");
    try { setParticipants((await api.get("/vacancies/" + id + "/participants", true)).data); }
    catch (failure) { setError(getErrorMessage(failure)); }
    finally { setParticipantsLoading(false); }
  };
  const ask = value => { setDecision(value); setDecisionError(""); };
  const respond = async confirmed => {
    if (inFlight.current) return;
    if (!confirmed) { setDecision(null); return; }
    inFlight.current = true; setBusy(true); setDecisionError(""); setFeedback("");
    try {
      if (decision.kind === "delete") {
        await api.delete("/vacancies/" + id, null, true);
        navigate("/entidade/vagas", { replace: true });
      } else if (decision.kind === "leave") {
        await api.delete("/vacancies/" + id + "/participants/me", null, true);
        setPersonal(current => ({ ...current, is_participant: false, request: null }));
        setFeedback("Você saiu da vaga.");
      } else {
        await api.delete("/vacancies/" + id + "/participants/" + decision.user.id, null, true);
        setParticipants(current => current.filter(item => item.user.id !== decision.user.id));
        setFeedback("Participante removido da vaga.");
      }
      setDecision(null);
    } catch (failure) { setDecisionError(getErrorMessage(failure)); }
    finally { setBusy(false); inFlight.current = false; }
  };
  const ended = vacancy && new Date(vacancy.ends_at).getTime() <= now;
  const invite = async email => {
    if (inFlight.current || !manage || ended) return;
    inFlight.current = true; setBusy(true); setInviteError(""); setFeedback("");
    try {
      const response = await api.post("/invitations", { recipient_email: email, invitation_type: "vacancy", target_id: vacancy.id }, false, true);
      setFeedback(response.data.message);
      setInviteOpen(false);
    } catch (failure) { setInviteError(getErrorMessage(failure)); }
    finally { inFlight.current = false; setBusy(false); }
  };
  return (
    <ManagementLayout
      className="vacancy-details"
      title={vacancy?.title ?? "Detalhes da vaga"}
      subtitle={vacancy?.entity?.name}
      backTo={state?.from ?? "/inicio"}
    >
      {decision && <Confirmation mode="confirm" text={decision.text} onResponse={respond} isLoading={busy} error={decisionError} />}
      {inviteOpen && manage && <EntityInviteModal title="Convidar para vaga" description={`Informe o e-mail de quem você quer convidar para ${vacancy.title}.`} isLoading={busy} error={inviteError} onSubmit={invite} onClose={() => { if (!busy) setInviteOpen(false); }} />}
      {error && <p role="alert" className="management-feedback management-feedback--error">{error}</p>}
      {feedback && <p role="status" className="management-feedback management-feedback--success">{feedback}</p>}
      {loading ? <Loader /> : vacancy && <>
        <div className={styles.badges}>
          <span className={styles.badge}>{branches.find(item => item.value === vacancy.branch)?.label ?? vacancy.branch}</span>
          <span className={styles.badge + " " + (vacancy.modality === "remote" ? styles.remote : styles.inPerson)}>
            {modalities.find(item => item.value === vacancy.modality)?.label ?? vacancy.modality}
          </span>
          {ended && <span className={styles.badge + " " + styles.ended}>Vaga encerrada</span>}
        </div>

        <dl className={styles.schedule}>
          <div><dt>Início da atividade</dt><dd><time dateTime={vacancy.starts_at}>{formatDate(vacancy.starts_at)}</time></dd></div>
          <div><dt>Término da atividade</dt><dd><time dateTime={vacancy.ends_at}>{formatDate(vacancy.ends_at)}</time></dd></div>
          <div><dt>Tipo de inscrição</dt><dd>{vacancy.requires_approval ? "Sujeita à aprovação" : "Confirmação automática"}</dd></div>
        </dl>

        <div className={styles.contentGrid}>
          <section className={styles.description}>
            <h2 className={styles.sectionTitle}>Sobre a oportunidade</h2>
            <p className={styles.desc}>{vacancy.description}</p>
          </section>
          <section className={styles.location}>
            <h2 className={styles.sectionTitle}>{vacancy.modality === "in_person" ? "Local da atividade" : "Atividade remota"}</h2>
            {vacancy.modality === "in_person" ? <address>
              <p>{[vacancy.thoroughfare, vacancy.number].filter(Boolean).join(", ")}</p>
              {vacancy.details && <p>{vacancy.details}</p>}
              <p className={styles.city}>{vacancy.city} · {vacancy.uf?.toUpperCase()}</p>
              {vacancy.cep && <p>CEP {vacancy.cep.slice(0, 5) + "-" + vacancy.cep.slice(5)}</p>}
            </address> : <p>Participe de onde estiver. Esta oportunidade não exige deslocamento até a entidade.</p>}
          </section>
        </div>

        <section className={styles.participation} aria-label="Sua participação">
          <div>
            <h2 className={styles.sectionTitle}>Sua participação</h2>
            <p>{personal?.is_participant ? "Você está inscrito nesta oportunidade." : personal?.request?.status === "pending" ? "Seu pedido foi enviado. Aguarde a análise dos responsáveis." : vacancy.requires_approval ? "Envie sua solicitação para os responsáveis analisarem." : "Sua participação será confirmada após a inscrição."}</p>
          </div>
          {!loggedIn ? <Link className="management-button" to="/login">Entrar para participar</Link> :
            personal?.is_participant ? <button className="management-button management-button--danger-outline" disabled={busy} onClick={() => ask({ kind: "leave", text: "Quer sair da vaga " + vacancy.title + "?" })}>Sair da vaga</button> :
            personal?.request?.status === "pending" ? <span className="management-badge" role="status">Aguardando aprovação</span> :
            <button className="management-button" disabled={busy || ended || !personal} onClick={join}>{busy ? <Loader label="Enviando..." /> : ended ? "Inscrições encerradas" : "Inscrever-se na vaga"}</button>}
        </section>

        {manage && <section className={styles.management} aria-label="Gerenciar vaga">
          <h2 className={styles.sectionTitle}>Gerenciar vaga</h2>
          <div className={styles.actionRow}>
            <div className={styles.actionGroup}>
              <Link className="management-button" to={"/vagas/" + id + "/editar"}>Editar vaga</Link>
              <button className="management-button management-button--secondary" disabled={busy || participantsLoading} onClick={showParticipants}>{participantsLoading ? <Loader /> : participants ? "Ocultar participantes" : "Ver participantes"}</button>
              <button className="management-button management-button--secondary" style={{ cursor: busy || ended ? "not-allowed" : undefined }} disabled={busy || ended} onClick={() => { setInviteError(""); setInviteOpen(true); }}>Convidar para vaga</button>
            </div>
            <button className="management-button management-button--danger-outline" disabled={busy} onClick={() => ask({ kind: "delete", text: "Quer excluir a vaga " + vacancy.title + "?" })}>Excluir vaga</button>
          </div>
        </section>}

        {manage && participants && <section className={styles.participants} aria-label="Participantes da vaga">
          <h2 className={styles.sectionTitle}>Participantes <span className="management-badge">{participants.length}</span></h2>
          {participants.length === 0 ? <p className="management-feedback">Nenhum participante inscrito.</p> : participants.map(item => <article className={styles.participant} key={item.user.id}>
            <div><h3>{item.user.name}</h3><p>Participante desde {formatDate(item.joined_at)}</p></div>
            <button className="management-button management-button--danger-outline" disabled={busy} onClick={() => ask({ kind: "remove", user: item.user, text: "Quer remover " + item.user.name + " desta vaga?" })}>Remover voluntário</button>
          </article>)}
        </section>}
      </>}
    </ManagementLayout>
  );
}
