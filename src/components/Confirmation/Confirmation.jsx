import "./Confirmation.css";

const Confirmation = ({text, onResponse}) => {
  return (
    <div className="confirmation-overlay">
      <section
        className="confirmation-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
      >
        <div className="confirmation-card__icon" aria-hidden="true">
          !
        </div>

        <h2 id="confirmation-title" className="confirmation-card__title">
          Deseja confirmar?
        </h2>

        <p id="confirmation-description" className="confirmation-card__text">
          {text}
        </p>

        <div className="confirmation-card__actions">
          <button
            type="button"
            className="confirmation-card__button confirmation-card__button--cancel"
            onClick={() => onResponse(false)}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="confirmation-card__button confirmation-card__button--confirm"
            onClick={() => onResponse(true)}
          >
            Confirmar
          </button>
        </div>
      </section>
    </div>
  );
};

export default Confirmation;
