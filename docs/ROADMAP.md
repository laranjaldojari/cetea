# Roadmap de implementação

Um sistema deste porte (15 módulos, integrações, BI, assinatura digital) é
entregue em fases. O banco de dados já contempla **todos** os módulos; abaixo,
o que está pronto e a ordem sugerida de evolução.

## ✅ Fase 1 — Fundação (entregue)
- Modelo de dados completo (PostgreSQL/Prisma) dos 15 módulos.
- Autenticação JWT + bcrypt, sessão em cookie httpOnly, middleware de proteção.
- RBAC com 5 perfis (Admin, Coordenador, Recepção, Profissional, Auditor).
- Auditoria base (login/logout/escrita).
- Shell da aplicação: sidebar recolhível, busca global (UI), tema claro/escuro, white-label.
- Dashboard com indicadores reais (agregação no servidor).
- Módulo **Pacientes** como padrão de referência (listagem + API de criação).
- Docker + docker-compose + instruções de deploy no Dokploy.
- Seed com instituição, usuários, especialidades, unidade e protocolos TEA.

## ✅ Fase 2 — Cadastros e agenda (concluída)
- ✅ **Agenda inteligente:** visões mês/semana/dia, arrastar-e-soltar p/ reagendar, detecção de conflitos, fila de espera, fluxo de status (agendado→confirmado→realizado/falta/cancelado) e geração automática de lembretes (7d/1d/2h).
- ✅ **Pacientes:** cadastro completo (dados pessoais, endereço, responsáveis, dados clínicos, comorbidades), ficha do paciente com histórico de atendimentos, edição e inativação lógica. *(upload de foto/arquivo fica para a fase de Documentos.)*
- ✅ **Profissionais e Especialidades:** CRUD de profissionais com vínculo de especialidade/unidade e **agenda semanal** (janelas de disponibilidade por dia); cadastro de especialidades; inativação lógica.
- ✅ **Unidades:** CRUD com identificação (CNES, endereço, coordenador, horário) e recursos (salas terapêuticas, consultórios, espaço sensorial, sala de integração); inativação com proteção contra exclusão de unidade com vínculos.

## ✅ Fase 3 — Clínica (concluída)
- Prontuário eletrônico: anamnese, evoluções, pareceres, versionamento, assinatura digital.
- ✅ **Protocolos:** motor genérico dirigido por dados (M-CHAT-R, CARS, SNAP-IV, ATA e novos instrumentos sem mexer no código); aplicação online com pontuação ao vivo, correção/classificação automáticas (4 métodos, validados em testes), histórico por paciente, edição, exclusão e relatório para impressão/PDF. *(Texto oficial dos itens é carregado pela instituição sob licença; PDF gerado via impressão do navegador — versão server-side com pdf-lib fica como melhoria.)*
- ✅ **PTI:** planos por paciente com status (em elaboração/ativo/concluído/suspenso), objetivos com meta, estratégias, responsável e prazo, percentual de execução por objetivo (slider) e execução geral calculada, reavaliações com histórico.
- Evolução terapêutica por sessão com anexos.

## ✅ Fase 4 — Gestão e integrações (concluída)
- ✅ **Relatórios + BI:** KPIs e gráficos de pacientes (situação/faixa/município), atendimentos (profissional/especialidade/situação/unidade) e indicadores TEA, com filtro por período, exportação CSV (abre no Excel) e relatório em PDF (impressão).
- ✅ **Indicadores para prestação de contas:** nível de suporte, comorbidades, tempo médio de tratamento, frequência média por paciente ativo e atendimentos realizados no período.
- ✅ **Comunicação:** processador da fila de lembretes (7d/1d/2h) com provedores de WhatsApp e e-mail (SMTP), painel com estatísticas e status de configuração, modo simulação e rota protegida para cron. *(Requer credenciais reais do provedor de WhatsApp e SMTP; envio não testável aqui.)*
- ✅ **Documentos:** upload por paciente com armazenamento em disco (padrão) ou S3/MinIO (opcional), versionamento automático por nome, download autenticado e exclusão lógica. *(Assinatura digital de documentos segue como melhoria, junto da ICP-Brasil do prontuário.)*

## ✅ Fase 5 — Plataforma (concluída)
- ✅ **API REST pública v1** (`/api/v1`) com autenticação JWT Bearer, endpoints de pacientes e agendamentos, OpenAPI em `/api/v1/openapi` e documentação navegável (Swagger UI) em `/api-docs`.
- ✅ **Hardening:** proteção CSRF por origem para rotas com cookie, rate limiting (token e API v1), e revisão LGPD documentada em `docs/LGPD.md`.
- ✅ **Notificações em tempo real** (feed de próximos atendimentos no sino, atualização periódica) e ✅ **testes automatizados** (Vitest) do motor de protocolos, CSV, RBAC, datas e rate limit — 12 testes passando. *(Push via SSE/WebSocket e observabilidade ficam como evolução.)*
