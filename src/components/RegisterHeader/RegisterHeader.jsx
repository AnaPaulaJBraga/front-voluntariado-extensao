import Header from "../Header";
import "./RegisterHeader.css";
import CidadeEstado from "../CityState/CidadeEstado";

const Register = () => {
    return (
        <div>
        <h1>Cadastro</h1>
    <>
        <Header />
        <div style={{ background: "#ffffff", minHeight: "100vh" }}>
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
            >
            <div
            style={{
                border: "1px solid #ccc",
                padding: "20px",
                borderRadius: "4px",
                width: "350px",
                height: "740px",
                boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
                background: "white",
                marginLeft: "750px",
            }}
            >
            <h1 style={{ textAlign: "center", fontSize: 22, fontWeight: "bolder" }}>Criar conta</h1>
            <h4
                style={{
                    textAlign: "center",
                    fontWeight: "normal",
                    marginTop: "10px",
                    fontSize: 13
                }}
            >
                Preencha os dados para se cadastrar
            </h4>
            <form>
            <div className="form-container">
                <label htmlFor="nome">Nome completo</label>
                <input type="text" placeholder="Digite seu nome completo" />

                <label htmlFor="email">Email</label>
                <input type="email" placeholder="Digite seu email" />

                <label htmlFor="nascimento">Data de nascimento</label>
                <input type="date" placeholder="" />

                <label htmlFor="senha">Senha</label>
                <input type="password" placeholder="Digite sua senha" />

                <label htmlFor="senha-confirmacao">Confirmar senha</label>
                <input type="password" placeholder="Confirme sua senha" />
            </div>
            <CidadeEstado />

                <button
                className="button-criar"
                type="submit"
                >
                Criar conta
                </button>

                <h4 className="ja-possui-conta">
                    Já possui uma conta?
                </h4>

                <button className="button-entrar">
                    <h4 className="button-entrar">
                        Entrar
                    </h4>
                </button>
                
            </form>
            </div>
        </div>
        </div>
    </>
    </div>
    );
};

export default Register;