import Header from "../../components/Header/Header";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../services/api";


const Informations = () => {
    const { slug } = useParams();

    const [entity, setEntity] = useState();

    useEffect(() => {
        api.get(`/entities?slug=${slug}`, true)
        .then(response => {
            const [data] = response.data;
            setEntity(data);
        })
        .catch(error => {
            console.error(error);
        })
    }, [])

    return (
        <>
            <Header />
            {entity && (
                <section>
                    <h1>{entity.name}</h1>
                    <p>{entity.sector}</p>
                    <p>{entity.description}</p>
                    <p>{entity.created_at}</p>
                    <p>{entity.city}, {entity.uf}</p>
                </section>
            )}
        </>
    )
}

export default Informations