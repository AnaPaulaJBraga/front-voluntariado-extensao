import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { getActiveContext, saveActiveContext, clearActiveContext } from "../../utils/activeContext";
import Opportunities from "../Opportunities/Opportunities";
import EntityDashboard from "./EntityDashboard";
import "../../App.css";

const Home = () => {
  const [entityMembership, setEntityMembership] = useState(null);
  const [activeMode, setActiveMode] = useState("user");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [exibirSplash, setExibirSplash] = useState(true);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setExibirSplash(false);
      // muda o estado para false depois de 3000milisegundos
    }, 1500);

    return () => clearTimeout(temporizador);
    // caso a pessoa saia da pagina antes dos 3 segundos, o temporizador resetara a 0
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      clearActiveContext();
      return;
    }

    let isCurrentPage = true;
    api.get("/entities/me", true)
      .then((response) => {
        if (!isCurrentPage) return;
        const membership = response.data;
        const savedContext = getActiveContext();
        setEntityMembership(membership);

        if (!membership) {
          saveActiveContext("user");
          return;
        }

        if (savedContext?.mode === "user") {
          setActiveMode("user");
          return;
        }

        // A pessoa só pode participar de uma entidade.
        saveActiveContext("entity", membership.entity.id);
        setActiveMode("entity");
      })
      .catch((error) => {
        if (!isCurrentPage) return;
        if (error?.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          clearActiveContext();
          window.location.href = "/login";
          return;
        }
        setErrorMessage("Não foi possível carregar sua entidade. Tente novamente.");
      })
      .finally(() => {
        if (isCurrentPage) setIsLoading(false);
      });

    return () => { isCurrentPage = false; };
  }, []);

  if (isLoading && localStorage.getItem("access_token")) return <p>Carregando...</p>;
  if (errorMessage) return <p role="alert">{errorMessage}</p>;
  if (activeMode === "entity" && entityMembership) {
    // caso o usuario for de uma entidade e tiver vinculo, mostra o painel da entidade 
    return(
      <>
      {/* tela que somente aparece caso a exibicao da animacao seja TRUE */}
        {exibirSplash && (
          <div className="animacao-transicao">
            <h1 className="texto-animado">Início</h1>
          </div>
        )}
        {/* tela inicial para entidades */}
      <EntityDashboard membership={entityMembership} />;
      </>
    );
  }

  // agora para pessoas normais usuarios comuns
  return(
  <>
  {/* somente exibira caso funcao seja TRUE */}
    {exibirSplash && (
      <div className="animacao-transicao">
        <h1 className="texto-animado">Início</h1>
      </div>
    )}
    {/* somente depois da animacao que aparecem as oportunidades */}
    <Opportunities />
  </>
  );
}

export default Home;
