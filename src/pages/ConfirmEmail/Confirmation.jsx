import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import { api } from "../../services/api";
import "./Confirmation.css";


const Confirmation =  () => {
  const [status, setStatus] = useState(0)

  const confirmAccount = async (e) => {
    e.preventDefault()
    const tokenUrl = new URLSearchParams(window.location.search).get("token")
    const path = '/auth/confirm-email/' 
    
    try {
      const response = await api.get(path + tokenUrl)
      setStatus(response.status)
    } catch(error) {
      console.log(error.response?.status)
      console.log(error.response?.data)
      setStatus(error.response?.status)
    }
  }

  return (
    <>
      <Header />

      <div className="page">
        <div className="center">
          <div className="card">
            <h1>Confirmar conta</h1>
            <p
            style={{
              display: status ? "flex" : "none",
              color: status === 200 ? "#1b5e20" : "#b71c1c",
              alignSelf: "center",
              margin: "auto"
            }}>{status === 200 ? "Sua conta foi confirmada com sucesso!\nClique no botão para ir à tela de login" : "Ocorreu um erro ao confirmar a conta"}</p>
            <form className="form">
              {
                status === 200 
                  ? <Link className="button" to="/login">Retornar para página de login</Link>
                  : <button type="submit" onClick={confirmAccount}>Clique aqui para confirmar sua conta</button>  
              }
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Confirmation;
