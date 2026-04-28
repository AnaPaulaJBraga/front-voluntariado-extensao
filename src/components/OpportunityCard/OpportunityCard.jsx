import "./OpportunityCard.css";

const OpportunityCard = ({ opportunity }) => {
  return (
    <article className="opportunity-card">
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

        <button className="opportunity-card__button" type="button">
          Quero ser voluntario
        </button>
      </div>
    </article>
  );
};

export default OpportunityCard;