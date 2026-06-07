import { Link } from "react-router-dom";
import { useState } from "react";
<<<<<<< HEAD
import RegisterHeader from "../components/RegisterHeader/RegisterHeader";
import CidadeEstado from "../components/CityState/CidadeEstado";
import img from "../assets/comunity.jpg";
=======
import Header from "../components/Header/Header";
import { api } from "../services/api";
>>>>>>> c28b464f11624243579533661901bdbc94ff84ff
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
// Metodologia: Register controla o formulário, RegisterHeader fica só com o cabeçalho e CidadeEstado cuida dos selects.
// Função: reunir layout, estado dos campos, máscaras e validações em uma única tela de cadastro.
const Register = () => {
  // IA: formData guarda os inputs comuns do formulário.
  // Função: transformar os campos em componentes controlados pelo React.
  const [formData, setFormData] = useState(initialFormData);

  // IA: estadoSelecionado e cidadeSelecionada controlam o componente CidadeEstado.
  // Metodologia: deixar esses valores no Register permite validar localização no submit.
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);

  // IA: errors guarda mensagens específicas de cada campo.
  // Função: exibir feedback abaixo do campo e destacar bordas inválidas.
  const [errors, setErrors] = useState({});

<<<<<<< HEAD
  // IA: submitMessage mostra feedback geral inspirado no antigo main.js.
  // Metodologia: em vez de jQuery/alert fixo, uso estado React para mensagem visual e alert no submit inválido.
  const [submitMessage, setSubmitMessage] = useState("");
=======
  // IA: Estados para controlar o carregamento e mensagens de feedback
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const isSuccess = message.type === "success";

  // IA: handleInputChange atualiza o estado do formulário e aplica máscaras quando necessário.
  // IA: Também limpa o erro do campo assim que o usuário começa a digitar.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let maskedValue = value;
>>>>>>> c28b464f11624243579533661901bdbc94ff84ff

  // IA: Aplica máscaras importadas de validations.js antes de salvar no estado.
  // Função: padronizar nome, email, data e CPF durante a digitação.
  const applyMask = (name, value) => {
    if (name === "fullName") return maskName(value);
    if (name === "email") return maskEmail(value);
    if (name === "birthDate") return maskDate(value);
    if (name === "cpf") return maskCPF(value);
    return value;
  };

  // IA: Atualiza um campo textual do formulário.
  // Metodologia: limpa erro e mensagem geral quando o usuário corrige o campo.
  // Função: manter interface responsiva sem esperar novo submit para remover feedback antigo.
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
    setSubmitMessage("");
  };

  // IA: Atualiza o estado escolhido no select.
  // Função: limpar erro de estado e permitir que CidadeEstado atualize as cidades disponíveis.
  const handleEstadoChange = (estado) => {
    setEstadoSelecionado(estado);
    setErrors((currentErrors) => ({
      ...currentErrors,
      state: "",
      city: "",
    }));
    setSubmitMessage("");
  };

  // IA: Atualiza a cidade escolhida no select.
  // Função: limpar erro de cidade quando o usuário faz uma seleção válida.
  const handleCidadeChange = (cidade) => {
    setCidadeSelecionada(cidade);
    setErrors((currentErrors) => ({
      ...currentErrors,
      city: "",
    }));
    setSubmitMessage("");
  };

  // IA: Validação central do formulário.
  // Metodologia: combina as regras do validations.js com a ideia do main.js de contar campos inválidos.
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

