import { Link } from "react-router-dom";
import { useState } from "react";
import RegisterHeader from "../components/RegisterHeader/RegisterHeader";
import CidadeEstado from "../components/CityState/CidadeEstado";
import img from "../assets/comunity.jpg";
import { api } from "../services/api";
import {
  isValidCPF,
  isValidDate,
  isValidEmail,
  isValidFullName,
  isValidPassword,
  maskCPF,
  maskDate,
  maskEmail,
  maskName,
} from "../utils/validations";
import "./Register.css";

const initialFormData = {
  fullName: "",
  email: "",
  birthDate: "",
  cpf: "",
  password: "",
  confirmPassword: "",
};

// IA: Página completa de cadastro.
// Metodologia: Register controla formulário, layout, validação e envio; RegisterHeader fica só com o cabeçalho.
// Função: reunir a experiência de cadastro sem duplicar formulário em outros componentes.
const Register = () => {
  // IA: formData guarda os inputs comuns do formulário como componentes controlados.
  const [formData, setFormData] = useState(initialFormData);

  // IA: Estado e cidade ficam no Register para validar e montar o payload do backend.
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);

  // IA: errors guarda mensagens específicas para feedback inline.
  const [errors, setErrors] = useState({});

  // IA: isLoading e message controlam o feedback de envio para a API.
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const isSuccess = message.type === "success";

  // IA: Aplica máscaras importadas de validations.js antes de salvar no estado.
  // Função: padronizar nome, email, data e CPF enquanto o usuário digita.
  const applyMask = (name, value) => {
    if (name === "fullName") return maskName(value);
    if (name === "email") return maskEmail(value);
    if (name === "birthDate") return maskDate(value);
    if (name === "cpf") return maskCPF(value);
    return value;
  };

  // IA: Atualiza um campo textual do formulário.
  // Metodologia: limpa erro e mensagem geral ao editar para evitar feedback antigo.
  // Função: manter a interface responsiva durante a correção dos campos.
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const maskedValue = applyMask(name, value);

    setFormData((currentData) => ({
      ...currentData,
      [name]: maskedValue,
    }));

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

    if (!isValidFullName(formData.fullName)) {
      newErrors.fullName = "Digite nome e sobrenome.";
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = "Digite um email válido.";
    }

    if (!isValidDate(formData.birthDate)) {
      newErrors.birthDate = "Use uma data válida no formato DD/MM/AAAA.";
    }

    if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = "Digite um CPF válido.";
    }

    if (!isValidPassword(formData.password)) {
      newErrors.password = "A senha deve ter pelo menos 8 caracteres.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não conferem.";
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

  // IA: Converte DD/MM/AAAA para AAAA-MM-DD.
  // Função: adequar a data digitada ao formato normalmente esperado pelo backend.
  const formatBirthDateForApi = (birthDate) => {
    const [day, month, year] = birthDate.split("/");
    return `${year}-${month}-${day}`;
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
        nome: formData.fullName,
        email: formData.email,
        cpf: formData.cpf.replace(/\D/g, ""),
        senha: formData.password,
        data_nasc: formatBirthDateForApi(formData.birthDate),
        cidade: cidadeSelecionada.value,
        uf: estadoSelecionado.value,
        admin: false,
      };

      await api.post("/auth/register", body);

      setMessage({
        type: "success",
        text: "Conta criada com sucesso, confira sua caixa de entrada.",
      });
      setFormData(initialFormData);
      setEstadoSelecionado(null);
      setCidadeSelecionada(null);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Ocorreu um erro ao criar a conta. Tente novamente.";

      setMessage({ type: "error", text: backendMessage });
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <RegisterHeader />

      <main className="register-layout">
        {/* IA: Coluna de apresentação.
            Metodologia: separar contexto institucional do formulário reduz ruído visual.
            Função: explicar rapidamente a proposta da plataforma. */}
        <section
          className="register-intro"
          aria-labelledby="register-intro-title"
        >
          <img src={img} alt="Comunidade reunida em ação voluntária" />

          <h2 id="register-intro-title">Junte-se à nossa comunidade</h2>
          <p>
            Conecte-se com organizações e faça a diferença na sua comunidade
            através do voluntariado.
          </p>
        </section>

        {/* IA: Coluna do formulário.
            Metodologia: card compacto com campos agrupados, validação inline e feedback geral.
            Função: coletar dados para criação de conta. */}
        <section
          className="register-panel"
          aria-labelledby="register-form-title"
        >
          <div className="register-card">
            <div className="register-card__title">
              <h1 id="register-form-title">Criar conta</h1>
              <h3>Preencha os dados para se cadastrar</h3>
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
              <Link to="/login" className="button-criar button-criar--link">
                Ir para login
              </Link>
            ) : (
              <form
                className="register-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="form-container">
                  <label htmlFor="fullName">Nome completo</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome completo"
                    className={errors.fullName ? "input-error" : ""}
                  />
                  {errors.fullName && (
                    <span className="register-error">{errors.fullName}</span>
                  )}

                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Digite seu email"
                    className={errors.email ? "input-error" : ""}
                  />
                  {errors.email && (
                    <span className="register-error">{errors.email}</span>
                  )}

                  <label htmlFor="birthDate">Data de nascimento</label>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="text"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    placeholder="DD/MM/AAAA"
                    maxLength="10"
                    className={errors.birthDate ? "input-error" : ""}
                  />
                  {errors.birthDate && (
                    <span className="register-error">{errors.birthDate}</span>
                  )}

                  <label htmlFor="cpf">CPF</label>
                  <input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    maxLength="14"
                    className={errors.cpf ? "input-error" : ""}
                  />
                  {errors.cpf && (
                    <span className="register-error">{errors.cpf}</span>
                  )}

                  <label htmlFor="password">Senha</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Digite sua senha"
                    className={errors.password ? "input-error" : ""}
                  />
                  {errors.password && (
                    <span className="register-error">{errors.password}</span>
                  )}

                  <label htmlFor="confirmPassword">Confirmar senha</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirme sua senha"
                    className={errors.confirmPassword ? "input-error" : ""}
                  />
                  {errors.confirmPassword && (
                    <span className="register-error">
                      {errors.confirmPassword}
                    </span>
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
      </main>
    </div>
  );
};

export default Register;
