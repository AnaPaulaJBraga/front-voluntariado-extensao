import { useState } from "react";
import RegisterHeader from "../components/RegisterHeader/RegisterHeader";
import {
  isValidEmail,
  isValidPassword,
  isValidFullName,
  isValidDate,
  maskDate,
  maskName,
  maskEmail,
  maskCPF,
  isValidCPF,
} from "../utils/validations";

const Register = () => {
  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let maskedValue = value;

    // Aplicar máscaras específicas
    if (name === "fullName") maskedValue = maskName(value);
    if (name === "email") maskedValue = maskEmail(value);
    if (name === "birthDate") maskedValue = maskDate(value);
    if (name === "cpf") maskedValue = maskCPF(value);

    setFormData((prev) => ({
      ...prev,
      [name]: maskedValue,
    }));

    // Limpar erro do campo quando usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isValidFullName(formData.fullName)) {
      newErrors.fullName = "Digite um nome completo válido";
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!isValidDate(formData.birthDate)) {
      newErrors.birthDate = "Data inválida (use DD/MM/YYYY)";
    }

    if (!isValidPassword(formData.password)) {
      newErrors.password = "Senha deve ter pelo menos 8 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não conferem";
    }

    if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Cidade é obrigatória";
    }

    if (!formData.state.trim()) {
      newErrors.state = "Estado é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Formulário válido:", formData);
      // Aqui você pode enviar os dados para o servidor
    }
  };

  return (
    <div //container principal com dois lados
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <div //lado esquerdo com ilustração
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
        <h2 style={{
          fontSize: "32px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "16px",
          color: "#000",
        }}>
          Junte-se à nossa comunidade
        </h2>
        <p style={{
          fontSize: "16px",
          color: "#666",
          textAlign: "center",
          lineHeight: "1.6",
          maxWidth: "350px",
        }}>
          Conecte-se com organizações e faça diferença na sua comunidade através do voluntariado.
        </p>
      </div>

      <div //lado direito com card
        style={{
          flex: "0 0 40%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#fff",
        }}
      >

    <div //este é um card
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

      <div //ambos ficarem organizados no meio
      style={{
        textAlign: "center",
      }}>
      <h1>Criar conta</h1>
      <h2
      style={{
        opacity: "0.6",
        fontSize: "14px",
        fontWeight: "normal",
        color: "#666"
      }}>Preencha os dados para se cadastrar</h2>
      </div>

      <form style={{ display: "flex", flexDirection: "column", gap: "15px" }} onSubmit={handleSubmit}>

        <div //label encima e input embaixo
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "5px"
        }}>
        <label
        style={{
          fontSize: "14px",
          fontWeight: "500",
          marginBottom: "6px"
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
            border: errors.fullName ? "1px solid #ff6b6b" : "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
        {errors.fullName && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "4px" }}>{errors.fullName}</span>}
        </div>

        <div //label encima e input embaixo
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "5px"
        }}>
        <label
        style={{
          fontSize: "14px",
          fontWeight: "500",
          marginBottom: "6px"
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
            border: errors.email ? "1px solid #ff6b6b" : "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
        {errors.email && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "4px" }}>{errors.email}</span>}
        </div>

        <div //label encima e input embaixo
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "5px"
        }}>
        <label
        style={{
          fontSize: "14px",
          fontWeight: "500",
          marginBottom: "6px"
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
            border: errors.birthDate ? "1px solid #ff6b6b" : "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
        {errors.birthDate && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "4px" }}>{errors.birthDate}</span>}
        </div>

        <div //label encima e input embaixo
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "5px"
        }}>
        <label
        style={{
          fontSize: "14px",
          fontWeight: "500",
          marginBottom: "6px"
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
            border: errors.cpf ? "1px solid #ff6b6b" : "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
        {errors.cpf && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "4px" }}>{errors.cpf}</span>}
        </div>

        <div //label encima e input embaixo
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "5px"
        }}>
        <label
        style={{
          fontSize: "14px",
          fontWeight: "500",
          marginBottom: "6px"
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
            border: errors.password ? "1px solid #ff6b6b" : "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
        {errors.password && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "4px" }}>{errors.password}</span>}
        </div>

        <span //linha que separa senha de confirmar senha
        style={{
          width: "100%",
          height: "1px",
          backgroundColor: "#000",
          opacity: ".15",
          display: "block",
          margin: "10px 0"
        }}></span>

        <div //label encima e input embaixo
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "5px"
        }}>
        <label
        style={{
          fontSize: "14px",
          fontWeight: "500",
          marginBottom: "6px"
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
            border: errors.confirmPassword ? "1px solid #ff6b6b" : "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
        {errors.confirmPassword && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "4px" }}>{errors.confirmPassword}</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div //label encima e input embaixo
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "5px"
          }}>
          <label
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "6px"
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
              padding: "10px",
              border: errors.city ? "1px solid #ff6b6b" : "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
          {errors.city && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "4px" }}>{errors.city}</span>}
          </div>

          <div //label encima e input embaixo
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "5px"
          }}>
          <label
          style={{
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "6px"
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
              padding: "10px",
              border: errors.state ? "1px solid #ff6b6b" : "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              textTransform: "uppercase",
            }}
          />
          {errors.state && <span style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "4px" }}>{errors.state}</span>}
          </div>
        </div>

        <button type="submit" //botao que preenche todo espaço horizontal
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
        onMouseEnter={(e) => e.target.style.backgroundColor = "#4f46e5"}
        onMouseLeave={(e) => e.target.style.backgroundColor = "#6366f1"}
        >Criar Conta</button>
      </form>
    </div>
      </div>
    </div>
  );
};

export default Register;
