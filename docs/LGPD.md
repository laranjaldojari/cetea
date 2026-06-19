# LGPD — Tratamento de dados no CETEA

O sistema trata dados pessoais e dados pessoais **sensíveis** (saúde), exigindo
cuidados reforçados (LGPD, Lei 13.709/2018, art. 11). Medidas já implementadas:

## Base legal
- Tutela da saúde, por profissionais ou serviços de saúde (art. 11, II, "f"), e
  execução de políticas públicas de saúde. A instituição deve registrar a base
  legal adotada e a finalidade do tratamento.

## Controles técnicos no sistema
- **Controle de acesso (RBAC):** cinco perfis; auditor é somente leitura; usuários
  não-administradores veem apenas a própria unidade.
- **Autenticação:** senhas com bcrypt (12 rounds); sessão em cookie httpOnly/SameSite;
  API externa com JWT Bearer de curta duração; proteção CSRF por origem; rate limiting.
- **Trilha de auditoria:** criação, alteração, exclusão, login/logout, exportações e
  downloads ficam em `audit_logs` (quem, o quê, quando).
- **Minimização na API:** endpoints externos retornam apenas os campos necessários.
- **Exclusão lógica:** pacientes, profissionais, unidades e documentos usam
  `deletedAt`, preservando histórico clínico/legal e permitindo rastreabilidade.
- **Integridade clínica:** registros de prontuário assinados são imutáveis (selo SHA-256)
  e versionados.

## Pendências recomendadas antes do uso em produção
- Registro de consentimento/finalidade e política de privacidade visível ao titular.
- Atendimento aos direitos do titular (acesso, correção, portabilidade, eliminação):
  há base técnica (dados estruturados + auditoria); falta a interface/fluxo dedicado.
- Criptografia em repouso no banco e backups, e criptografia dos arquivos no storage.
- Definição de prazos de retenção e expurgo conforme normas de saúde.
- DPO/encarregado e relatório de impacto (RIPD) quando aplicável.
