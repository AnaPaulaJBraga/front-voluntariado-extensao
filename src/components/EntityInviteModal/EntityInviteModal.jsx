import { useState } from "react";
import "./EntityInviteModal.css";

const EntityInviteModal = ({ onClose, onSubmit }) => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sendInvitation = async (e) => {
        e.preventDefault();

        const normalizedEmail = email.trim();
        if (!normalizedEmail || !onSubmit) return;

        setIsSubmitting(true);
        try {
            await onSubmit(normalizedEmail);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="entity-invite-modal__overlay">
            <section
                className="entity-invite-modal__card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="entity-invite-modal-title"
            >
                <div className="entity-invite-modal__icon" aria-hidden="true">
                    +
                </div>

                <h2 id="entity-invite-modal-title" className="entity-invite-modal__title">
                    Convidar para entidade
                </h2>

                <p className="entity-invite-modal__description">
                    Informe o e-mail da pessoa que você deseja convidar.
                </p>

                <form className="entity-invite-modal__form" onSubmit={sendInvitation}>
                    <label className="entity-invite-modal__label" htmlFor="invite-email">
                        E-mail
                    </label>
                    <input
                        className="entity-invite-modal__input"
                        id="invite-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemplo@email.com"
                        autoComplete="email"
                        autoFocus
                        required
                    />

                    <div className="entity-invite-modal__actions">
                        <button
                            className="entity-invite-modal__button entity-invite-modal__button--cancel"
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>

                        <button
                            className="entity-invite-modal__button entity-invite-modal__button--submit"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Enviando..." : "Enviar"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default EntityInviteModal;
