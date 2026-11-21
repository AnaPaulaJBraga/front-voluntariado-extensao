import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import Header from "../../components/Header/Header";
import { entitySectors } from "../../constants/entitySectors";
import { estados } from "../../constants/estados";
import { STATIC_ORGANIZATIONS, REFERENCES } from "../../data/organizations";
import "./Organizations.css";

const emptyFilters = { name: "", city: "", uf: "", sector: "" };

function OrganizationCard({ organization, external = false }) {
  const categories = external ? organization.categories : [organization.sector];
  return <article className="organization-card">
    <div className="organization-card__avatar" aria-hidden="true">{organization.name.charAt(0)}</div>
    <div className="organization-card__content">
      <h3 className="organization-card__title">{organization.name}</h3>
      <div className="organization-card__categories">{categories.filter(Boolean).map(category => <span key={category}>{category}</span>)}</div>
      <p>{organization.description}</p>
      <div className="organization-card__meta"><span>{organization.city}, {organization.uf}</span></div>
      {!external ? <Link className="organization-card__button" to={`/entidade/sobre/${encodeURIComponent(organization.slug)}`}>Visualizar informações</Link> : organization.website ?
        <a href={organization.website} target="_blank" rel="noopener noreferrer" className="organization-card__button">Visitar site <span aria-hidden="true">↗</span><span className="visually-hidden"> (abre em uma nova aba)</span></a> :
        <span className="organization-card__button organization-card__button--disabled">Site indisponível</span>}
    </div>
  </article>;
}

export default function Organizations() {
  const [filters, setFilters] = useState(emptyFilters);
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reload, setReload] = useState(0);
  const [availableSectors, setAvailableSectors] = useState(entitySectors);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value.trim()) params.set(key, value.trim());
      }
      const query = params.toString();
      try {
        const response = await api.get(`/entities${query ? `?${query}` : ""}`);
        if (!active) return;
        setEntities(response.data);
        setAvailableSectors(current => [...new Set([...current, ...response.data.map(item => item.sector)])].sort((a, b) => a.localeCompare(b, "pt-BR")));
        setErrorMessage("");
      } catch {
        if (active) setErrorMessage("Não foi possível carregar as entidades cadastradas. Tente novamente.");
      } finally {
        if (active) setIsLoading(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [filters, reload]);

  const changeFilter = (field, value) => {
    setFilters(current => ({ ...current, [field]: value }));
    setIsLoading(true); setErrorMessage("");
  };
  const clearFilters = () => { setFilters(emptyFilters); setIsLoading(true); setErrorMessage(""); setReload(n => n + 1); };
  const hasFilters = Object.values(filters).some(value => value.trim());

  return <div className="organizations-page">
    <Header />
    <main className="organizations-page__layout">
      <section className="organizations-page__hero" aria-labelledby="organizations-title">
        <div><h1 id="organizations-title">Organizações</h1><p>Encontre entidades cadastradas na plataforma e conheça suas iniciativas. A consulta é aberta a todos.</p></div>
        <div className="organizations-page__summary" aria-label="Resumo da consulta"><strong>{isLoading || errorMessage ? "—" : entities.length}</strong><span>entidades encontradas</span></div>
      </section>

      <section aria-labelledby="registered-organizations-title">
        <header className="organizations-page__section-heading"><h2 id="registered-organizations-title">Entidades cadastradas</h2><p>Veja os detalhes e, ao entrar na sua conta, solicite participação.</p></header>
        <form className="organizations-page__filters organizations-page__public-filters" role="search" aria-label="Buscar entidades cadastradas" onSubmit={event => event.preventDefault()}>
          <label htmlFor="organization-name">Nome<input id="organization-name" type="search" value={filters.name} onChange={event => changeFilter("name", event.target.value)} placeholder="Nome da entidade" /></label>
          <label htmlFor="organization-city">Cidade<input id="organization-city" type="search" value={filters.city} onChange={event => changeFilter("city", event.target.value)} placeholder="Nome completo da cidade" /></label>
          <label htmlFor="organization-uf">Estado<select id="organization-uf" value={filters.uf} onChange={event => changeFilter("uf", event.target.value)}><option value="">Todos os estados</option>{estados.map(state => <option key={state.value} value={state.value}>{state.label}</option>)}</select></label>
          <label htmlFor="organization-sector">Área de atuação<select id="organization-sector" value={filters.sector} onChange={event => changeFilter("sector", event.target.value)}><option value="">Todas as áreas</option>{availableSectors.map(sector => <option key={sector} value={sector}>{sector}</option>)}</select></label>
          <div className="organizations-page__filter-footer"><p>Os filtros se aplicam apenas às entidades cadastradas.</p><button className="organizations-page__clear" type="button" onClick={clearFilters}>Limpar filtros</button></div>
        </form>
        <div aria-busy={isLoading}>
          {isLoading ? <div className="organizations-page__empty" role="status"><p>Carregando entidades cadastradas...</p></div> : errorMessage ?
            <div className="organizations-page__empty" role="alert"><p>{errorMessage}</p><button type="button" className="organizations-page__clear" onClick={() => { setIsLoading(true); setErrorMessage(""); setReload(n => n + 1); }}>Tentar novamente</button></div> : entities.length ?
              <div className="organizations-page__grid" aria-label="Entidades cadastradas encontradas">{entities.map(entity => <OrganizationCard key={entity.id} organization={entity} />)}</div> :
              <div className="organizations-page__empty" role="status"><p>{hasFilters ? "Nenhuma entidade encontrada com esses filtros. Experimente outra busca ou limpe os filtros." : "Nenhuma entidade cadastrada por enquanto."}</p></div>}
        </div>
      </section>

      <section className="organizations-page__discover" aria-labelledby="discover-organizations-title">
        <header className="organizations-page__section-heading"><span className="organizations-page__eyebrow">Além da plataforma</span><h2 id="discover-organizations-title">Descubra mais entidades</h2><p>Conheça também estas organizações do Vale do Ribeira. Esta seleção é informativa; elas não fazem parte da listagem de entidades cadastradas no sistema.</p></header>
        <div className="organizations-page__grid">{STATIC_ORGANIZATIONS.map(organization => <OrganizationCard key={organization.id} organization={organization} external />)}</div>
        <details className="organizations-page__references"><summary>Referências das organizações externas</summary><ol className="organizations-page__references-list">{REFERENCES.map(reference => <li key={reference.id}>{reference.text}{" "}{reference.url && <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.url}</a>}{" "}{reference.url ? "Acesso em:" : ""} {reference.access}.</li>)}</ol></details>
      </section>
    </main>
  </div>;
}