<<<<<<< HEAD
  // IA: Submissão do formulário.
  // Metodologia: substitui o submitHandler do main.js por uma função React com preventDefault.
  // Função: validar, contar erros e preparar os dados para futura integração com backend.
  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateForm();
    const invalidFields = Object.keys(validationErrors).length;

    if (invalidFields > 0) {
      const message = `Possui ${invalidFields} campo${invalidFields > 1 ? "s" : ""} a ser${invalidFields > 1 ? "em" : ""} preenchido${invalidFields > 1 ? "s" : ""} corretamente.`;
      setSubmitMessage(message);
      alert(message);
      return;
=======
  // IA: handleSubmit previne o envio padrão do formulário e chama validateForm.
  // IA: Só prossegue se todos os dados estiverem válidos, então envia para o servidor.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Converter data de DD/MM/YYYY para YYYY-MM-DD
      const [day, month, year] = formData.birthDate.split("/");
      const formattedDate = `${year}-${month}-${day}`;

      const body = {
        nome: formData.fullName,
        email: formData.email,
        senha: formData.password,
        data_nasc: formattedDate,
        cidade: formData.city,
        uf: formData.state,
        admin: false,
      };

      await api.post("/auth/register", body);

      setMessage({
        type: "success",
        text: "Conta criada com sucesso, confira sua caixa de entrada.",
      });

      // Limpar formulário após sucesso
      setFormData({
        fullName: "",
        email: "",
        birthDate: "",
        password: "",
        confirmPassword: "",
        cpf: "",
        phone: "",
        city: "",
        state: "",
      });
    } catch (erro) {
      const backendMessage =
        erro?.response?.data?.mensagem ||
        erro?.response?.data?.message ||
        "Erro de conexão. Verifique se o servidor está online.";

      setMessage({
        type: "error",
        text: backendMessage,
      });
      console.error("Erro:", erro);
    } finally {
      setIsLoading(false);
>>>>>>> c28b464f11624243579533661901bdbc94ff84ff
    }

    const registerPayload = {
      ...formData,
      state: estadoSelecionado.value,
      city: cidadeSelecionada.value,
    };

    setSubmitMessage("Formulário enviado!");
    console.log("Formulário enviado:", registerPayload);
  };

  return (
<<<<<<< HEAD
    <div className="register-page">
      <RegisterHeader />

      <main className="register-layout">
        {/* IA: Coluna de apresentação.
            Metodologia: separar conteúdo institucional do formulário reduz ruído visual.
            Função: contextualizar o cadastro e reforçar a proposta de voluntariado. */}
        <section className="register-intro" aria-labelledby="register-intro-title">
          <img src={img} alt="Comunidade reunida em ação voluntária" />

          <h2 id="register-intro-title">Junte-se à nossa comunidade</h2>
          <p>
            Conecte-se com organizações e faça a diferença na sua comunidade
            através do voluntariado.
          </p>
        </section>

        {/* IA: Coluna do formulário.
            Metodologia: card compacto com campos agrupados e feedback inline.
            Função: coletar os dados necessários para criar uma nova conta. */}
        <section className="register-panel" aria-labelledby="register-form-title">
          <div className="register-card">
            <div className="register-card__title">
              <h1 id="register-form-title">Criar conta</h1>
              <h3>Preencha os dados para se cadastrar</h3>
            </div>

            <form className="register-form" onSubmit={handleSubmit} noValidate>
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
                {errors.fullName && <span className="register-error">{errors.fullName}</span>}

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
                {errors.email && <span className="register-error">{errors.email}</span>}

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
                {errors.birthDate && <span className="register-error">{errors.birthDate}</span>}

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
                {errors.cpf && <span className="register-error">{errors.cpf}</span>}

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
                {errors.password && <span className="register-error">{errors.password}</span>}

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
                {errors.confirmPassword && <span className="register-error">{errors.confirmPassword}</span>}
              </div>

              <CidadeEstado
                estadoSelecionado={estadoSelecionado}
                cidadeSelecionada={cidadeSelecionada}
                onEstadoChange={handleEstadoChange}
                onCidadeChange={handleCidadeChange}
                errors={errors}
              />

              {submitMessage && (
                <p className="register-submit-message" role="status">
                  {submitMessage}
                </p>
              )}

              <button type="submit" className="button-criar">
                Criar conta
              </button>

              <p className="ja-possui-conta">Já possui uma conta?</p>

              <Link to="/login" className="button-entrar">
                Entrar
              </Link>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};
