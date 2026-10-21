import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useEntity } from "../../contexts/EntityContexts";

import Header from "../../components/Header/Header";

import MemberCard from "../../components/MemberCard/MemberCard";
import EntityInviteModal from "../../components/EntityInviteModal/EntityInviteModal";

import "./Members.css";

const Members = () => {

    const [members, setMembers] = useState([]);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [result, setResult] = useState({});
    
    const {membership, isLoading}  = useEntity();
    const entityId = membership?.entity?.id;


    useEffect(() => {
        if (isLoading || entityId == null) return;

        let isActive = true;

    const getMembers = async () => {
        try {
            const response = await api.get(`/entities/${membership.entity.id}/members`, true);
            
            if (isActive) {
                setMembers(response.data);
            }
            setMembers(response.data);
        } catch (error) {
            console.error(`Erro ao realizar a consulta: ${error}`);
        }
    }

        getMembers();

        return (() => {
            isActive = false;
        });

    }, [entityId, isLoading]);

    const inviteMember = async (email) => {
        try {
            const body = {
                "recipient_email": email,
                "invitation_type": "entity",
                "target_id": entityId
            }

            const response = await api.post("/invitations", body, false, true);

            if(response.status === 202) {
                setResult({ok: true, result: response.data.message});
            }

            setIsInviteOpen(false);
        } catch (error) {
            setResult({ok: false, result: error.response.data.detail});
            console.error(error.response.data);
            setIsInviteOpen(false);
        }

    }


    return (
        <>
            <Header />
            <main className="members-page">
                <section className="members-page__panel">
                    <header className="members-page__heading">
                        <div className="members-page__heading-content">
                            <span className="members-page__eyebrow">Organização</span>
                            <h1 className="members-page__title">Participantes da entidade</h1>
                            <p className="members-page__subtitle">
                                Consulte os usuários que fazem parte da sua organização.
                            </p>
                        </div>
                        <button
                            className="members-page__invite-button"
                            type="button"
                            onClick={() => setIsInviteOpen(true)}
                        >
                            + Convidar para entidade
                        </button>
                    </header>
                     {result && (
                            <p
                                style={result?.ok
                                    ? {color: "green", marginTop: 10}
                                    : {color: "red", marginTop: 10}
                                }
                            >{result.result}</p>
                        )}

                    {isInviteOpen && (
                        <EntityInviteModal
                            onClose={() => setIsInviteOpen(false)}
                            onSubmit={inviteMember}
                        />
                    )}

                    {members.length > 0 ? (
                        <div className="members-page__list">
                            {members.map(member => (
                                <MemberCard
                                    key={member.user.id}
                                    user={member.user}
                                    position={member.position}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="members-page__empty">
                            Nenhum participante encontrado.
                        </p>
                    )}
                </section>
            </main>
        </>
    )
}

export default Members
