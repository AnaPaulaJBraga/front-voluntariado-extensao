import "./OpportunityCard.css";

const OpportunityCard = ({ opportunity }) => {
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  return (
    <div className="opportunity-card">
      <img
        className="opportunity-card__image"
        src={opportunity.image}
        alt={opportunity.title}
        loading="lazy"
      />

      <div className="opportunity-card__content">
        <div className="opportunity-card__tags">
          <span className="opportunity-card__tag opportunity-card__tag--cause">
            {opportunity.cause}
          </span>
          <span className="opportunity-card__tag opportunity-card__tag--mode">
            {opportunity.mode}
          </span>
        </div>

        <h3>{opportunity.title}</h3>
        <p className="opportunity-card__location">{opportunity.location}</p>

        {isLoggedIn ? (
          <button
            className="btn btn-primary w-100"
            type="button"
            onClick={() => console.log("CLICOU > quero ser voluntário")}
          >
            Quero ser voluntário
          </button>
        ) : (
          <button
            className="btn btn-primary w-100"
            type="button"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Faça login para ser voluntário
          </button>
        )}
      </div>
    </div>
  );
};

export default OpportunityCard;
