import { Link } from "react-router-dom";
import { useState } from "react";
import CidadeEstado from "../../components/CityState/CidadeEstado";
import img from "./../../assets/entities.png";
import { api } from "../../services/api";
import { normalizeSlug } from "../../utils/validations";
import { saveActiveContext } from "../../utils/activeContext";
import "./Entity.css";

const initialFormData = {
  name: "",
  slug: "",
  sector: "",
  description: "",
};

const setores = [
  "Animais",
  "Educação",
  "Alimentação",
  "Crianças e adolescentes",
  "Idosos",
  "Saúde",
  "Inclusão e Acessibilidade",
  "Meio ambiente",
  "Moradia e comunidade",
  "Doações e distribuição",
  "Assistência Social",
  "Esporte e lazer",
  "Cultura e Arte",
  "Tecnologia",
  "Ações Humanitárias",
];

// IA: Página completa de cadastro.
// Metodologia: Register controla formulário, layout, validação e envio; RegisterHeader fica só com o cabeçalho.
// Função: reunir a experiência de cadastro sem duplicar formulário em outros componentes.
const Entity = () => {
  // IA: formData guarda os inputs comuns do formulário como componentes controlados.
  const [formData, setFormData] = useState(initialFormData);

  // Estado e cidade são mantidos pelo componente compartilhado CidadeEstado.
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(false);

  // IA: errors guarda mensagens específicas para feedback inline.
  const [errors, setErrors] = useState({});

  // IA: isLoading e message controlam o feedback de envio para a API.
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const isSuccess = message.type === "success";

  // IA: Atualiza um campo textual do formulário.
  // Metodologia: limpa erro e mensagem geral ao editar para evitar feedback antigo.
  // Função: manter a interface responsiva durante a correção dos campos.
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const normalizedValue = name === "slug" ? normalizeSlug(value) : value;

    setFormData((currentData) => ({
      ...currentData,
      [name]: normalizedValue,
      ...(name === "name" && !slugEditadoManualmente
        ? { slug: normalizeSlug(value) }
        : {}),
    }));

    if (name === "slug") {
      setSlugEditadoManualmente(true);
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
    setMessage({ type: "", text: "" });
  };

  // IA: Atualiza o estado escolhido no select.
  // Função: limpar cidade e erros relacionados quando o estado muda.
  const handleEstadoChange = (estado) => {
    setEstadoSelecionado(estado);
    setErrors((currentErrors) => ({
      ...currentErrors,
      state: "",
      city: "",
    }));
    setMessage({ type: "", text: "" });
  };

  // IA: Atualiza a cidade escolhida no select.
  // Função: limpar erro de cidade quando uma seleção válida é feita.
  const handleCidadeChange = (cidade) => {
    setCidadeSelecionada(cidade);
    setErrors((currentErrors) => ({
      ...currentErrors,
      city: "",
    }));
    setMessage({ type: "", text: "" });
  };

  // IA: Validação central do formulário.
  // Metodologia: combina validations.js com a ideia do antigo main.js de contar campos inválidos.
  // Função: bloquear envio incompleto e devolver mensagens claras por campo.
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Digite o nome da entidade.";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Digite um slug válido.";
    }

    if (!formData.sector.trim()) {
      newErrors.sector = "Digite o setor da entidade.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Digite uma descrição válida.";
    }

    if (!estadoSelecionado) {
      newErrors.state = "Escolha um estado.";
    }

    if (!cidadeSelecionada) {
      newErrors.city = "Escolha uma cidade.";
    }

    setErrors(newErrors);
    return newErrors;
  };

  // IA: Submissão do formulário.
  // Metodologia: usa preventDefault, valida localmente, conta erros como o main.js antigo e envia via api.
  // Função: criar conta no backend e informar sucesso/erro ao usuário.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    const validationErrors = validateForm();
    const invalidFields = Object.keys(validationErrors).length;

    if (invalidFields > 0) {
      const invalidMessage = `Possui ${invalidFields} campo${invalidFields > 1 ? "s" : ""} a ser${invalidFields > 1 ? "em" : ""} preenchido${invalidFields > 1 ? "s" : ""} corretamente.`;
      setMessage({ type: "error", text: invalidMessage });
      alert(invalidMessage);
      return;
    }

    setIsLoading(true);

    try {
      const body = {
        name: formData.name,
        slug: formData.slug,
        sector: formData.sector,
        description: formData.description,
        city: cidadeSelecionada.value,
        uf: estadoSelecionado.value,
      };

      const response = await api.post("/entities", body, false, true);
      saveActiveContext("entity", response.data.id);

      setMessage({
        type: "success",
        text: "Entidade criada com sucesso!",
      });
      setFormData(initialFormData);
      setEstadoSelecionado(null);
      setCidadeSelecionada(null);
      setSlugEditadoManualmente(false);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Ocorreu um erro ao criar a entidade. Tente novamente.";

      setMessage({ type: "error", text: backendMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">

      <main className="register-layout">

        <section
          className="register-panel"
          aria-labelledby="register-form-title"
        >
          <div className="register-card">
            <div className="register-card__title">
              <h1 id="register-form-title">Cadastrar Organização</h1>
              <h3>Preencha os dados para cadastrar sua entidade</h3>
            </div>

            {message.text && (
              <p
                className={`register-submit-message register-submit-message--${message.type}`}
                role="status"
              >
                {message.text}
              </p>
            )}

            {isSuccess ? (
              <Link to="/inicio" className="button-criar button-criar--link">
                Ir para início da entidade
              </Link>
            ) : (
              <form
                className="register-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="form-container">
                  <label htmlFor="fullName">Nome da entidade</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nome da entidade"
                    className={errors.name ? "input-error" : ""}
                  />
                  {errors.name && (
                    <span className="register-error">{errors.name}</span>
                  )}

                  <label htmlFor="slug">Slug</label>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="Slug da entidade"
                    className={errors.slug ? "input-error" : ""}
                  />
                  {errors.slug && (
                    <span className="register-error">{errors.slug}</span>
                  )}

                  <label htmlFor="sector">Setor</label>
                  <select
                    id="sector"
                    name="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    className={errors.sector ? "input-error" : ""}
                  >
                    <option value="">Selecione o setor da entidade</option>
                    {setores.map((setor) => (
                      <option key={setor} value={setor}>
                        {setor}
                      </option>
                    ))}
                  </select>
                  {errors.sector && (
                    <span className="register-error">{errors.sector}</span>
                  )}

                  <label htmlFor="description">Descrição</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descrição da entidade"
                    className={errors.description ? "input-error" : ""}
                  />
                  {errors.description && (
                    <span className="register-error">{errors.description}</span>
                  )}

                </div>

                <CidadeEstado
                  estadoSelecionado={estadoSelecionado}
                  cidadeSelecionada={cidadeSelecionada}
                  onEstadoChange={handleEstadoChange}
                  onCidadeChange={handleCidadeChange}
                  errors={errors}
                />

                <button
                  type="submit"
                  className="button-criar"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </button>

                <p className="ja-possui-conta">Já possui uma conta?</p>

                <Link to="/login" className="button-entrar">
                  Entrar
                </Link>
              </form>
            )}
          </div>
        </section>
        <section
          className="register-intro"
          aria-labelledby="register-intro-title"
        >
          <img src={img} alt="Comunidade reunida em ação voluntária" />

          <h2 id="register-intro-title">Traga a sua organização</h2>
          <p>
            Cadastre a sua entidade e conecte-se com voluntários dispostos a fazer a diferença na sua comunidade.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Entity;
