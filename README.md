# ratfy backend

![npm](https://img.shields.io/badge/11.12.1-npm-red?style=for-the-badge)
![node](https://img.shields.io/badge/24.15.0-node-green?style=for-the-badge)
![postgres](https://img.shields.io/badge/18-postgres-blue?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/8.3-MongoDB-brightgreen?style=for-the-badge)
![Redis](https://img.shields.io/badge/8.2-redis-red?style=for-the-badge)
![MinIO](https://img.shields.io/badge/-MinIO-red?style=for-the-badge)
![Prisma](https://img.shields.io/badge/-Prisma-131420?style=for-the-badge)

O projeto faz uso de uma arquitetura hexagonal, visando se afastar de um acoplamento com tecnologias e focar assim no desenvolvimento das regras de negócio.

## Pré-requisitos

- Mise: 2026.6.3;
- Docker: 29.5.1.

## Executando

Após fazer o clone do projeto execute:

```sh
mise trust && mise install
```

Configure as variáveis de ambiente:

```sh
cp .env.example .env
```

Suba os containers:

```sh
# Em caso de ambiente de desenvolvimento
docker compose -f docker-compose.dev.yml up -d
```

Instale as dependências necessárias:

```sh
npm install
```

Gere o client prisma:

```sh
npm run prisma:generate
```

Execute a aplicação:

```
npm run dev
```

## Regras de contribuição

O projeto está configurado com alguns coding standards quanto code formatting que estão ambos reforçados com o uso do [ESLint](https://eslint.org/) quanto do [Prettier](https://prettier.io/).

Para commits estamos utilizando a especificação de [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), o que estará sendo reforçado também com o uso da ferramenta [commitlint](https://commitlint.js.org/).
