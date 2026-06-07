import Select from "react-select";

// IA: Lista de estados exibida no primeiro select.
// Metodologia: react-select espera opções no formato { value, label }.
// Função: value guarda o código usado na lógica e label guarda o texto visto pelo usuário.
const estados = [
  { value: "SP", label: "São Paulo" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PR", label: "Paraná" },
];

// IA: Relação simples de cidades por UF.
// Metodologia: objeto indexado pelo value do estado para buscar a lista rapidamente.
// Função: alimentar o select de cidades de acordo com o estado escolhido.
const cidadesPorEstado = {
  SP: ["São Paulo", "Registro", "Santos", "Campinas"],
  RJ: ["Rio de Janeiro", "Niterói"],
  MG: ["Belo Horizonte", "Uberlândia"],
  PR: ["Curitiba", "Londrina"],
};

// IA: Transforma strings de cidades no formato aceito pelo react-select.
// Metodologia: manter a formatação em helper evita repetir map dentro do JSX.
// Função: devolver opções com value e label para o select de cidades.
const formatarCidades = (estado) => {
  const lista = cidadesPorEstado[estado?.value] || [];

  return lista.map((cidade) => ({
    value: cidade,
    label: cidade,
  }));
};

// IA: Componente responsável pelos campos Estado e Cidade.
// Metodologia: recebe valores e callbacks do Register para o formulário validar tudo em um único lugar.
// Função: habilitar o select de cidade somente depois que um estado for escolhido.
export default function CidadeEstado({
  estadoSelecionado,
  cidadeSelecionada,
  onEstadoChange,
  onCidadeChange,
  errors = {},
}) {
  const cidades = formatarCidades(estadoSelecionado);

  // IA: Função chamada quando o usuário seleciona um estado.
  // Metodologia: avisa o formulário principal e limpa a cidade quando o estado muda.
  // Função: evitar que uma cidade antiga fique selecionada em outro estado.
  const handleEstado = (estado) => {
    onEstadoChange(estado);
    onCidadeChange(null);
  };

  return (
    <div className="form-container-UF">
      
      {/* IA: Select de estado.
          Função: define qual lista de cidades será carregada. */}
      <div className="campo">
        <label htmlFor="estado">Estado</label>
        <Select
          inputId="estado"
          classNamePrefix="register-select"
          value={estadoSelecionado}
          options={estados}
          onChange={handleEstado}
          placeholder="Escolha o estado"
        />
        {errors.state && <span className="register-error">{errors.state}</span>}
      </div>

      {/* IA: Select de cidade.
          Função: fica desabilitado até haver estado selecionado para evitar escolhas inconsistentes. */}
      <div className="campo">
        <label htmlFor="cidade">Cidade</label>
        <Select
          inputId="cidade"
          classNamePrefix="register-select"
          value={cidadeSelecionada}
          options={cidades}
          onChange={onCidadeChange}
          placeholder={
            estadoSelecionado
              ? "Escolha a cidade"
              : ""
          }
          isDisabled={!estadoSelecionado}
        />
        {errors.city && <span className="register-error">{errors.city}</span>}
      </div>

    </div>
  );
}
