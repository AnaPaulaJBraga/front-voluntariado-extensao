import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import Header from "../../components/Header/Header";
import CidadeEstado from "../../components/CityState/CidadeEstado";
import { branches } from "../../constants/branches";
import { getEstadoOption } from "../../constants/estados";
import { api } from "../../services/api";
import style from "./CreateVacancy.module.css";

const modalities = [
  { value: "remote", label: "Remoto" },
  { value: "in_person", label: "Presencial" },
];

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

const formatDate = (dateString) => new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo",
}).format(new Date(dateString));

const CreateVacancy = () => {
  // Os campos de texto ficam juntos, como no formulário de registro.
  const [formData, setFormData] = useState(initialFormData);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedModality, setSelectedModality] = useState(null);
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [membership, setMembership] = useState(null);
  const [isLoadingEntity, setIsLoadingEntity] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [createdVacancy, setCreatedVacancy] = useState(null);

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
      const response = await api.post("/vacancies", body, false, true);
      setCreatedVacancy(response.data);
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
        <main className={style.form}><p>Carregando sua entidade...</p></main>
      ) : !canCreate ? (
        <main className={style.form}>
          <p role="alert">{accessError || (membership
            ? "Somente administradores e editores podem criar vagas."
            : "Você precisa participar de uma entidade para criar vagas.")}</p>
          <Link to="/inicio">Voltar ao início</Link>
        </main>
      ) : createdVacancy ? (
        <main className={style.form} role="status">
          <h1>Vaga criada com sucesso!</h1>
          <p>Vaga #{createdVacancy.id}: {createdVacancy.title}</p>
          <p>Ramo: {branches.find((item) => item.value === createdVacancy.branch)?.label}</p>
          <p>Modalidade: {modalities.find((item) => item.value === createdVacancy.modality)?.label}</p>
          <p>Início: {formatDate(createdVacancy.starts_at)}</p>
          <p>Término: {formatDate(createdVacancy.ends_at)}</p>
          {createdVacancy.modality === "in_person" && (
            <p>Local: {createdVacancy.thoroughfare}, {createdVacancy.city}/{createdVacancy.uf}</p>
          )}
          <Link to="/inicio">Ver vagas da entidade</Link>
        </main>
      ) : (
        <form className={style.form} onSubmit={handleSubmit} noValidate>
          <h1>Criar vaga voluntária</h1>
          {message && <p role="alert">{message}</p>}

          <label htmlFor="title">Título da vaga:</label>
          <input id="title" type="text" name="title" maxLength={100}
            value={formData.title} onChange={handleInputChange} placeholder="Título da vaga" />
          {errors.title && <span>{errors.title}</span>}

          <label htmlFor="description">Descrição da vaga:</label>
          <textarea id="description" name="description" maxLength={255}
            value={formData.description} onChange={handleInputChange} placeholder="Descrição da vaga" />
          {errors.description && <span>{errors.description}</span>}

          <div style={{ display: "flex" }}>
            <div>
              <label htmlFor="startsAt">Data de início:</label>
              <input id="startsAt" type="datetime-local" name="startsAt"
                value={formData.startsAt} onChange={handleInputChange} />
              {errors.startsAt && <span>{errors.startsAt}</span>}
            </div>
            <div>
              <label htmlFor="endsAt">Data de término:</label>
              <input id="endsAt" type="datetime-local" name="endsAt"
                value={formData.endsAt} onChange={handleInputChange} />
              {errors.endsAt && <span>{errors.endsAt}</span>}
            </div>
          </div>

          <label htmlFor="branch">Ramo:</label>
          <Select inputId="branch" classNamePrefix="register-select"
            options={branches} value={selectedBranch} onChange={handleBranchChange}
            placeholder="Escolha um ramo" />
          {errors.branch && <span>{errors.branch}</span>}

          <label htmlFor="modality">Modalidade:</label>
          <Select inputId="modality" classNamePrefix="register-select"
            options={modalities} value={selectedModality} onChange={handleModalityChange}
            placeholder="Escolha uma modalidade" />
          {errors.modality && <span>{errors.modality}</span>}

          {isInPerson && (
            <div>
              <CidadeEstado estadoSelecionado={estadoSelecionado} cidadeSelecionada={cidadeSelecionada}
                onEstadoChange={handleEstadoChange} onCidadeChange={handleCidadeChange} errors={errors} />

              <label htmlFor="cep">CEP (opcional):</label>
              <input id="cep" type="text" name="cep" inputMode="numeric" maxLength={8}
                value={formData.cep} onChange={handleInputChange} placeholder="CEP" />
              {errors.cep && <span>{errors.cep}</span>}

              <label htmlFor="number">Número (opcional):</label>
              <input id="number" type="text" name="number" maxLength={50}
                value={formData.number} onChange={handleInputChange} placeholder="Número" />

              <label htmlFor="thoroughfare">Logradouro:</label>
              <input id="thoroughfare" type="text" name="thoroughfare" maxLength={100}
                value={formData.thoroughfare} onChange={handleInputChange} placeholder="Nome da rua ou avenida" />
              {errors.thoroughfare && <span>{errors.thoroughfare}</span>}

              <label htmlFor="details">Complemento (opcional):</label>
              <input id="details" type="text" name="details" maxLength={100}
                value={formData.details} onChange={handleInputChange} placeholder="Complemento" />
            </div>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando vaga..." : "Criar vaga"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateVacancy;
