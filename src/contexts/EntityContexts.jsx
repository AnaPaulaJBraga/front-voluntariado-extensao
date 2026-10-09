import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const EntityContext = createContext(null);

export const EntityProvider = ({children}) => {
    const [membership, setMembership] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);

    const token = localStorage.getItem("access_token");

    const fetchMembership = async () => {
        if (!token) {
            setMembership(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.get("/entities/me", true);
            setMembership(response.data);
        } catch (error) {
            setMembership(null);
        } finally {
            setIsLoading(false);
        }
    }

        useEffect(() => {
            fetchMembership();
        }, [token]);

        return (
            <EntityContext.Provider
                value={{
                    membership,
                    isLoading,
                    refreshMembership: fetchMembership // Permite forçar o carregamento caso necessário
                }}>
                    {children}
            </EntityContext.Provider>
        );
}

export const useEntity = () => {
    const context = useContext(EntityContext);

    if (!context) {
        throw new Error("UseEntity deve ser utilizado dentro de um EntityProvider")
    }
    return context;
}