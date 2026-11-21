import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import { api } from "../../services/api";
import { clearActiveContext } from "../../utils/activeContext";
import { useFlashMessage } from "../../components/FlashMessage/FlashMessage";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const inFlight = useRef(false);
  const showFlashMessage = useFlashMessage();
  const navigate = useNavigate();

  const location = useLocation();

  const redirectTo = location.state?.redirectTo || "/inicio"

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => navigate(redirectTo, { replace: true }), 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, redirectTo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;
    setMessage({ type: "", text: "" });

    if (!formData.email.trim() || !formData.senha.trim()) {
      setMessage({
        type: "error",
        text: "Preencha email e senha.",
      });
      return;
    }

    setIsLoading(true);
    inFlight.current = true;

    try {
      const body = {
        username: formData.email,
        password: formData.senha,
      };

      const response = await api.post("/auth/login", body, true);
      const { access_token, token_type, user } = response.data;

      clearActiveContext();
      // Armazenar tokens no localStorage
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("token_type", token_type);
      localStorage.setItem(
        "user",
        typeof user === "string" ? user : JSON.stringify(user),
      );

      setIsAuthenticated(true);
      showFlashMessage("Login realizado com sucesso.");
    } catch (error) {
      console.error("Erro de login:", error?.response);
      const backendMessage = getLoginErrorMessage(error?.response?.data);

      setMessage({
        type: "error",
        text: backendMessage,
      });
      inFlight.current = false;
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
            <h3>Faça seu login</h3>

            {message.text && (
              <p
                style={{
                  color: "#b71c1c",
                  marginBottom: "12px",
                  fontSize: "14px",
                  alignSelf: "center"
                }}
              >
                {message.text}
                {message.type === "error" &&
                message.text === "Confirme seu e-mail para fazer login" && (
                  <>
                    <br/>
                    <Link style={{color: "#b71c1c"}} to="/reenviar-confirmacao">Clique aqui para reenviar a confirmação de e-mail</Link>
                  </>
                )}
              </p>
            )}

            <form className="form-container" onSubmit={handleSubmit}>
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

              <button className="button-entrar-login" type="submit" disabled={isLoading}>
                {isAuthenticated ? "Redirecionando..." : isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
