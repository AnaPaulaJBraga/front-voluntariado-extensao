const Register = () => {
  return (
    <div>
      <h1>Cadastro</h1>

      <form>
        <input type="text" placeholder="Nome" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Senha" />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default Register;
