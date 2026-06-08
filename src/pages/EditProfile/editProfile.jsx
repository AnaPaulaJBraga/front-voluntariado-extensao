import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterHeader from "../../components/RegisterHeader/RegisterHeader";
import CidadeEstado from "../../components/CityState/CidadeEstado";
import { api } from "../../services/api";
import {
  isValidDate,
  isValidEmail,
  isValidFullName,
  isValidPassword,
  maskCPF,
  maskDate,
  maskEmail,
  maskName,
} from "../../utils/validations";
import "./editProfile.css";

const initialFormData = {
  fullName: "",
  email: "",
  cpf: "",
  birthDate: "",
};

const initialPasswordData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const formatDateFromApi = (dateValue) => {
  if (!dateValue || typeof dateValue !== "string") {
    return "";
  }

  if (dateValue.includes("/")) {
    return dateValue;
  }

  if (dateValue.includes("-")) {
    const [year, month, day] = dateValue.split("-");
    return `${day}/${month}/${year}`;
  }

  return dateValue;
};

const EditProfile = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/inicio");
  };

  const [formData, setFormData] = useState(initialFormData);
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);

  const [passwordData, setPasswordData] = useState(initialPasswordData);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await api.get("/user/me", true);
        const user = response.data;

        setFormData({
          fullName: user.nome ?? "",
          email: user.email ?? "",
          cpf: user.cpf ? maskCPF(String(user.cpf)) : "",
          birthDate: formatDateFromApi(user.data_nasc),
        });

        if (user.uf) {
          setEstadoSelecionado({ value: user.uf, label: user.uf });
        }

        if (user.cidade) {
          setCidadeSelecionada({ value: user.cidade, label: user.cidade });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setMessage({
          type: "error",
          text: "Não foi possível carregar seus dados. Tente novamente.",
        });
      } finally {
        setIsLoadingPage(false);
      }
    };

    loadUserProfile();
  }, []);

  const applyMask = (name, value) => {
    if (name === "fullName") return maskName(value);
    if (name === "email") return maskEmail(value);
    if (name === "birthDate") return maskDate(value);
    return value;
  };

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

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
    setMessage({ type: "", text: "" });
  };

  const handleEstadoChange = (estado) => {
    setEstadoSelecionado(estado);
    setErrors((currentErrors) => ({
      ...currentErrors,
      state: "",
      city: "",
    }));
    setMessage({ type: "", text: "" });
  };

  const handleCidadeChange = (cidade) => {
    setCidadeSelecionada(cidade);
    setErrors((currentErrors) => ({
      ...currentErrors,
      city: "",
    }));
    setMessage({ type: "", text: "" });
  };

  const validateProfileForm = () => {
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

    if (!estadoSelecionado) {
      newErrors.state = "Escolha um estado.";
    }

    if (!cidadeSelecionada) {
      newErrors.city = "Escolha uma cidade.";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = "Digite sua senha atual.";
    }

    if (!isValidPassword(passwordData.newPassword)) {
      newErrors.newPassword = "A nova senha deve ter pelo menos 8 caracteres.";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não conferem.";
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      newErrors.newPassword = "A nova senha deve ser diferente da atual.";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const formatBirthDateForApi = (birthDate) => {
    if (!birthDate) return null;
    const [day, month, year] = birthDate.split("/");
    return `${year}-${month}-${day}`;
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    const validationErrors = validateProfileForm();
    const invalidFields = Object.keys(validationErrors).length;

    if (invalidFields > 0) {
      const invalidMessage = `Possui ${invalidFields} campo${invalidFields > 1 ? "s" : ""} a ser${invalidFields > 1 ? "em" : ""} preenchido${invalidFields > 1 ? "s" : ""} corretamente.`;
      setMessage({ type: "error", text: invalidMessage });
      alert(invalidMessage);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setMessage({
          type: "error",
          text: "Sessão expirada. Faça login novamente.",
        });
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      const body = {
        nome: formData.fullName,
        data_nasc: formatBirthDateForApi(formData.birthDate),
        cidade: cidadeSelecionada.value,
        uf: estadoSelecionado.value,
      };

      await api.patch(`/user/me/${token}`, body, true);

      setMessage({
        type: "success",
        text: "Perfil atualizado com sucesso.",
      });
    } catch (error) {
      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Não foi possível atualizar o perfil. Tente novamente.";

      setMessage({ type: "error", text: backendMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    const validationErrors = validatePasswordForm();
    const invalidFields = Object.keys(validationErrors).length;

    if (invalidFields > 0) {
      const invalidMessage = `Possui ${invalidFields} campo${invalidFields > 1 ? "s" : ""} a ser${invalidFields > 1 ? "em" : ""} preenchido${invalidFields > 1 ? "s" : ""} corretamente.`;
      setMessage({ type: "error", text: invalidMessage });
      alert(invalidMessage);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setMessage({
          type: "error",
          text: "Sessão expirada. Faça login novamente.",
        });
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      const body = {
        senha_atual: passwordData.currentPassword,
        nova_senha: passwordData.newPassword,
        confirmar_nova_senha: passwordData.confirmPassword,
      };

      await api.patch(`/user/me/senha/${token}`, body, true);

      setMessage({
        type: "success",
        text: "Senha alterada com sucesso.",
      });

      setPasswordData(initialPasswordData);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Não foi possível alterar a senha. Verifique sua senha atual.";

      setMessage({ type: "error", text: backendMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPage) {
    return (
      <div className="register-page">
        <RegisterHeader />
        <main className="register-layout">
          <section className="register-intro">
            <h2>Carregando...</h2>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="register-page">
      <RegisterHeader />

      <main className="register-layout">
        <section
          className="register-panel"
          aria-labelledby="edit-profile-form-title"
        >
          <div className="register-card">
            <div className="register-card__title">
              <h1 id="edit-profile-form-title">Editar perfil</h1>
              <h3>Revise e salve as alterações do seu cadastro</h3>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "14px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ccd3df",
                  borderRadius: "6px",
                  background: activeTab === "profile" ? "#5d5fe8" : "#ffffff",
                  color: activeTab === "profile" ? "#ffffff" : "#384152",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Dados Pessoais
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("password")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccd3df",
                  background: activeTab === "password" ? "#5d5fe8" : "#ffffff",
                  color: activeTab === "password" ? "#ffffff" : "#384152",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Alterar Senha
              </button>
            </div>

            {message.text && (
              <p
                className={`register-submit-message register-submit-message--${message.type}`}
                role="status"
              >
                {message.text}
              </p>
            )}

            {activeTab === "profile" && (
              <form
                className="register-form"
                onSubmit={handleProfileSubmit}
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
                    className="input-disabled"
                    disabled
                  />
                  {errors.email && (
                    <span className="register-error">{errors.email}</span>
                  )}

                  <label htmlFor="cpf">CPF</label>
                  <input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={formData.cpf}
                    placeholder="000.000.000-00"
                    className="input-disabled"
                    disabled
                  />

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
                  {isLoading ? "Salvando..." : "Salvar alterações"}
                </button>
              </form>
            )}

            {activeTab === "password" && (
              <form
                className="register-form"
                onSubmit={handlePasswordSubmit}
                noValidate
              >
                <div className="form-container">
                  <label htmlFor="currentPassword">Senha atual</label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Digite sua senha atual"
                    className={errors.currentPassword ? "input-error" : ""}
                  />
                  {errors.currentPassword && (
                    <span className="register-error">
                      {errors.currentPassword}
                    </span>
                  )}

                  <label htmlFor="newPassword">Nova senha</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Digite a nova senha"
                    className={errors.newPassword ? "input-error" : ""}
                  />
                  {errors.newPassword && (
                    <span className="register-error">{errors.newPassword}</span>
                  )}

                  <label htmlFor="confirmPassword">Confirmar nova senha</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirme a nova senha"
                    className={errors.confirmPassword ? "input-error" : ""}
                  />
                  {errors.confirmPassword && (
                    <span className="register-error">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="button-criar"
                  disabled={isLoading}
                >
                  {isLoading ? "Alterando..." : "Alterar senha"}
                </button>
              </form>
            )}

            <p className="ja-possui-conta">Prefere sair sem mudar nada?</p>

            <button
              type="button"
              className="button-entrar"
              onClick={handleBack}
            >
              Voltar
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EditProfile;
