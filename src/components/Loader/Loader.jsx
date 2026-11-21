import "./Loader.css";

export default function Loader({ label = "Carregando..." }) {
  return <span className="action-loader" role="status"><span className="action-loader__spinner" aria-hidden="true" />{label}</span>;
}
