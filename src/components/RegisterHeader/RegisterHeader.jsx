import Header from "../Header/Header";

// IA: Componente dedicado apenas ao cabeçalho da tela de cadastro.
// Metodologia: separar header e conteúdo evita que RegisterHeader controle layout e formulário.
// Função: reutilizar a navegação principal sem misturar responsabilidades.
const RegisterHeader = () => {
  return <Header />;
};

export default RegisterHeader;
