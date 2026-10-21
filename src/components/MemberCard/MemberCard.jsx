import { useState } from "react";
import { api } from '../../services/api';
import { useEntity } from "../../contexts/EntityContexts";

import Confirmation from '../../components/Confirmation/Confirmation';

import trashIcon from "../../assets/icons/trash.png";

import "./MemberCard.css";

const MemberCard = ({ user, position }) => {

    const [userToRemove, setUserToRemove] = useState(null);
    const [result, setResult] = useState({});


    const { membership, isLoading } = useEntity();
    const idEntity = membership?.entity?.id;

    const onResponse = async (response) => {
        if (response) {
            try {
                const response = await api.delete(`/entities/${idEntity}/members/${user.id}`, null, true);
                setResult({ ok: true, result: `O usuário ${user.name} foi removido com sucesso!` });
            } catch (error) {
                console.error(error.response.data.detail);
                setResult({ ok: false, result: error.response.data.detail });
            }
        }
        setUserToRemove(null);
    }


    return (
        <>
            {userToRemove &&
                <Confirmation key={user.id}
                    text={"Deseja remover o usuário " + user.name + " da entidade?"}
                    onResponse={onResponse} />
            }

            {result?.ok
                ? <p className={`status statusSuccess`} role="alert">
                    {result.result}
                </p>
                : <p className={`status statusError`} role="alert">
                    {result.result}
                </p>
            }
            <article className="member-card">
                <div className="member-card__avatar" aria-hidden="true">
                    {user.name?.charAt(0).toUpperCase()}
                </div>

                <div className="member-card__content">
                    <h2 className="member-card__name">{user.name}</h2>
                    <p className="member-card__position">
                        Posição: <span>{position}</span>
                    </p>
                </div>

                <span
                    style={{ padding: 10, borderRadius: "100%", background: "#ff3c3c", cursor: "pointer" }}
                    onClick={() => { setUserToRemove(user) }}>
                    <img
                        className="member-card__remove-icon"
                        src={trashIcon}
                        alt="Remover membro"
                    />
                </span>
            </article>
        </>
    );
};

export default MemberCard;
