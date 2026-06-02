import Header from "../../components/HomeHeader/Header";
import "./Login.css";

const Login = () => {
  return (
    <>
      <Header />

      <div className="page">
        <div className="center">
          <div className="card">
            <h1>Entrar</h1>
            <h4>Faça seu login</h4>

            <form className="form">
              <label>Email</label>
              <input type="email" placeholder="Digite seu email" />

              <label>Senha</label>
              <input type="password" placeholder="Digite sua senha" />

              <button type="submit">Entrar</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;