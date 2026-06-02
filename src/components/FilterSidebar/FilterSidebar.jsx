import "./FilterSidebar.css";

const CAUSE_OPTIONS = [
  "Educação",
  "Meio Ambiente",
  "Saúde",
  "Assistência Social",
];

const ACTIVITY_OPTIONS = ["Presencial", "Remoto", "Híbrido"];

const FilterSidebar = ({
  selectedCauses,
  selectedActivity,
  city,
  onToggleCause,
  onActivityChange,
  onCityChange,
  onClear,
}) => {
  return (
    <aside className="filter-sidebar" aria-label="Filtros de oportunidades">
      <div className="filter-sidebar__head">
        <h2>Filtros</h2>
        <button
          className="filter-sidebar__clear"
          type="button"
          onClick={onClear}
        >
          Limpar filtros
        </button>
      </div>

      <div className="filter-sidebar__section">
        <h3>Causas</h3>
        {CAUSE_OPTIONS.map((cause) => (
          <label key={cause} className="filter-sidebar__check">
            <input
              type="checkbox"
              checked={selectedCauses.includes(cause)}
              onChange={() => onToggleCause(cause)}
            />
            <span>{cause}</span>
          </label>
        ))}
      </div>

      <div className="filter-sidebar__section">
        <h3>Localização</h3>
        <input
          className="filter-sidebar__input"
          type="text"
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          placeholder="Digite sua cidade"
        />
      </div>

      <div className="filter-sidebar__section">
        <h3>Tipo de atividade</h3>
        {ACTIVITY_OPTIONS.map((option) => (
          <label key={option} className="filter-sidebar__radio">
            <input
              type="radio"
              name="activity"
              checked={selectedActivity === option}
              onChange={() => onActivityChange(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </aside>
  );
};

export default FilterSidebar;
