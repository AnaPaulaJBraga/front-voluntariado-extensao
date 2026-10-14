import { useEffect, useState } from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Confirmation from '../../components/Confirmation/Confirmation';
import { useEntity } from "../../contexts/EntityContexts";
import { api } from "../../services/api";
import { branches } from "../../constants/branches";
import { modalities } from "../../constants/modalities";
import styles from "./VacancyDetail.module.css";

const VacancyDetail = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const [ vacancy, setVacancy ] = useState();
  const [result, setResult] = useState({});
  const [participants, setParticipants] = useState(null);

  const [participantToRemove, setParticipantToRemove] = useState(null);
  const [vacancyToDelete, setVacancyToDelete] = useState(null);

  const {membership} = useEntity();

  const getVacancyDetails = async () => {
    const response = await api.get(`/vacancies?id=${id}`);
    const [data] = response.data;

    return data;
  }

  const formatDateTime = (value) => {
    if (!value) return "";

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    async function fetchData() {
      const data = await getVacancyDetails();
      setVacancy(data);
    }
    fetchData();
  }, []);

  const branchLabel = branches.find((b) => b.value === vacancy?.branch)?.label ?? vacancy?.branch;
  const modalityEntry = modalities.find((m) => m.value === vacancy?.modality);
  const modalityLabel = modalityEntry?.label ?? vacancy?.modality;
  const isRemote = vacancy?.modality === "remote";

  const handleSubmit = async () => {
    try {
      const response = await api.post(`/vacancies/${vacancy.id}/join-requests`, null, false, true);
      setResult({"ok": true, result: "Inscrição realizada com sucesso!"})
    } catch (error) {
      console.log("Erro: " + error);
      setResult({"ok": false, result: error.response?.data?.detail})
    }
  }

  const fetchParticipants = async () => {
    try {
      const response = await api.get(`/vacancies/${id}/participants`, true);
      setParticipants(response.data);
    } catch (error) {
      console.error("Erro na requisição: " + error);
    }
  }

  const handleParticipants = async () => {
    if (participants !== null) {
      setParticipants(null);
      return;
    }

    await fetchParticipants();
  }

  const onResponse = (confirm) => {
    if (!confirm) setParticipantToRemove(null); setVacancyToDelete(null);

    if(confirm && participantToRemove) deleteUser();
    if(confirm && vacancyToDelete) deleteVacancy();
  }

  const deleteUser = async () => {
    try {
      await api.delete(`/vacancies/${id}/participants/${participantToRemove.user.id}`, null, true);
      await fetchParticipants();
      setResult({ok: true, result: `${participantToRemove.user.name} foi expulso(a) com sucesso!`});
    } catch (error) {
      console.error(error);
      setResult({ok: false, result: `Houve um erro ao expulsar o(a) participante.`});
    }
    setParticipantToRemove(null);
  }

  const deleteVacancy = async () => {
    console.log(vacancy);
    try {
      const response = await api.delete(`/vacancies/${vacancy.id}`, null, true);
      if (response.status === 200) {
        navigation.navigate("/inicio", {replace: true});
      }
    } catch (error) {
      setResult({ok: false, result: `Houve um erro ao deletar a vaga.`});
    }
    
  }

  const handleUpdate = () => {
    // alterar vaga
  }

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.layout}>
          <Link className={styles.back} to="/inicio">← Voltar</Link>

          {!vacancy && (
            <p className={`${styles.status} ${styles.statusError}`} role="alert">
              Vaga não encontrada. Volte ao início e tente novamente.
            </p>
          )}
          {result?.ok
          ? <p className={`${styles.status} ${styles.statusSuccess}`} role="alert">
              {result.result}
            </p>
          : <p className={`${styles.status} ${styles.statusError}`} role="alert">
              {result.result}
            </p>
          }

          {/* Confirmação para expulsar usuário da vaga */}
          {participantToRemove &&
          <Confirmation
            text={"Você quer realmente remover o(a) voluntário(a) " + participantToRemove.user.name + "?"}
            onResponse={onResponse}
            />}

          {/* Confirmação para deletar a vaga */}
          {vacancyToDelete &&
          <Confirmation
            text={"Você quer realmente deletar a vaga " + vacancy.title + "?"}
            onResponse={onResponse}
            />}

          {vacancy && (
            <article className={styles.card}>
              <header className={styles.header}>
                <h1 className={styles.title}>{vacancy.title}</h1>
                <div className={styles.meta}>
                  <span className={styles.branch}>{branchLabel}</span>
                  <span className={`${styles.modality} ${isRemote ? styles.modalityRemote : styles.modalityOnsite}`}>
                    {modalityLabel}
                  </span>
                  <p>
                    <span>Data de início: {formatDateTime(vacancy.starts_at)}</span>
                  </p>
                  <p>
                    <span>Data de término: {formatDateTime(vacancy.ends_at)}</span>
                  </p>
                  {
                  vacancy.requires_approval
                    ? <p className={styles.modalityOnsite}>Exige aprovação de responsáveis</p>
                    : <p className={styles.modalityRemote}>Não exige aprovação de responsáveis</p>
                  }
                </div>
              </header>

              <section className={styles.body}>
                <h2 className={styles.sectionTitle}>Descrição</h2>
                <p className={styles.desc}>{vacancy.description}</p>
                <p>Postado em: {formatDateTime(vacancy.posted_at)}</p>
                {
                  membership?.entity?.id == vacancy?.entity?.id
                  ? (
                    <>
                      <button
                        style={{width: "auto", borderRadius: "10px", marginTop: 20, background: "#1F8D5B"}}
                        onClick={handleSubmit}>
                          Editar vaga
                      </button>
                      <button
                        style={{width: "auto", borderRadius: "10px", marginTop: 20, background: "#1F8D5B", marginLeft: 10}}
                        onClick={handleParticipants}>
                          {participants ? "Ocultar participantes" : "Ver participantes"}
                      </button>
                      <button
                        style={{width: "auto", borderRadius: "10px", marginTop: 20, background: "#b91b1b", marginLeft: 10}}
                        onClick={() => setVacancyToDelete(vacancy)}>
                          Excluir vaga
                      </button>
                    </>
                  ) : (
                    <button
                      style={{width: "auto", borderRadius: "10px", marginTop: 20, background: "#1F8D5B"}}
                      onClick={handleSubmit}>
                        Inscrever-se na vaga
                      </button>
                  )
                }
              </section>
            </article>
          )}

          {participants && (
            <article className={styles.card}>
              <header className={styles.header}>
                <h1 className={styles.title}>Participantes</h1>
                {participants.length == 0
                ? <div>
                    <hr  />
                    <section className={styles.body} style={{display: "flex", justifyContent: "space-between"}}>
                      <p>Não há participantes inscritos nesta vaga</p>
                    </section>
                  </div>
                
                : participants.map(participant => (
                  <div key={participant.user.id}>
                    <hr  />
                    <section className={styles.body} style={{display: "flex", justifyContent: "space-between"}}>
                      <div>
                        <h2 className={styles.sectionTitle}>{participant.user.name}</h2>
                        <p className={styles.desc}>Entrou em: {formatDateTime(participant.joined_at)} </p>
                      </div>
                      <button
                        className={styles.exclusionButton}
                        onClick={() => setParticipantToRemove(participant)}>
                        Remover voluntário
                      </button>
                    </section>
                  </div>
                ))
                }
              </header>
            </article>
          )}
        </div>
      </main>
    </>
  );
};

export default VacancyDetail;
