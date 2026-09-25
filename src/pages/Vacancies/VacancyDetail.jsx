import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import { branches } from "../../constants/branches";
import { modalities } from "../../constants/modalities";
import styles from "./VacancyDetail.module.css";

const VacancyDetail = () => {
  const { state } = useLocation();
  const vacancy = state?.vacancy;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const branchLabel = branches.find((b) => b.value === vacancy?.branch)?.label ?? vacancy?.branch;
  const modalityEntry = modalities.find((m) => m.value === vacancy?.modality);
  const modalityLabel = modalityEntry?.label ?? vacancy?.modality;
  const isRemote = vacancy?.modality === "remote";

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

          {vacancy && (
            <article className={styles.card}>
              <header className={styles.header}>
                <h1 className={styles.title}>{vacancy.title}</h1>
                <div className={styles.meta}>
                  <span className={styles.branch}>{branchLabel}</span>
                  <span className={`${styles.modality} ${isRemote ? styles.modalityRemote : styles.modalityOnsite}`}>
                    {modalityLabel}
                  </span>
                </div>
              </header>

              <section className={styles.body}>
                <h2 className={styles.sectionTitle}>Descrição</h2>
                <p className={styles.desc}>{vacancy.desc}</p>
              </section>
            </article>
          )}
        </div>
      </main>
    </>
  );
};

export default VacancyDetail;
