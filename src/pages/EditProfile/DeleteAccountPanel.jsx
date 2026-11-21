import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Confirmation from "../../components/Confirmation/Confirmation";
import Loader from "../../components/Loader/Loader";
import { useEntity } from "../../contexts/EntityContexts";
import { api } from "../../services/api";
import { clearActiveContext } from "../../utils/activeContext";
import { getErrorMessage } from "../../utils/management";
import "../../components/ManagementLayout/ManagementLayout.css";

export default function DeleteAccountPanel() {
  const { membership, isLoading, error: membershipError, refreshMembership } = useEntity();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ask = event => {
    event.preventDefault();
    const length = [...password.trim()].length;
    if (length < 6 || length > 72) { setError("Informe sua senha atual, com 6 a 72 caracteres."); return; }
    setError("");
    setConfirm(true);
  };
  const remove = async confirmed => {
    if (busy) return;
    if (!confirmed) { setConfirm(false); return; }
    setBusy(true);
    setError("");
    try {
      await api.delete("/user/me", { password }, true, { keepSessionOnUnauthorized: true });
      for (const key of ["access_token", "token_type", "user"]) localStorage.removeItem(key);
      clearActiveContext();
      await refreshMembership();
      navigate("/login", { replace: true });
    } catch (failure) { setError(getErrorMessage(failure)); }
    finally { setBusy(false); }
  };
  if (isLoading) return <Loader />;
  if (membershipError) return <p role="alert" className="management-feedback management-feedback--error">Não foi possível verificar seu vínculo com uma entidade. Atualize a página e tente novamente.</p>;
  if (membership) return <div className="management-feedback">Para excluir sua conta, primeiro saia da entidade. Se você for o último administrador, promova outro membro antes de sair.<div className="management-actions"><Link to="/entidade/membros">Gerenciar minha participação</Link></div></div>;
  return <form onSubmit={ask} noValidate>
    <p className="management-feedback">A exclusão da conta é permanente. Confirme sua senha para continuar.</p>
    <label className="management-field">Senha atual<input type="password" autoComplete="current-password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} disabled={busy} minLength={6} maxLength={72} required /></label>
    {!confirm && error && <p role="alert" className="management-feedback management-feedback--error">{error}</p>}
    <button type="submit" className="button-criar" disabled={busy}>Excluir minha conta</button>
    {confirm && <Confirmation mode="warning" text="Quer excluir sua conta permanentemente? Esta ação não pode ser desfeita." onResponse={remove} isLoading={busy} error={error} />}
  </form>;
}
