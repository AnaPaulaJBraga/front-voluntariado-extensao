import { roleLabels } from "../../utils/management";
import "./MemberCard.css";

export default function MemberCard({ user, position, canManage, isSelf, busy, onChangeRole, onRemove }) {
  return <article className="member-card" aria-busy={busy}>
    <div className="member-card__avatar" aria-hidden="true">{user.name?.charAt(0).toUpperCase()}</div>
    <div className="member-card__content">
      <h2 className="member-card__name">{user.name}{isSelf ? " (você)" : ""}</h2>
      {canManage ? <label className="member-card__position">Cargo de {user.name}
        <select aria-label={"Cargo de " + user.name} value={position} disabled={busy} onChange={e => onChangeRole(e.target.value)}>
          {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label.charAt(0).toUpperCase() + label.slice(1)}</option>)}
        </select>
      </label> : <p className="member-card__position">Cargo: <span>{roleLabels[position] ?? position}</span></p>}
    </div>
    {canManage && !isSelf && <button type="button" className="member-card__remove" disabled={busy} onClick={onRemove} aria-label={"Remover " + user.name}>Remover</button>}
  </article>;
}
