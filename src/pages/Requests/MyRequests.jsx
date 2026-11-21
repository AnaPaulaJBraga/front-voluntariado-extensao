import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ManagementLayout from "../../components/ManagementLayout/ManagementLayout";
import Loader from "../../components/Loader/Loader";
import { api } from "../../services/api";
import { formatDate, getErrorMessage, requestLabels } from "../../utils/management";
import "./MyRequests.css";

export default function MyRequests() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([api.get("/entities/join-requests/me", true), api.get("/vacancies/join-requests/me", true)])
      .then(([entities, vacancies]) => {
        if (!active) return;
        setItems([...entities.data.map(item => ({ ...item, kind: "entity" })), ...vacancies.data.map(item => ({ ...item, kind: "vacancy" }))]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setError("");
      }).catch(failure => { if (active) setError(getErrorMessage(failure)); });
    return () => { active = false; };
  }, [reload]);
  const filtered = (items ?? []).filter(item => (kind === "all" || item.kind === kind) && (status === "all" || item.status === status));
  return <ManagementLayout className="my-requests" title="Minhas solicitações" subtitle="Acompanhe seus pedidos para entrar em entidades e participar de vagas.">
    <div className="management-toolbar">
      <label className="management-field">Tipo<select value={kind} onChange={e => setKind(e.target.value)}><option value="all">Todos</option><option value="entity">Entidades</option><option value="vacancy">Vagas</option></select></label>
      <label className="management-field">Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="all">Todos</option>{Object.entries(requestLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    {error ? <div role="alert" className="management-feedback management-feedback--error">{error}<div className="management-actions"><button className="management-button" onClick={() => setReload(n => n + 1)}>Tentar novamente</button></div></div> : items === null ? <Loader /> :
      <div className="management-list">{filtered.length === 0 ? <p className="management-feedback">Nenhuma solicitação encontrada neste filtro.</p> : filtered.map(item => <article className="my-request-card" key={item.kind + item.id}>
        <div className="my-request-card__heading">
          <div>
            <p className="my-request-card__kind">{item.kind === "entity" ? "Entrada na entidade" : "Participação na vaga"}</p>
            <h1 className="my-request-card__title">{item.kind === "entity" ? item.entity.name : item.vacancy.title}</h1>
          </div>
          <span className={"management-badge my-request-card__status--" + item.status}>{requestLabels[item.status] ?? item.status}</span>
        </div>
        <dl className="my-request-card__dates">
          <div><dt>Solicitado em</dt><dd><time dateTime={item.created_at}>{formatDate(item.created_at)}</time></dd></div>
          <div><dt>{item.reviewed_at ? "Respondido em" : "Andamento"}</dt><dd>{item.reviewed_at ? <time dateTime={item.reviewed_at}>{formatDate(item.reviewed_at)}</time> : "Aguardando análise"}</dd></div>
        </dl>
        <footer className="my-request-card__footer">
          <Link className="management-button management-button--secondary" to={item.kind === "entity" ? "/entidade/sobre/" + item.entity.slug : "/vagas/" + item.vacancy.id} state={{ from: "/minhas-solicitacoes" }}>Ver {item.kind === "entity" ? "entidade" : "vaga"} <span aria-hidden="true">→</span></Link>
        </footer>
      </article>)}</div>}
  </ManagementLayout>;
}
