import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useEntity } from "../../contexts/EntityContexts";
import ManagementLayout from "../../components/ManagementLayout/ManagementLayout";
import Confirmation from "../../components/Confirmation/Confirmation";
import Loader from "../../components/Loader/Loader";
import MemberCard from "../../components/MemberCard/MemberCard";
import EntityInviteModal from "../../components/EntityInviteModal/EntityInviteModal";
import { getErrorMessage, roleLabels } from "../../utils/management";
import { saveActiveContext } from "../../utils/activeContext";
import "./Members.css";

export default function Members() {
  const { membership, isLoading, error: membershipError, refreshMembership } = useEntity();
  const entityId = membership?.entity?.id;
  const isAdmin = membership?.position === "admin";
  const navigate = useNavigate();
  const [members, setMembers] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [decision, setDecision] = useState(null);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const load = useCallback(async () => {
    const [listing, user] = await Promise.all([api.get("/entities/" + entityId + "/members", true), api.get("/user/me", true)]);
    return { members: listing.data, userId: user.data.id };
  }, [entityId]);
  useEffect(() => {
    if (!entityId) return;
    let active = true;
    load().then(data => { if (active) { setMembers(data.members); setUserId(data.userId); setLoadError(""); } })
      .catch(error => { if (active) setLoadError(getErrorMessage(error)); });
    return () => { active = false; };
  }, [entityId, load]);
  const ask = value => { setDecision(value); setActionError(""); setFeedback(null); };
  const respond = async confirmed => {
    if (inFlight.current) return;
    if (!confirmed) { setDecision(null); return; }
    inFlight.current = true;
    setBusy(true);
    setActionError("");
    try {
      if (decision.kind === "leave") {
        await api.delete("/entities/" + entityId + "/leave", null, true);
        saveActiveContext("user");
        await refreshMembership();
        navigate("/inicio", { replace: true });
        return;
      }
      if (decision.kind === "role") {
        await api.patch("/entities/" + entityId + "/members/" + decision.user.id + "/position", { position: decision.position }, true);
      } else {
        await api.delete("/entities/" + entityId + "/members/" + decision.user.id, null, true);
      }
      setDecision(null);
      setFeedback({ ok: true, text: decision.kind === "role" ? "Cargo atualizado com sucesso." : "Membro removido da entidade." });
      const data = await load();
      setMembers(data.members);
      await refreshMembership();
    } catch (error) { setActionError(getErrorMessage(error)); }
    finally { inFlight.current = false; setBusy(false); }
  };
  const inviteMember = async email => {
    if (inFlight.current || !isAdmin) return;
    inFlight.current = true;
    setBusy(true);
    try {
      const response = await api.post("/invitations", { recipient_email: email, invitation_type: "entity", target_id: entityId }, false, true);
      setFeedback({ ok: true, text: response.data.message });
      setIsInviteOpen(false);
    } catch (error) { setFeedback({ ok: false, text: getErrorMessage(error) }); }
    finally { inFlight.current = false; setBusy(false); }
  };
  return <ManagementLayout title="Membros da entidade" subtitle={membership?.entity?.name ?? "Gerencie sua participação e a equipe da organização."}>
    {decision && <Confirmation mode="confirm" text={decision.text} onResponse={respond} isLoading={busy} error={actionError} />}
    {isLoading ? <Loader /> : membershipError ? <p role="alert" className="management-feedback management-feedback--error">{getErrorMessage(membershipError)}</p> : !membership ? <p className="management-feedback">Você não participa de uma entidade.</p> : <>
      <div className="management-actions">
        {isAdmin && <><button className="management-button" disabled={busy} onClick={() => { setFeedback(null); setIsInviteOpen(true); }}>+ Convidar para entidade</button><Link className="management-button management-button--secondary" to="/entidade/editar">Editar entidade</Link></>}
        <button className="management-button management-button--danger" disabled={busy} onClick={() => ask({ kind: "leave", text: "Quer sair da entidade " + membership.entity.name + "?" })}>Sair da entidade</button>
      </div>
      {feedback && <p role={feedback.ok ? "status" : "alert"} className={"management-feedback management-feedback--" + (feedback.ok ? "success" : "error")}>{feedback.text}</p>}
      {isInviteOpen && <EntityInviteModal isLoading={busy} error={feedback?.ok === false ? feedback.text : null} onClose={() => { if (!busy) setIsInviteOpen(false); }} onSubmit={inviteMember} />}
      {loadError ? <p role="alert" className="management-feedback management-feedback--error">{loadError}</p> : members === null ? <Loader /> : <div className="members-page__list">{members.map(member => <MemberCard key={member.user.id} {...member} isSelf={userId === member.user.id} canManage={isAdmin} busy={busy}
        onChangeRole={position => ask({ kind: "role", user: member.user, position, text: "Quer mudar o cargo de " + member.user.name + " para " + roleLabels[position] + "?" })}
        onRemove={() => ask({ kind: "remove", user: member.user, text: "Quer remover " + member.user.name + " da entidade?" })} />)}</div>}
    </>}
  </ManagementLayout>;
}
