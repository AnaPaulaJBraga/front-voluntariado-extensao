const Login = () => {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>

      <div style={{border: "1px solid #ccc", padding: "20px", borderRadius: "8px", width: "300px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)"}}>

      <h1 style={{ textAlign: "center"}}>Login</h1>
            <form style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

              <label htmlFor="email">Email</label>
              <input type="email" placeholder="Digite seu email"/>

              <label htmlFor="senha">Senha</label>
              <input type="password" placeholder="Digite sua senha"/>

              <button type="submit">Entrar</button>
            </form>
      </div>
    </div>
  );
};

export default Login;
