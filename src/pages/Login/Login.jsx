import { useState } from "react";
import Header from "../../components/HomeHeader/Header";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
  const newErrors = {};

  if (!formData.email.trim()) {
    newErrors.email = "Digite seu email";
  } else if (!formData.email.includes("@")) {
    newErrors.email = "Email inválido";
  }

  if (!formData.password.trim()) {
    newErrors.password = "Digite sua senha";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  alert("Login enviado com sucesso!");

  console.log("Email:", formData.email);
  console.log("Senha:", formData.password);
};

  return (
    <>
      <Header />

      <div className="page">
        <div className="center">
          <div className="card">
            <h1>Entrar</h1>
            <h2>Faça seu login</h2>

            <form className="form" onSubmit={handleSubmit}>
              <div className="space">
                <label>Email</label>
                <input
                  className={`input ${errors.email ? "input-error" : ""}`}
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
                {errors.email && (
                  <span className="error">{errors.email}</span>
                )}
              </div>

              <div className="space">
                <label>Senha</label>
                <input
                  className={`input ${errors.password ? "input-error" : ""}`}
                  type="password"
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                />
                {errors.password && (
                  <span className="error">{errors.password}</span>
                )}
              </div>

              <button
                type="submit"
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#4f46e5")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#6366f1")
                }
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;