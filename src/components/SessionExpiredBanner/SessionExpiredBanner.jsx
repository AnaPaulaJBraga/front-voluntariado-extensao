import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./SessionExpiredBanner.css";

const SessionExpiredBanner = () => {
  const [isExpired, setIsExpired] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleSessionExpired = () => {
      setIsExpired(true);
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/login") {
      setIsExpired(false);
    }
  }, [location.pathname]);

  if (!isExpired) return null;

  return (
    <aside
      className="session-expired-card"
      role="alert"
      aria-live="assertive"
      aria-labelledby="session-expired-title"
    >
      {/* Mesmo padrão de ícone circular com "!" do Confirmation.jsx */}
      <div className="session-expired-card__icon" aria-hidden="true">
        !
      </div>

      <div className="session-expired-card__content">
        <h2 id="session-expired-title" className="session-expired-card__title">
          Sessão expirada
        </h2>
        <p className="session-expired-card__text">
          Token expirado. Faça{" "}
          <Link
            to="/login"
            state={{ redirectTo: location.pathname }}
            className="session-expired-card__link"
            onClick={() => setIsExpired(false)}
          >
            login novamente
          </Link>
          .
        </p>
      </div>
    </aside>
  );
};

export default SessionExpiredBanner;
