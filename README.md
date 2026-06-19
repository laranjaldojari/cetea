# CETEA — Centro Especializado de Atendimento às Pessoas com TEA

Sistema web de gestão clínica e assistencial para serviços públicos de atenção ao
Transtorno do Espectro Autista. Multiunidade, multimunicípio e multiusuário, com
controle de acesso por perfil, auditoria e aderência à LGPD.

> **Status:** Fundação (Fase 1) entregue e executável. Os 15 módulos estão modelados
> no banco de dados; a interface e as APIs estão implementadas para o núcleo
> (autenticação, dashboard, pacientes) como padrão de referência para os demais.
> Veja [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

## Stack

| Camada        | Tecnologia                          | Motivo |
|---------------|-------------------------------------|--------|
| Frontend/UI   | Next.js 14 (App Router) + React 18  | SSR, rotas e UI no mesmo deploy |
| Estilo        | Tailwind CSS (tema via CSS vars)    | White-label e tema claro/escuro |
| Backend/API   | Next.js Route Handlers (REST + JWT) | API própria + base para e-SUS/CNES/mobile |
| ORM           | Prisma                              | Migrations versionadas e tipagem ponta a ponta |
| Banco         | PostgreSQL 16                       | Requisito do projeto, robusto p/ saúde |
| Auth          | JWT (jose) + bcrypt + cookie httpOnly | Sessão segura, RBAC por perfil |
| Validação     | Zod                                 | Validação de entrada em todas as rotas |
| Deploy        | Docker (standalone) → Dokploy/VPS Hostinger | Container enxuto, migrations no boot |

> A escolha por Next.js full-stack reduz a complexidade de operar em um único VPS.
> Se preferir um backend dedicado (ex.: NestJS) para a API de integração, a camada
> `src/server` e o schema Prisma são reaproveitáveis sem retrabalho.

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16 (local ou container)
- npm

## Executar localmente

```bash
cp .env.example .env          # ajuste DATABASE_URL e JWT_SECRET
npm install
npm run db:push               # cria as tabelas a partir do schema
npm run db:seed               # popula instituição, usuários e protocolos
npm run dev                   # http://localhost:3000
```

Ou tudo em containers:

```bash
docker compose up --build     # sobe Postgres + app
```

### Credenciais de demonstração (geradas pelo seed)

| Perfil        | E-mail                      | Senha       |
|---------------|-----------------------------|-------------|
| Administrador | admin@cetea.gov.br          | `cetea@123` |
| Coordenador   | coordenador@cetea.gov.br    | `cetea@123` |
| Recepção      | recepcao@cetea.gov.br       | `cetea@123` |
| Profissional  | profissional@cetea.gov.br   | `cetea@123` |
| Auditor       | auditor@cetea.gov.br        | `cetea@123` |

> Troque as senhas e o `JWT_SECRET` antes de qualquer uso real.

---

## Scripts SQL / Migrations

O banco é versionado por **migrations do Prisma** — o SQL é gerado e versionado
automaticamente em `prisma/migrations/`:

```bash
npm run db:migrate     # cria a migration SQL (dev) a partir do schema
npm run db:deploy      # aplica migrations em produção (roda no boot do container)
```

Para exportar o DDL completo em SQL puro (sem aplicar):

```bash
npx prisma migrate diff --from-empty \
  --to-schema-datamodel prisma/schema.prisma --script > scripts/schema.sql
```

---

## Deploy no Dokploy (VPS Hostinger)

1. **Repositório:** suba o projeto para o GitHub.
2. **Banco:** no Dokploy, crie um recurso **PostgreSQL** gerenciado e copie a connection string.
3. **Aplicação:** crie uma aplicação do tipo **Dockerfile**, apontando para este repositório.
4. **Variáveis de ambiente:** defina `DATABASE_URL`, `JWT_SECRET` (use `openssl rand -base64 48`), `APP_URL`.
5. **Build & Deploy:** o `Dockerfile` usa `output: standalone`; no boot ele roda
   `prisma migrate deploy` e sobe o servidor na porta `3000`.
6. **Domínio/HTTPS:** configure o domínio e o certificado pelo proxy do Dokploy (Traefik).

---

## Estrutura de pastas

```
cetea/
├─ prisma/
│  ├─ schema.prisma         # modelo completo dos 15 módulos
│  └─ seed.ts               # instituição, usuários, protocolos, exemplos
├─ scripts/                 # SQL exportado / utilitários
├─ docs/
│  ├─ ARCHITECTURE.md       # decisões e camadas
│  └─ ROADMAP.md            # fases de implementação
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/      # tela de login
│  │  ├─ (app)/             # shell autenticado (sidebar + topbar)
│  │  │  ├─ dashboard/      # indicadores em tempo real
│  │  │  ├─ pacientes/      # módulo de referência (CRUD)
│  │  │  └─ …               # demais módulos (roadmap)
│  │  └─ api/               # API REST (login, logout, pacientes…)
│  ├─ components/           # ui, layout, dashboard
│  ├─ lib/                  # db, auth (jwt/bcrypt/session), rbac, validators
│  ├─ server/               # agregações de domínio (ex.: indicadores)
│  └─ styles/globals.css    # tokens de tema (white-label + dark mode)
├─ Dockerfile
└─ docker-compose.yml
```

---

## Segurança (implementado nesta fase)

- Senhas com **bcrypt** (12 rounds).
- Sessão em **JWT** assinado, em cookie **httpOnly / SameSite=Lax / Secure** em produção.
- **Middleware** que protege todas as rotas e a API (401/redirect).
- **RBAC** por perfil (`src/lib/rbac.ts`), com `AUDITOR` somente leitura.
- **Auditoria** (`audit_logs`) registrando login/logout e operações de escrita.
- Validação de entrada com **Zod** em todas as rotas.
- Proteção contra **SQL injection** via Prisma (consultas parametrizadas).
- Mensagens de login genéricas (não revelam existência de e-mail).

CSRF, rate limiting, assinatura digital de documentos e demais itens estão no roadmap.


## Tarefas agendadas (cron) e armazenamento

- **Lembretes (WhatsApp/e-mail):** agende no Dokploy um cron chamando `POST /api/notificacoes/processar` com o header `x-cron-secret: $CRON_SECRET` (ex.: a cada 15 min). Sem credenciais, use `NOTIF_SIMULAR=true` para validar o fluxo.
- **Documentos:** por padrão são gravados em `STORAGE_DIR` (disco). No Dokploy, monte um **volume persistente** apontando para esse diretório. Para usar S3/MinIO, defina as variáveis `S3_*` e instale `@aws-sdk/client-s3`.


## API REST pública (v1)

Para integrações (e-SUS, CNES, sistemas municipais, app mobile):

1. Obtenha um token: `POST /api/v1/token` com `{ "email": "...", "senha": "..." }` → retorna `access_token` (JWT, 1h).
2. Use o token nos endpoints: cabeçalho `Authorization: Bearer <token>`.
   - `GET /api/v1/pacientes?pagina=1&tamanho=50`
   - `GET /api/v1/pacientes/{id}`
   - `GET /api/v1/agendamentos?inicio=...&fim=...`
3. Documentação navegável: **`/api-docs`** (Swagger UI) · especificação: `/api/v1/openapi`.

As rotas v1 têm rate limiting por IP e retornam apenas os campos necessários (minimização LGPD).

## Testes

```bash
npm install
npm test   # Vitest — motor de protocolos, CSV, RBAC, datas, rate limit
```

## Segurança e LGPD

Proteção CSRF por origem (rotas com cookie de sessão), rate limiting, RBAC, auditoria,
selo de integridade no prontuário e exclusão lógica. Revisão e pendências em `docs/LGPD.md`.
