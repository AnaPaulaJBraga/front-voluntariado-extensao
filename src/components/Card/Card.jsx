

const Card = ({id, title, desc, branch, modality}) => {
    return (
        <div className="card" key={id}>
            <h1>#{id}: {title}</h1>
            <p>{desc}</p>
            <div style={{display: "flex", gap: "1rem"}}>
                <p style={{color: "#bdbdbd"}}>{branch}</p>
                <p
                style={modality == "remote"
                    ? {backgroundColor: "blue", padding: 10, borderRadius: 10}
                    : {backgroundColor: "green", padding: 10, borderRadius: 10}
                }
                >{modality}</p>
            </div>
        </div>
    )
}

export default Card