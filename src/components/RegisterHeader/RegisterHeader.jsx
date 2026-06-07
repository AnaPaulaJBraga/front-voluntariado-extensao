import Header from "../HomeHeader/Header";

// IA: Componente dedicado apenas ao cabeçalho da tela de cadastro.
// Metodologia: separar header e conteúdo evita que um arquivo chamado RegisterHeader controle a página inteira.
// Função: reutilizar a navegação principal sem misturar layout e formulário.
const RegisterHeader = () => {
  return <Header />;
};

export default RegisterHeader;
