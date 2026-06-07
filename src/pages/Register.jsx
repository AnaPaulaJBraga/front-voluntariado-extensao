import { Link } from "react-router-dom";
import { useState } from "react";
import RegisterHeader from "../components/RegisterHeader/RegisterHeader";
import CidadeEstado from "../components/CityState/CidadeEstado";
import img from "../assets/comunity.jpg";
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

  // IA: submitMessage mostra feedback geral inspirado no antigo main.js.
  // Metodologia: em vez de jQuery/alert fixo, uso estado React para mensagem visual e alert no submit inválido.
  const [submitMessage, setSubmitMessage] = useState("");

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

export default Register;
