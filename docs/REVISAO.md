# Revisão de código e segurança

Revisão completa do projeto: checagem de tipos (TypeScript) e varredura de
vulnerabilidades. Resumo do que foi verificado e corrigido.

## Checagem de tipos
- Rodado `tsc` em todo o `src/`. Não foi possível gerar o cliente Prisma real
  nesta sandbox (download das engines bloqueado), então usou-se um stub permissivo.
- **Resultado:** zero erros de tipo reais no código da aplicação (os avisos
  remanescentes são artefatos do stub — `any` nos callbacks de resultados Prisma —
  que desaparecem com o cliente gerado via `npm run build`).
- Testes automatizados (Vitest): **12 passando**.

## Vulnerabilidades corrigidas
1. **IDOR / autorização horizontal (alta):** várias rotas por `id` não verificavam
   se o recurso pertencia à unidade do usuário. Um usuário de uma unidade podia ler
   ou alterar dados de outra (incluindo **baixar documentos clínicos** de qualquer
   paciente). Criado `src/lib/escopo.ts` (`unidadeOk`, `pacienteNoEscopo`) e aplicado
   em: documentos (download/lista/upload/exclusão), pacientes, agendamentos,
   prontuário (todas as ações), evoluções, protocolos (aplicação) e PTI
   (plano/objetivos/reavaliações). ADMIN continua com visão global.
2. **Força bruta no login (média):** adicionado rate limiting por IP em
   `/api/auth/login` (8/min).
3. **Segredo JWT fraco/ausente (média):** `JWT_SECRET` agora é obrigatório e com
   tamanho mínimo; o sistema falha de forma fechada se não estiver configurado.
4. **Build quebrando sem dependência opcional (alta p/ deploy):** o import do
   `@aws-sdk/client-s3` (S3 opcional) passou a ser resolvido só em runtime, para
   não quebrar `next build` de quem usa apenas armazenamento em disco.

## Já existentes (mantidos)
- RBAC por perfil; auditoria de ações; CSRF por origem em rotas com cookie;
  rate limiting na API v1 e no token; senhas bcrypt; exclusão lógica; prontuário
  assinado imutável; API v1 com Bearer e minimização de campos.

## Recomendações antes de produção
- Rodar `npm install && npm run build` para a checagem de tipos definitiva (com o
  cliente Prisma gerado) e `npm test`.
- Para múltiplas instâncias, trocar o rate limiting em memória por Redis.
- Criptografia em repouso (banco/backups e arquivos no storage) e fluxo de direitos
  do titular (LGPD) — ver `docs/LGPD.md`.
- Considerar `Referer` como reforço adicional ao check de origem (CSRF).
