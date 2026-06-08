import { useState } from "react";
import Header from "../../components/Header/Header";
import { api } from "../../services/api";
import "./Login.css";

const getLoginErrorMessage = (data) => {
  if (Array.isArray(data)) {
    return "Não foi possível fazer login. Tente novamente.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    if (Array.isArray(data.detail) || Array.isArray(data.message)) {
      return "Não foi possível fazer login. Tente novamente.";
    }
  }

  return "Não foi possível fazer login. Tente novamente.";
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!formData.email.trim() || !formData.senha.trim()) {
      setMessage({
        type: "error",
        text: "Preencha email e senha.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const body = {
        email: formData.email,
        senha: formData.senha,
      };

      const response = await api.post("/auth/login", body);
      const { access_token, refresh_token, token_type, user } = response.data;

      // Armazenar tokens no localStorage
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("token_type", token_type);
      localStorage.setItem(
        "user",
        typeof user === "string" ? user : JSON.stringify(user),
      );

      setMessage({
        type: "success",
        text: "Login realizado com sucesso.",
      });

      // Redirecionar para /oportunidades após 2 segundos
      setTimeout(() => {
        window.location.href = "/oportunidades";
      }, 2000);
    } catch (error) {
      console.error("Erro de login:", error?.response);
      const backendMessage = getLoginErrorMessage(error?.response?.data);

      setMessage({
        type: "error",
        text: backendMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="page">
        <div className="center">
          <div className="card">
            <h1>Entrar</h1>
            <h4>Faça seu login</h4>

            {message.text && (
              <p
                style={{
                  color: message.type === "success" ? "#1b5e20" : "#b71c1c",
                  marginBottom: "12px",
                  fontSize: "14px",
                }}
              >
                {message.text}
              </p>
            )}

            <form className="form" onSubmit={handleSubmit}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite seu email"
              />

              <label>Senha</label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Digite sua senha"
              />

              <button type="submit" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