=======
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      {/* IA: O Header é um componente compartilhado usado em todas as páginas. */}
      {/* principal com dois lados */}
      <div
        style={{
          display: "flex",
          flex: "1",
        }}
      >
        {/* IA: Layout principal dividido em duas colunas, com apresentação à esquerda e formulário à direita. */}
        {/* esquerdo com ilustração */}
        <div
          style={{
            flex: "0 0 60%",
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 20px",
          }}
        >
          <img
            src="/community-illustration.png"
            alt="Comunidade"
            style={{
              width: "100%",
              maxWidth: "400px",
              marginBottom: "40px",
              objectFit: "contain",
            }}
          />
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "16px",
              color: "#000",
            }}
          >
            Junte-se à nossa comunidade
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#666",
              textAlign: "center",
              lineHeight: "1.6",
              maxWidth: "350px",
            }}
          >
            Conecte-se com organizações e faça diferença na sua comunidade
            através do voluntariado.
          </p>
        </div>

        {/* IA: Seção direita do layout onde o formulário de cadastro é exibido dentro de um card. */}
        {/* direito com card */}

        <div
          style={{
            flex: "0 0 40%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            backgroundColor: "#fff",
          }}
        >
          {/* é um card */}

          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "40px",
              borderRadius: "12px",
              backgroundColor: "#ededc5",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* ficarem organizados no meio */}

            <div
              style={{
                textAlign: "center",
              }}
            >
              <h1>Criar conta</h1>
              <h2
                style={{
                  opacity: "0.6",
                  fontSize: "14px",
                  fontWeight: "normal",
                  color: "#666",
                }}
              >
                Preencha os dados para se cadastrar
              </h2>
            </div>

            {message.text && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  backgroundColor:
                    message.type === "success" ? "#d4edda" : "#f8d7da",
                  color: message.type === "success" ? "#155724" : "#721c24",
                  border: `1px solid ${
                    message.type === "success" ? "#c3e6cb" : "#f5c6cb"
                  }`,
                  textAlign: "center",
                  fontSize: "14px",
                }}
              >
                {message.text}
              </div>
            )}

            {isSuccess ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    backgroundColor: "#6366f1",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginTop: "10px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#4f46e5")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#6366f1")
                  }
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                >
                  Ir para login
                </button>
              </div>
            ) : (
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
                onSubmit={handleSubmit}
              >
                {/* IA: Formulário com validação no submit. handleSubmit controla o fluxo e chama validateForm. */}

                {/* encima e input embaixo */}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                    }}
                  >
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome completo"
                    style={{
                      padding: "10px",
                      border: errors.fullName
                        ? "1px solid #ff6b6b"
                        : "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.fullName && (
                    <span
                      style={{
                        color: "#ff6b6b",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.fullName}
                    </span>
                  )}
                </div>

                {/* encima e input embaixo */}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                    }}
                  >
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Digite seu e-mail"
                    style={{
                      padding: "10px",
                      border: errors.email
                        ? "1px solid #ff6b6b"
                        : "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.email && (
                    <span
                      style={{
                        color: "#ff6b6b",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* encima e input embaixo */}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                    }}
                  >
                    Data de nascimento
                  </label>
                  <input
                    type="text"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YYYY"
                    maxLength="10"
                    style={{
                      padding: "10px",
                      border: errors.birthDate
                        ? "1px solid #ff6b6b"
                        : "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.birthDate && (
                    <span
                      style={{
                        color: "#ff6b6b",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.birthDate}
                    </span>
                  )}
                </div>

                {/* encima e input embaixo */}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                    }}
                  >
                    CPF
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="XXX.XXX.XXX-XX"
                    maxLength="14"
                    style={{
                      padding: "10px",
                      border: errors.cpf
                        ? "1px solid #ff6b6b"
                        : "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.cpf && (
                    <span
                      style={{
                        color: "#ff6b6b",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.cpf}
                    </span>
                  )}
                </div>

                {/* encima e input embaixo */}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                    }}
                  >
                    Senha
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Digite sua senha"
                    style={{
                      padding: "10px",
                      border: errors.password
                        ? "1px solid #ff6b6b"
                        : "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.password && (
                    <span
                      style={{
                        color: "#ff6b6b",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.password}
                    </span>
                  )}
                </div>

                {/* linha que separa senha de confirmar senha */}

                <span
                  style={{
                    width: "100%",
                    height: "1px",
                    backgroundColor: "#000",
                    opacity: ".15",
                    display: "block",
                    margin: "10px 0",
                  }}
                ></span>

                {/* encima e input embaixo */}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "5px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                    }}
                  >
                    Confirmar senha
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirme sua senha"
                    style={{
                      padding: "10px",
                      border: errors.confirmPassword
                        ? "1px solid #ff6b6b"
                        : "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                  {errors.confirmPassword && (
                    <span
                      style={{
                        color: "#ff6b6b",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  {/* encima e input embaixo */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "5px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "6px",
                      }}
                    >
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Sua cidade"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px",
                        border: errors.city
                          ? "1px solid #ff6b6b"
                          : "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                    />
                    {errors.city && (
                      <span
                        style={{
                          color: "#ff6b6b",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {errors.city}
                      </span>
                    )}
                  </div>

                  {/* encima e input embaixo */}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "5px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "6px",
                      }}
                    >
                      Estado (UF)
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="SP, RJ, MG..."
                      maxLength="2"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px",
                        border: errors.state
                          ? "1px solid #ff6b6b"
                          : "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        textTransform: "uppercase",
                      }}
                    />
                    {errors.state && (
                      <span
                        style={{
                          color: "#ff6b6b",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {errors.state}
                      </span>
                    )}
                  </div>
                </div>

                {/* botao que preenche todo espaço horizontal */}

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    backgroundColor: isLoading ? "#ccc" : "#6366f1",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    marginTop: "10px",
                    transition: "background-color 0.2s",
                    opacity: isLoading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) =>
                    !isLoading && (e.target.style.backgroundColor = "#4f46e5")
                  }
                  onMouseLeave={(e) =>
                    !isLoading && (e.target.style.backgroundColor = "#6366f1")
                  }
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  ); // IA: Fecho o JSX principal do componente Register.
}; // IA: Fecho a declaração do componente Register.
>>>>>>> c28b464f11624243579533661901bdbc94ff84ff

export default Register;
