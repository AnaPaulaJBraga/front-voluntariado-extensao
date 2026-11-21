import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ManagementLayout from "../../components/ManagementLayout/ManagementLayout";
import Loader from "../../components/Loader/Loader";
import CidadeEstado from "../../components/CityState/CidadeEstado";
import { getEstadoOption } from "../../constants/estados";
import { entitySectors } from "../../constants/entitySectors";
import { useFlashMessage } from "../../components/FlashMessage/FlashMessage";
import { useEntity } from "../../contexts/EntityContexts";
import { api } from "../../services/api";
import { getErrorMessage, validateEntity } from "../../utils/management";

export default function EditEntity() {
  const { membership, isLoading, error } = useEntity();
  return <ManagementLayout title="Editar entidade" subtitle="Mantenha as informações da sua organização atualizadas.">
    {isLoading ? <Loader /> : error ? <p role="alert" className="management-feedback management-feedback--error">{getErrorMessage(error)}</p> : membership?.position !== "admin" ? <p role="alert" className="management-feedback">Somente administradores podem editar os dados da própria entidade.</p> : <EntityForm key={membership.entity.id} entity={membership.entity} />}
  </ManagementLayout>;
}

function EntityForm({ entity }) {
  const navigate = useNavigate();
  const showFlashMessage = useFlashMessage();
  const [data, setData] = useState({ name: entity.name, slug: entity.slug, sector: entitySectors.includes(entity.sector) ? entity.sector : "", description: entity.description, city: entity.city, uf: entity.uf });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const change = (field, value) => { setData(current => ({ ...current, [field]: value })); setErrors({}); setFeedback(null); };
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    const invalid = validateEntity(data);
    if (!entitySectors.includes(data.sector)) invalid.sector = "Selecione uma área de atuação da lista.";
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    setBusy(true);
    setFeedback(null);
    try {
      const response = await api.patch("/entities/" + entity.id, data, true);
      showFlashMessage("Entidade atualizada com sucesso");
      navigate("/entidade/sobre/" + encodeURIComponent(response.data.slug), { replace: true });
    } catch (failure) { setFeedback({ ok: false, text: getErrorMessage(failure) }); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} noValidate>
    {feedback && <p role={feedback.ok ? "status" : "alert"} className={"management-feedback management-feedback--" + (feedback.ok ? "success" : "error")}>{feedback.text}</p>}
    <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
      {[["name", "Nome", 100], ["slug", "Identificador na URL", 100], ["sector", "Área de atuação", 100], ["description", "Descrição", 2000]].map(([field, label, max]) => <label className="management-field" key={field}>{label}
        {field === "sector" ? <select value={data.sector} onChange={e => change("sector", e.target.value)} aria-invalid={Boolean(errors.sector)} required>
          <option value="">Selecione a área de atuação</option>
          {entitySectors.map(sector => <option key={sector} value={sector}>{sector}</option>)}
        </select> : field === "description" ? <textarea value={data[field]} maxLength={max} onChange={e => change(field, e.target.value)} aria-invalid={Boolean(errors[field])} /> : <input value={data[field]} maxLength={max} onChange={e => change(field, e.target.value)} aria-invalid={Boolean(errors[field])} />}
        {errors[field] && <span className="field-error">{errors[field]}</span>}
      </label>)}
      <CidadeEstado estadoSelecionado={getEstadoOption(data.uf)} cidadeSelecionada={data.city ? { value: data.city, label: data.city } : null} onEstadoChange={option => change("uf", option?.value ?? "")} onCidadeChange={option => change("city", option?.value ?? "")} errors={errors} />
    </fieldset>
    <div className="management-actions"><button className="management-button" disabled={busy}>{busy ? <Loader label="Salvando..." /> : "Salvar alterações"}</button><Link className="management-button management-button--secondary" to={"/entidade/sobre/" + entity.slug}>Voltar</Link></div>
  </form>;
}
