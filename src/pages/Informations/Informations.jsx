import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ManagementLayout from "../../components/ManagementLayout/ManagementLayout";
import Loader from "../../components/Loader/Loader";
import Confirmation from "../../components/Confirmation/Confirmation";
import { useEntity } from "../../contexts/EntityContexts";
import { api } from "../../services/api";
import { getErrorMessage } from "../../utils/management";

export default function Informations() {
  const { slug } = useParams();
  return <EntityInformation key={slug} slug={slug} />;
}
function EntityInformation({ slug }) {
  const { membership, isLoading: membershipLoading, error: membershipError } = useEntity();
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState(null);
  const [requestError, setRequestError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const inFlight = useRef(false);
  const loggedIn = Boolean(localStorage.getItem("access_token"));
  useEffect(() => {
    let active = true;
    api.get("/entities?slug=" + encodeURIComponent(slug)).then(response => {
      if (active) { setEntity(response.data[0] ?? null); if (!response.data.length) setError("Entidade não encontrada."); }
    }).catch(failure => { if (active) setError(getErrorMessage(failure)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);
  useEffect(() => {
    if (!loggedIn) return;
    let active = true;
    api.get("/entities/join-requests/me", true)
      .then(response => { if (active) { setRequests(response.data); setRequestError(""); } })
      .catch(failure => { if (active) setRequestError(getErrorMessage(failure, "Não foi possível consultar suas solicitações.")); });
    return () => { active = false; };
  }, [loggedIn, reload]);
  const pending = requests?.some(item => item.entity.id === entity?.id && item.status === "pending");
  const requestEntry = async confirmed => {
    if (inFlight.current) return;
    if (!confirmed) { setConfirming(false); return; }
    inFlight.current = true;
    setBusy(true); setRequestError("");
    try {
      const response = await api.post(`/entities/${entity.id}/join-requests`, null, false, true);
      setRequests(current => [response.data, ...(current ?? [])]);
      setConfirming(false);
    } catch (failure) { setRequestError(getErrorMessage(failure)); }
    finally { inFlight.current = false; setBusy(false); }
  };
  const ownEntity = membership?.entity?.id === entity?.id;
  return <ManagementLayout title={entity?.name ?? "Informações da entidade"} subtitle={entity?.sector}>
    {confirming && <Confirmation mode="confirm" text={`Quer solicitar entrada na entidade ${entity.name}? Os administradores vão analisar seu pedido.`} onResponse={requestEntry} isLoading={busy} error={requestError} />}
    {loading ? <Loader /> : error ? <p role="alert" className="management-feedback management-feedback--error">{error}</p> : entity && <>
      <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>{entity.description}</p>
      <p>{entity.city}, {entity.uf}</p>
      <p>Cadastrada em {entity.created_at.split("-").reverse().join("/")}</p>
      {!ownEntity && <section className="management-item" aria-label="Participação na entidade">
        <h2>Faça parte desta entidade</h2>
        {!loggedIn ? <><p>Entre na sua conta para solicitar participação.</p><Link className="management-button" to="/login">Entrar para participar</Link></> :
          membershipLoading ? <Loader /> : membershipError ? <p role="alert" className="management-feedback management-feedback--error">Não foi possível verificar sua entidade. Recarregue a página para tentar novamente.</p> :
          membership ? <><p>Você já participa de {membership.entity.name}. Para solicitar entrada aqui, primeiro é necessário sair da sua entidade atual.</p><Link className="management-button management-button--secondary" to="/entidade/membros">Ver minha participação</Link></> : <>
            <p>Seu pedido será analisado pelos administradores. Você pode acompanhar a resposta em Minhas solicitações.</p>
            {requestError && !confirming && <p role="alert" className="management-feedback management-feedback--error">{requestError}</p>}
            {pending ? <p role="status" className="management-feedback">Solicitação enviada. Aguardando aprovação.</p> : requests === null ? requestError ? <button className="management-button management-button--secondary" onClick={() => setReload(n => n + 1)}>Tentar novamente</button> : <Loader /> : <button className="management-button" disabled={busy} onClick={() => { setRequestError(""); setConfirming(true); }}>Solicitar entrada</button>}
            <div className="management-actions"><Link className="management-button management-button--secondary" to="/minhas-solicitacoes">Minhas solicitações</Link></div>
          </>}
      </section>}
      <div className="management-actions">
        {ownEntity && membership.position === "admin" && <Link className="management-button" to="/entidade/editar">Editar entidade</Link>}
        {ownEntity && <Link className="management-button management-button--secondary" to="/entidade/membros">Membros e minha participação</Link>}
        <Link className="management-button management-button--secondary" to="/organizacoes">Voltar às organizações</Link>
      </div>
    </>}
  </ManagementLayout>;
}
