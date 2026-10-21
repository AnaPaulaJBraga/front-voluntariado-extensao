import "./Confirmation.css";

const modes = {
  warning: { icon: "!", title: "Atenção!" },
  info: { icon: "i", title: "Confirme para continuar" },
  confirm: { icon: "✓", title: "Confirmar?" },
};

const Confirmation = ({ text, onResponse, mode = "warning" }) => {
  const selectedMode = Object.hasOwn(modes, mode) ? mode : "warning";
  const { icon, title } = modes[selectedMode];

  return (
    <div className="confirmation-overlay">
      <section
        className={`confirmation-card confirmation-card--${selectedMode}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
      >
        <div className="confirmation-card__icon" aria-hidden="true">
          {icon}
        </div>

        <h2 id="confirmation-title" className="confirmation-card__title">
          {title}
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
