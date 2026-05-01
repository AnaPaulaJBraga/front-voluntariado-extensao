import Select from "react-select";
import { useState } from "react";

// Estados
const estados = [
  { value: "SP", label: "São Paulo" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PR", label: "Paraná" },
];

// Cidades por estado (você pode aumentar depois)
const cidadesPorEstado = {
  SP: ["São Paulo", "Registro", "Santos", "Campinas"],
  RJ: ["Rio de Janeiro", "Niterói"],
  MG: ["Belo Horizonte", "Uberlândia"],
  PR: ["Curitiba", "Londrina"],
};

export default function CidadeEstado() {
  const [cidades, setCidades] = useState([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState(null);

  // Quando escolhe estado
  const handleEstado = (estado) => {
    setEstadoSelecionado(estado);

    const lista = cidadesPorEstado[estado.value] || [];

    const formatado = lista.map((cidade) => ({
      value: cidade,
      label: cidade,
    }));

    setCidades(formatado);
  };

  return (
    <div className="form-container-UF">
      
      {/* ESTADO */}
      <div className="campo">
        <label>Estado</label>
        <Select
          options={estados}
          onChange={handleEstado}
          placeholder="Escolha o estado"
        />
      </div>

      {/* CIDADE */}
      <div className="campo">
        <label>Cidade</label>
        <Select
          options={cidades}
          placeholder={
            estadoSelecionado
              ? "Escolha a cidade"
              : ""
          }
          isDisabled={!estadoSelecionado}
        />
      </div>

    </div>
  );
}