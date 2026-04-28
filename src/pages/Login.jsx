import Header from "../components/Header";
const Login = () => {
  return (
    <>
      <Header />
      <div style={{ background: "#ffffff", minHeight: "100vh" }}>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>

          <div style={{border: "1px solid #ccc", padding: "20px", borderRadius: "8px", width: "300px", height: "300px", boxShadow: "0 8px 10px rgba(0,0,0,0.1)", background: "white"}}>

          <h1 style={{ textAlign: "center"}}>Entrar</h1>
          <h4 style={{ textAlign: "center", fontWeight: "normal", marginTop: "-10px"}}>Faça seu login</h4>
                <form style={{ display: "flex", padding: "3px", flexDirection: "column", gap: "8px" }}>

                  <label htmlFor="email">Email</label>
                  <input type="email" placeholder="Digite seu email"/>

                  <label htmlFor="senha">Senha</label>
                  <input type="password" placeholder="Digite sua senha"/>

                  <button style={{ marginTop: "10px", backgroundColor: "#3700ff", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer"}} type="submit">Entrar</button>
                </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
