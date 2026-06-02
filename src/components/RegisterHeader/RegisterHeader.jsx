import Header from "../Header/Header";
import "./RegisterHeader.css";
import CidadeEstado from "../CityState/CidadeEstado";
import img from "../../assets/comunity.jpg";

const Register = () => {
  return (
    <div>
      <Header />
      <div className="layout">
        {/* ESQUERDA */}
        <div className="lado-esquerdo">
          <img src={img} alt="Comunidade" />

          <h2>Junte-se à nossa comunidade</h2>
          <p>
            Conecte-se com organizações e faça a diferença na sua comunidade
            através do voluntariado.
          </p>
        </div>

        {/* DIREITA */}
        <div className="lado-direito">
          <div className="container-central">
            <div className="card">
              <div className="card-title">
                <h1>Criar conta</h1>
                <h3>Preencha os dados para se cadastrar</h3>
              </div>

              <form>
                <div className="form-container">
                  <label htmlFor="nome">Nome completo</label>
                  <input
                    id="nome"
                    type="text"
                    placeholder="Digite seu nome completo"
                  />

                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                  />

                  <label htmlFor="nascimento">Data de nascimento</label>
                  <input id="nascimento" type="date" placeholder="" />

                  <label htmlFor="senha">Senha</label>
                  <input
                    id="senha"
                    type="password"
                    placeholder="Digite sua senha"
                  />

                  <label htmlFor="senha-confirmacao">Confirmar senha</label>
                  <input
                    id="senha-confirmacao"
                    type="password"
                    placeholder="Confirme sua senha"
                  />
                </div>

                <CidadeEstado />

                <button type="submit" className="button-criar">
                  Criar conta
                </button>

                <h4 className="ja-possui-conta">Já possui uma conta?</h4>

                <a href="/login" className="button-entrar">
                  Entrar
                </a>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
