import Header from "../../components/Header/Header";
import "./EntityDashboard.css";

const EntityDashboard = ({ membership }) => {
  return (
    <>
      <Header />
      <main className="entity-dashboard-page">
        <section className="entity-dashboard-page__layout">
          <header className="entity-dashboard-page__hero">
            <h1>{membership?.entity?.name || "Minha entidade"}</h1>
            <p>Painel de controle da entidade</p>
          </header>
          <section className="entity-dashboard-page__content">
            <h2>Visão geral</h2>
            <p className="entity-dashboard-page__status">
              Em breve, você poderá acompanhar as informações da sua entidade por aqui.
            </p>
          </section>
        </section>
      </main>
    </>
  );
};

export default EntityDashboard;
