import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../services/api";

const EntityContext = createContext(null);

export const EntityProvider = ({children}) => {
    const [membership, setMembership] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const requestId = useRef(0);
    const { pathname } = useLocation();

    const fetchMembership = useCallback(async () => {
        const id = ++requestId.current;
        const token = localStorage.getItem("access_token");
        if (!token) {
            setMembership(null);
            setError(null);
            setIsLoading(false);
            return null;
        }

        try {
            const response = await api.get("/entities/me", true);
            if (id !== requestId.current) return;
            setMembership(response.data);
            setError(null);
            return response.data;
        } catch (error) {
            if (id !== requestId.current) return;
            setMembership(null);
            setError(error);
        } finally {
            if (id === requestId.current) setIsLoading(false);
        }
    }, []);

        useEffect(() => {
            let active = true;
            Promise.resolve().then(() => { if (active) fetchMembership(); });
            return () => { active = false; requestId.current += 1; };
        }, [pathname, fetchMembership]);

        return (
            <EntityContext.Provider
                value={{
                    membership,
                    isLoading,
                    error,
                    refreshMembership: fetchMembership // Permite forçar o carregamento caso necessário
                }}>
                    {children}
            </EntityContext.Provider>
        );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useEntity = () => {
    const context = useContext(EntityContext);

    if (!context) {
        throw new Error("UseEntity deve ser utilizado dentro de um EntityProvider")
    }
    return context;
}
