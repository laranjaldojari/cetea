# Arquitetura

## Visão geral
Aplicação full-stack em Next.js (App Router). A UI (Server e Client Components)
e a API REST coexistem no mesmo deploy, simplificando a operação em um único VPS.
O acesso a dados é centralizado em `src/lib/db.ts` (Prisma) e em `src/server/*`
(agregações de domínio reutilizáveis por páginas e APIs).

## Camadas
- **Apresentação** — `src/app/**` (páginas) e `src/components/**` (UI).
- **Domínio/serviços** — `src/server/**` (ex.: cálculo de indicadores).
- **Acesso a dados** — Prisma (`src/lib/db.ts`) + schema único como fonte da verdade.
- **Segurança transversal** — `src/middleware.ts`, `src/lib/auth/**`, `src/lib/rbac.ts`.

## Multi-tenant
Hierarquia: **Instituição → Unidades → (Usuários, Profissionais, Pacientes)**.
Usuários não-administradores são filtrados pela própria unidade nas consultas,
viabilizando multimunicípio/multiunidade sobre uma base compartilhada.

## Autenticação e sessão
Login valida credenciais (bcrypt), emite um JWT (HS256, via `jose`) com `sub`,
`role`, `instituicaoId` e `unidadeId`, gravado em cookie httpOnly. O middleware
verifica o token em cada requisição (Edge-friendly, sem acesso a banco no caminho quente).

## White-label
As cores de marca são CSS custom properties (`--brand*`) consumidas pelo Tailwind.
A `Instituicao` guarda nome, logo e cores; basta injetá-las no `<html>` em runtime
para que login, menu, botões e cabeçalhos de relatório reflitam a identidade visual.

## Protocolos de avaliação (design extensível)
`Protocolo.definicao` (JSON) guarda itens e regras de pontuação; `ProtocoloAplicacao`
guarda respostas e resultado calculado. Assim, M-CHAT-R, CARS, SNAP-IV, ATA e novas
escalas são adicionadas **sem alterar o schema** — apenas dados de configuração.
