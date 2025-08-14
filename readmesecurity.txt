# Guia de Autenticação e Segurança

Este projeto utiliza um servidor Node/Express como BFF (Backend for Frontend) para realizar a autenticação no Firebase e entregar os recursos do SPA com cookies HttpOnly.

## Visão geral
1. O cliente envia `email` e `password` para `POST /auth/login`.
2. O servidor usa a REST Identity Toolkit do Firebase para obter um `idToken`.
3. Com o Admin SDK, o servidor converte o `idToken` em **Session Cookie** e salva como cookie HttpOnly.
4. Todas as rotas protegidas verificam o cookie através do middleware `requireAuth`.
5. Os assets estáticos públicos são servidos em `/assets` e a SPA em `index.html`. Bundles privados podem ser servidos via `/priv-assets` somente após login.

## Variáveis de ambiente
Copie `.env.example` para `.env` e preencha:

- `PORT` (padrão 80)
- `NODE_ENV` (`production` para habilitar cookies `secure`)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_WEB_API_KEY`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY` (use `\n` para quebras de linha)
- `COOKIE_NAME` (nome do cookie de sessão)
- `COOKIE_SECRET` (chave para assinar o cookie)
- `SESSION_TTL_DAYS` (dias de validade do cookie)

## Configurando o Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative o provedor **Email/Password** em *Authentication > Sign-in method*.
3. Em *Configurações do projeto > Contas de serviço*, gere uma chave JSON e copie o `client_email` e `private_key` para o `.env`.
4. Em *Configurações do projeto > Geral*, copie a **Web API Key**.
5. Crie usuários de teste no Firebase Auth com email e senha.

## Estrutura do banco de dados
- `db.json` armazena dados da aplicação (tickets, projetos etc.).
- O objeto `users` guarda metadados como `role`. As senhas não são mais salvas aqui; o Firebase gerencia a autenticação.
- As rotas `/api/db` (GET/PATCH) permitem leitura e escrita do arquivo e requerem sessão válida.

## Endpoints principais
- `POST /auth/login` – realiza login e cria o cookie de sessão.
- `POST /auth/logout` – remove o cookie.
- `GET /me` – retorna o usuário autenticado.
- `GET /api/db` – lê o banco (requer auth).
- `PATCH /api/db` – persiste alterações no banco (requer auth).
- `GET /manifest-priv.json` e `/priv-assets/*` – exemplos de assets privados.

## Como executar
```bash
npm install
npm start
```
O servidor iniciará em `http://localhost:80`.

## Boas práticas implementadas
- Cookies HttpOnly assinados (`SameSite=Lax`).
- Rate limiting em `/auth/*`.
- Content Security Policy via Helmet.
- Assets privados acessíveis apenas após login.

