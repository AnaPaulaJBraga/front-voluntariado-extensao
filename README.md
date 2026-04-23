# 🚀 Projeto Frontend - Voluntariado

Este é um projeto frontend desenvolvido com **React**

---

# 🧰 Pré-requisitos

Antes de começar, você precisa ter instalado na sua máquina:

- Node.js (recomendado versão 20 ou superior)
- npm (gerenciador de pacotes)

Para verificar se já tem:

```bash
node -v
npm -v

```

---

# Como baixar e rodar o projeto

1. Clonar o repositório
2. Acessar a pasta do projeto
3. Instalar dependencias

```bash
npm install
```

4. Rodar o projeto

```bash
npm run dev
```

Após rodar o comando acima, o terminal exibirá algo como:

```bash
http://localhost:5173/
```

Abra esse link no navegador.

---

# Trabalhando com Branch (trabalho em paralelo)

Branches permitem que você desenvolva novas funcionalidades sem mexer diretamente na main, evitando quebrar o projeto principal.
Passo a passo:

1. Garantir que está na main

```bash
  git checkout main
```

2. Atualizar a main (boa prática)

```bash
  git pull origin main
```

3. Criar uma nova branch

```bash
 git checkout -b nome-da-sua-branch
```

4. Trabalhar normalmente

   Agora você pode:

   - editar código
   - criar arquivos
   - testar funcionalidades
6. Salvar alterações

```bash
   git add .
```

```bash
    git commit -m "feat: cria tela de login"
```

6. Enviar a branch para o GitHub

```bash
     git push origin nome-da-sua-branch
```

---

Depois
Quando terminar:
- Criar um Pull Request (PR) no GitHub
- Revisar código
- Fazer merge na main
