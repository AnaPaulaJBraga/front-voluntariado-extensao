import "./Confirmation.css";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import Loader from "../Loader/Loader";
import ButtonReaction from "./ButtonReaction";

const modes = {
  warning: { icon: "!", title: "Atenção!" },
  info: { icon: "i", title: "Confirme para continuar" },
  confirm: { icon: "✓", title: "Confirmar?" },
};

const Confirmation = ({ text, onResponse, mode = "warning", isLoading = false, error }) => {
  const selectedMode = Object.hasOwn(modes, mode) ? mode : "warning";
  const { icon, title } = modes[selectedMode];
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  return createPortal(
    <div className="confirmation-overlay">
      <section
        aria-busy={isLoading}
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
        {error && <p role="alert" className="confirmation-card__text">{error}</p>}

        <div className="confirmation-card__actions">
          <button
            type="button"
            disabled={isLoading}
            className="confirmation-card__button confirmation-card__button--confirm"
            onClick={() => onResponse(true)}
          >
            {isLoading ? <Loader label="Aguarde..." /> : <>
              <span className="confirmation-card__button-label">Confirmar</span>
              <ButtonReaction />
            </>}
          </button>

          <button
            type="button"
            disabled={isLoading}
            className="confirmation-card__button confirmation-card__button--cancel"
            onClick={() => onResponse(false)}
          >
            <span className="confirmation-card__button-label">Cancelar</span>
            <ButtonReaction down />
          </button>
        </div>
      </section>
    </div>, document.body
  );
};

export default Confirmation;
