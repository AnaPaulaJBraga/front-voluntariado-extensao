import Header from "../../components/Header/Header";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useEntity } from "../../contexts/EntityContexts";
import MemberCard from "../../components/MemberCard/MemberCard";

const Members = () => {

    const [members, setMembers] = useState([]);
    const {membership}  = useEntity();

    const getMembers = async () => {
        try {
            const response = await api.get(`/entities/${membership.entity.id}/members`, true);
            if (!response) return false;
            setMembers(response.data);
        } catch (error) {
            console.error(`Erro ao realizar a consulta: ${error}`);
        }
        
        
    }

    useEffect(() => {
        getMembers();
    }, []);


    return (
        <>
            <Header />
            {members && members.map(member => (
                <MemberCard />
            ))}
        </>
    )
}

export default Members