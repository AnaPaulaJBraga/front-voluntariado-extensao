import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Loader from "../Loader/Loader";
import "./EntityInviteModal.css";

const EntityInviteModal = ({ onClose, onSubmit, title = "Convidar para entidade", description = "Informe o e-mail da pessoa que você deseja convidar.", isLoading = false, error }) => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inFlight = useRef(false);
    const busy = isSubmitting || isLoading;
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = previousOverflow; };
    }, []);

    const sendInvitation = async (e) => {
        e.preventDefault();

        const normalizedEmail = email.trim();
        if (!normalizedEmail || !onSubmit || inFlight.current || isLoading) return;

        inFlight.current = true;
        setIsSubmitting(true);
        try {
            await onSubmit(normalizedEmail);
        } finally {
            inFlight.current = false;
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="entity-invite-modal__overlay">
            <section
                className="entity-invite-modal__card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="entity-invite-modal-title"
                aria-describedby="entity-invite-modal-description"
                aria-busy={busy}
            >
                <div className="entity-invite-modal__icon" aria-hidden="true">
                    +
                </div>

                <h2 id="entity-invite-modal-title" className="entity-invite-modal__title">
                    {title}
                </h2>

                <p id="entity-invite-modal-description" className="entity-invite-modal__description">
                    {description}
                </p>
                {error && <p className="entity-invite-modal__error" role="alert">{error}</p>}

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
                        disabled={busy}
                    />

                    <div className="entity-invite-modal__actions">
                        <button
                            className="entity-invite-modal__button entity-invite-modal__button--submit"
                            type="submit"
                            disabled={busy}
                        >
                            {busy ? <Loader label="Enviando..." /> : "Enviar convite"}
                        </button>

                        <button
                            className="entity-invite-modal__button entity-invite-modal__button--cancel"
                            type="button"
                            onClick={onClose}
                            disabled={busy}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </section>
        </div>, document.body
    );
};

export default EntityInviteModal;
