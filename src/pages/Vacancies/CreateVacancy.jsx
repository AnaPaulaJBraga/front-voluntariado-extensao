import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import Header from "../../components/Header/Header";
import CidadeEstado from "../../components/CityState/CidadeEstado";
import { branches } from "../../constants/branches";
import { modalities } from "../../constants/modalities";
import { getEstadoOption } from "../../constants/estados";
import { api } from "../../services/api";
import { saveActiveContext } from "../../utils/activeContext";
import style from "./CreateVacancy.module.css";

const initialFormData = {
  title: "", description: "", startsAt: "", endsAt: "",
  cep: "", number: "", thoroughfare: "", details: "",
};

const getBackendMessage = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(" ");
  return "Não foi possível criar a vaga. Tente novamente.";
};

const CreateVacancy = () => {
  const navigate = useNavigate();

  // Os campos de texto ficam juntos, como no formulário de registro.
  const [formData, setFormData] = useState(initialFormData);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedModality, setSelectedModality] = useState(null);
  const [requireApproval, setRequireApproval] = useState(false);
  const [showApprovalInfo, setShowApprovalInfo] = useState(false);
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [membership, setMembership] = useState(null);
  const [isLoadingEntity, setIsLoadingEntity] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const options = [
    { value: "False", label: "Não" },
    { value: "True", label: "Sim" },
  ]

  const canCreate = membership?.position === "admin" || membership?.position === "editor";
  const isInPerson = selectedModality?.value === "in_person";

  // O backend confirma a entidade e a posição do usuário autenticado.
  useEffect(() => {
    let isCurrentPage = true;
    api.get("/entities/me", true)
      .then((response) => {
        if (!isCurrentPage) return;
        const currentMembership = response.data;
        setMembership(currentMembership);
        if (currentMembership?.entity) {
          setEstadoSelecionado(getEstadoOption(currentMembership.entity.uf));
          setCidadeSelecionada({
            value: currentMembership.entity.city,
            label: currentMembership.entity.city,
          });
        }
      })
      .catch((error) => {
        if (!isCurrentPage) return;
        setAccessError(error?.response?.status === 401
          ? "Faça login para criar uma vaga."
          : "Não foi possível carregar sua entidade. Tente novamente.");
      })
      .finally(() => {
        if (isCurrentPage) setIsLoadingEntity(false);
      });
    return () => { isCurrentPage = false; };
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const newValue = name === "cep" ? value.replace(/\D/g, "").slice(0, 8) : value;
    setFormData((currentData) => ({ ...currentData, [name]: newValue }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
    setMessage("");
  };

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
    setErrors((currentErrors) => ({ ...currentErrors, branch: "" }));
    setMessage("");
  };

  const handleModalityChange = (modality) => {
    setSelectedModality(modality);
    setErrors((currentErrors) => ({ ...currentErrors, modality: "" }));
    setMessage("");
    if (modality?.value === "remote") {
      setFormData((currentData) => ({
        ...currentData, cep: "", number: "", thoroughfare: "", details: "",
      }));
    }
  };

  const handleEstadoChange = (estado) => {
    setEstadoSelecionado(estado);
    setCidadeSelecionada(null);
    setErrors((currentErrors) => ({ ...currentErrors, state: "", city: "" }));
  };

  const handleCidadeChange = (cidade) => {
    setCidadeSelecionada(cidade);
    setErrors((currentErrors) => ({ ...currentErrors, city: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.title.trim().length < 3) newErrors.title = "Digite um título com pelo menos 3 caracteres.";
    if (!formData.description.trim()) newErrors.description = "Digite uma descrição.";
    if (!formData.startsAt) newErrors.startsAt = "Escolha a data e hora de início.";
    if (!formData.endsAt) newErrors.endsAt = "Escolha a data e hora de término.";
    if (!selectedBranch) newErrors.branch = "Escolha um ramo.";
    if (!selectedModality) newErrors.modality = "Escolha uma modalidade.";

    // datetime-local não informa fuso; aqui os horários são de Brasília.
    if (formData.startsAt && new Date(`${formData.startsAt}-03:00`).getTime() <= Date.now()) {
      newErrors.startsAt = "A data de início deve estar no futuro.";
    }
    if (formData.startsAt && formData.endsAt && formData.endsAt <= formData.startsAt) {
      newErrors.endsAt = "O término deve ser posterior ao início.";
    }
    if (isInPerson) {
      if (!estadoSelecionado) newErrors.state = "Escolha um estado.";
      if (!cidadeSelecionada) newErrors.city = "Escolha uma cidade.";
      if (!formData.thoroughfare.trim()) newErrors.thoroughfare = "Digite o nome da rua ou avenida.";
      if (formData.cep && formData.cep.length !== 8) newErrors.cep = "O CEP deve ter 8 dígitos.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!canCreate || !validateForm()) return;

    const body = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      id_entity: membership.entity.id,
      starts_at: formData.startsAt,
      ends_at: formData.endsAt,
      branch: selectedBranch.value,
      modality: selectedModality.value,
      requires_approval: requireApproval
    };
    if (isInPerson) {
      body.uf = estadoSelecionado.value;
      body.city = cidadeSelecionada.value;
      body.thoroughfare = formData.thoroughfare.trim();
      if (formData.cep) body.cep = formData.cep;
      if (formData.number.trim()) body.number = formData.number.trim();
      if (formData.details.trim()) body.details = formData.details.trim();
    }

    setIsSubmitting(true);
    try {
      await api.post("/vacancies", body, false, true);
      saveActiveContext("entity", membership.entity.id);
      navigate("/inicio", { replace: true });
    } catch (error) {
      setMessage(getBackendMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={style.registerPage}>
      <Header />
      {isLoadingEntity ? (
        <main className={style.form}>
          <p className={style.statusText}>Carregando sua entidade...</p>
        </main>
      ) : !canCreate ? (
        <main className={style.form}>
          <p className={`${style.feedback} ${style.feedbackError}`} role="alert">{accessError || (membership
            ? "Somente administradores e editores podem criar vagas."
            : "Você precisa participar de uma entidade para criar vagas.")}</p>
          <Link className={style.secondaryLink} to="/inicio">Voltar ao início</Link>
        </main>
      ) : (
        <form className={style.form} onSubmit={handleSubmit} noValidate>
          <h1 className={style.title}>Criar vaga voluntária</h1>
          <p className={style.subtitle}>Preencha os campos para publicar uma nova oportunidade da sua entidade.</p>
          {message && <p className={`${style.feedback} ${style.feedbackError}`} role="alert">{message}</p>}

          <div className={style.field}>
            <label className={style.label} htmlFor="title">Título da vaga</label>
            <input
              className={`${style.input} ${errors.title ? style.inputError : ""}`}
              id="title"
              type="text"
              name="title"
              maxLength={100}
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Título da vaga"
            />
            {errors.title && <span className={style.errorText}>{errors.title}</span>}
          </div>

          <div className={style.field}>
            <label className={style.label} htmlFor="description">Descrição da vaga</label>
            <textarea
              className={`${style.input} ${style.textarea} ${errors.description ? style.inputError : ""}`}
              id="description"
              name="description"
              maxLength={255}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descrição da vaga"
            />
            <span className={`${style.charCount} ${255 - formData.description.length <= 20 ? style.charCountWarning : ""}`}>
              {255 - formData.description.length} caracteres restantes
            </span>
            {errors.description && <span className={style.errorText}>{errors.description}</span>}
          </div>

          <div className={style.rowTwoCols}>
            <div className={style.field}>
              <label className={style.label} htmlFor="startsAt">Data de início</label>
              <input
                className={`${style.input} ${errors.startsAt ? style.inputError : ""}`}
                id="startsAt"
                type="datetime-local"
                name="startsAt"
                value={formData.startsAt}
                onChange={handleInputChange}
              />
              {errors.startsAt && <span className={style.errorText}>{errors.startsAt}</span>}
            </div>

            <div className={style.field}>
              <label className={style.label} htmlFor="endsAt">Data de término</label>
              <input
                className={`${style.input} ${errors.endsAt ? style.inputError : ""}`}
                id="endsAt"
                type="datetime-local"
                name="endsAt"
                value={formData.endsAt}
                onChange={handleInputChange}
              />
              {errors.endsAt && <span className={style.errorText}>{errors.endsAt}</span>}
            </div>

            <div className={style.field}>
              <label className={style.label} htmlFor="requiresApproval" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Exigir aprovação</label>
              <span
                  className={style.infoIcon}
                  onClick={() => setShowApprovalInfo(!showApprovalInfo)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setShowApprovalInfo(!showApprovalInfo)}
                >
                  ℹ
                </span>
              <input
                id="requiresApproval"
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
              />
              {showApprovalInfo && (
                <div className={style.infoBox}>
                  Caso esta opção esteja ativa, os administradores e editores da organização deverão aceitar cada inscrição para esta vaga.
                </div>
              )}
            </div>
          </div>

          <div className={style.field}>
            <label className={style.label} htmlFor="branch">Ramo</label>
            <Select
              inputId="branch"
              classNamePrefix="register-select"
              options={branches}
              value={selectedBranch}
              onChange={handleBranchChange}
              placeholder="Escolha um ramo"
            />
            {errors.branch && <span className={style.errorText}>{errors.branch}</span>}
          </div>

          <div className={style.field}>
            <label className={style.label} htmlFor="modality">Modalidade</label>
            <Select
              inputId="modality"
              classNamePrefix="register-select"
              options={modalities}
              value={selectedModality}
              onChange={handleModalityChange}
              placeholder="Escolha uma modalidade"
            />
            {errors.modality && <span className={style.errorText}>{errors.modality}</span>}
          </div>

          {isInPerson && (
            <section className={style.addressSection}>
              <h2 className={style.addressTitle}>Endereço da vaga presencial</h2>
              <CidadeEstado
                estadoSelecionado={estadoSelecionado}
                cidadeSelecionada={cidadeSelecionada}
                onEstadoChange={handleEstadoChange}
                onCidadeChange={handleCidadeChange}
                errors={errors}
              />

              <div className={style.rowTwoCols}>
                <div className={style.field}>
                  <label className={style.label} htmlFor="cep">CEP (opcional)</label>
                  <input
                    className={`${style.input} ${errors.cep ? style.inputError : ""}`}
                    id="cep"
                    type="text"
                    name="cep"
                    inputMode="numeric"
                    maxLength={8}
                    value={formData.cep}
                    onChange={handleInputChange}
                    placeholder="CEP"
                  />
                  {errors.cep && <span className={style.errorText}>{errors.cep}</span>}
                </div>

                <div className={style.field}>
                  <label className={style.label} htmlFor="number">Número (opcional)</label>
                  <input
                    className={style.input}
                    id="number"
                    type="text"
                    name="number"
                    maxLength={50}
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="Número"
                  />
                </div>
              </div>

              <div className={style.field}>
                <label className={style.label} htmlFor="thoroughfare">Logradouro</label>
                <input
                  className={`${style.input} ${errors.thoroughfare ? style.inputError : ""}`}
                  id="thoroughfare"
                  type="text"
                  name="thoroughfare"
                  maxLength={100}
                  value={formData.thoroughfare}
                  onChange={handleInputChange}
                  placeholder="Nome da rua ou avenida"
                />
                {errors.thoroughfare && <span className={style.errorText}>{errors.thoroughfare}</span>}
              </div>

              <div className={style.field}>
                <label className={style.label} htmlFor="details">Complemento (opcional)</label>
                <input
                  className={style.input}
                  id="details"
                  type="text"
                  name="details"
                  maxLength={100}
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="Complemento"
                />
              </div>
            </section>
          )}

          <button className={style.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando vaga..." : "Criar vaga"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateVacancy;
