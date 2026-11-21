import Header from "../Header/Header";
import { Link } from "react-router-dom";
import "./ManagementLayout.css";

export default function ManagementLayout({ title, subtitle, children, className = "", backTo }) {
  return <><Header /><main className={"management-page " + className}><section className="management-panel">
    {backTo && <Link className="management-back" to={backTo}>← Voltar</Link>}
    <header className="management-heading"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</header>{children}
  </section></main></>;
}
