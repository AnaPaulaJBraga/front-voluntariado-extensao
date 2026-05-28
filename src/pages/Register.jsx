const Register = () => {
  return (
    <div //ficar tudo no meio
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >

    <div //este é um card
    style={{
      width: "400",
      padding: "40px",
      borderRadius: "12px",
      backgroundColor: "#ededc5",
      display: "flex",
      flexDirection: "column",
      gap: "20px", //espaçamento dos itens dentro do card
    }}
    >

      <div //ambos ficarem organizados no meio
      style={{
        textAlign: "center",
      }}>
      <h1>Criar conta</h1>
      <h2
      style={{
        opacity: "25",
        fontSize: "20px"
      }}>Preencha os dados para se cadastrar</h2>
      </div>

      <form style={{ display: "flex", gap: "2px", display: "flex", flexDirection: "column", gap: "15" }} 
      id="formulario"
      >

        <div //label encima e input embaixo
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "20px"
        }}>
        <label
        style={{
          fontSize: "15px"
        }}
        for="nome" id="nome"
        >
          Nome Completo
        </label>
        <input type="text" placeholder="Digite seu nome completo"/>
        </div>

        <div //label encima e input embaixo
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "20px"
        }}>
        <label
        style={{
          fontSize: "15px"
        }}
        for="email" id="email"
        >
          E-mail
        </label>
        <input type="email" placeholder="Digite o seu e-mail"/>
        </div>

        <div //label encima e input embaixo
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "10px"
        }}>
        <label
        style={{
          fontSize: "15px"
        }}
        for="senha" id="senha"
        >
          Senha
        </label>
        <input type="password" placeholder="Digite a sua senha"/>
        </div>

        <div //label encima e input embaixo
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "35px"
        }}>
        <label
        style={{
          fontSize: "15px"
        }}
        for="confirmaSenha" id="confirmaSenha"
        >
          Confirmar senha
        </label>
        <input type="password" placeholder="Confirme a sua senha"/>
        </div>

        <span //linha bem fraquinha
        style={{
          width: "100%",
          height: "2px",
          backgroundColor: "#000",
          opacity: ".25",
          display: "block",
          marginBottom: "20px"
        }}></span>

        <button type="submit" //botao que preenche todo espaço horizontal
        style={{
          width: "100%",
          padding: "14px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          color: "#000",
          backgroundColor: "#ADD8E6",
          fontSize: "16px"
        }}
        >Criar Conta</button>
      </form>
    </div>
    </div>
  );
};

<link rel="stylesheet" href="main.js" />

export default Register;
