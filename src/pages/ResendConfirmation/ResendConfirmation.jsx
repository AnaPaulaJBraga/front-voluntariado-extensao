import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import { api } from "../../services/api";
import "./ResendConfirmation.css";


const ResendConfirmation =  () => {
  const [status, setStatus] = useState(0);
  const [data, setData] = useState("");
  const [email, setEmail] = useState("");

  const resendConfirmation = async (e) => {
    e.preventDefault();
    const path = "/auth/resend-confirmation";
    const body = {email: email};
    try {
      const response = await api.post(path, body, false);
      setStatus(response?.status);
      setData(response?.data?.message);
      console.log(response.data);
    } catch (error) {
      console.log(error.response?.data?.detail)
      setStatus(error?.response?.status);
      setData(error.response?.data?.detail);
    }
  }
// 
  return (
    <>
      <Header />

      <div className="page">
        <div className="center">
          <div className="card">
            <h3>Reenviar confirmação de e-mail</h3>
            {data && (
               <p
                 style={{color: status === 200 ? "#1b5e20" : "#b71c1c"}}
               >{data}</p>
             )}
            <form className="form">
              <input type="text" placeholder="Digite o e-mail cadastrado" onChange={(event) => setEmail(event.target.value)} />
              <button type="submit" onClick={resendConfirmation}>Enviar</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResendConfirmation;
