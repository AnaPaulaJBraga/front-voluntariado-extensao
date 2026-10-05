import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { branches } from "../../constants/branches";
import { modalities } from "../../constants/modalities";

const BRANCH_IMAGE_BY_KEY = {
    animals:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
    environment:
        "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80",
    education:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    health:
        "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
    social_assistance:
        "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=900&q=80",
    elderly:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
    children_and_teens:
        "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=900&q=80",
    inclusion:
        "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=900&q=80",
    culture_and_art:
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80",
    sports:
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
    technology:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    humanitarian_aid:
        "https://images.unsplash.com/photo-1469571486292-b53601020b73?auto=format&fit=crop&w=900&q=80",
    community:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    events:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
};

const Card = ({ id, title, desc, branch, modality, image }) => {
    const branchImage = image || BRANCH_IMAGE_BY_KEY[branch] || "";
    const branchLabel = branches.find((b) => b.value === branch)?.label ?? branch;
    const modalityLabel = modalities.find((m) => m.value === modality)?.label ?? modality;
    const isRemote = modality === "remote";

    const descRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
        const el = descRef.current;
        if (el) setIsTruncated(el.scrollHeight > el.clientHeight);
    }, [desc]);

    return (
        <Link
            className="card"
            to={`/vagas/${id}`}
            state={{ vacancy: { id, title, desc, branch, modality } }}
        >
            <div className="card__image-wrap" aria-hidden={!branchImage}>
                {branchImage ? (
                    <img className="card__image" src={branchImage} alt={`Imagem da área ${branchLabel}`} />
                ) : (
                    <span className="card__image-fallback">{String(branchLabel || "V").charAt(0).toUpperCase()}</span>
                )}
            </div>

            <h1>#{id}: {title}</h1>
            <p className="card__desc" ref={descRef}>{desc}</p>
            {isTruncated && <span className="card__read-more">ler mais</span>}

            <div className="card__meta">
                <span className="card__branch">{branchLabel}</span>
                <span className={`card__modality ${isRemote ? "card__modality--remote" : "card__modality--onsite"}`}>
                    {modalityLabel}
                </span>
            </div>
        </Link>
    );
};

export default memo(Card);
