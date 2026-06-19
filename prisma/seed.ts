import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ----- Instituição (white-label) -----
  const inst = await prisma.instituicao.upsert({
    where: { id: "inst_demo" },
    update: {},
    create: {
      id: "inst_demo",
      nome: "CETEA — Secretaria Municipal de Saúde",
      corPrimaria: "#0E7C86",
      corSecundaria: "#0B5563",
      corAcento: "#F59E0B",
    },
  });

  // ----- Unidade -----
  const unidade = await prisma.unidade.upsert({
    where: { id: "unid_demo" },
    update: {},
    create: {
      id: "unid_demo",
      nome: "Unidade Central CETEA",
      municipio: "Almeirim",
      estado: "PA",
      consultorios: 4,
      salasTerapeuticas: 3,
      espacoSensorial: true,
      salaIntegracao: true,
      instituicaoId: inst.id,
    },
  });

  // ----- Usuários (um por perfil) -----
  const senhaHash = await bcrypt.hash("cetea@123", 12);
  const usuarios: { email: string; nome: string; role: any }[] = [
    { email: "admin@cetea.gov.br", nome: "Administrador Geral", role: "ADMIN" },
    { email: "coordenador@cetea.gov.br", nome: "Coordenação", role: "COORDENADOR" },
    { email: "recepcao@cetea.gov.br", nome: "Recepção", role: "RECEPCAO" },
    { email: "profissional@cetea.gov.br", nome: "Profissional Clínico", role: "PROFISSIONAL" },
    { email: "auditor@cetea.gov.br", nome: "Auditoria", role: "AUDITOR" },
  ];
  for (const u of usuarios) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, senhaHash, instituicaoId: inst.id, unidadeId: unidade.id },
    });
  }

  // ----- Especialidades -----
  for (const nome of ["Psicologia", "Fonoaudiologia", "Terapia Ocupacional", "Neuropediatria", "Psiquiatria", "Fisioterapia"]) {
    await prisma.especialidade.upsert({ where: { nome }, update: {}, create: { nome } });
  }

  // ----- Protocolos de avaliação -----
  // As REGRAS de pontuação são reais; os ITENS são EXEMPLOS (itensExemplo: true)
  // e devem ser substituídos pelo texto oficial licenciado de cada instrumento.
  const NOTA_LICENCA =
    "Itens de exemplo. Carregue o texto oficial validado do instrumento sob a licença aplicável antes do uso clínico.";

  const itensSeq = (n: number, prefixo: string, reversos: number[] = []) =>
    Array.from({ length: n }, (_, i) => ({
      id: String(i + 1),
      texto: `${prefixo} ${i + 1}`,
      ...(reversos.includes(i + 1) ? { reverso: true } : {}),
    }));

  const protocolos = [
    {
      tipo: "M_CHAT_R" as const,
      nome: "M-CHAT-R — Triagem (pais/responsáveis)",
      definicao: {
        respondente: "Pais/responsáveis",
        instrucoes: "Responda considerando como a criança normalmente se comporta.",
        tipoResposta: "SIM_NAO",
        metodo: "CONTAGEM_RISCO",
        // Itens 2, 5 e 12 são invertidos (SIM = risco); demais NÃO = risco.
        itens: itensSeq(20, "Pergunta", [2, 5, 12]),
        faixas: [
          { de: 0, ate: 2, classificacao: "Baixo risco — sem necessidade de seguimento" },
          { de: 3, ate: 7, classificacao: "Risco moderado — aplicar seguimento M-CHAT-R/F" },
          { de: 8, ate: 20, classificacao: "Alto risco — encaminhar para avaliação diagnóstica" },
        ],
        itensExemplo: true,
        notaLicenca: NOTA_LICENCA,
      },
    },
    {
      tipo: "CARS" as const,
      nome: "CARS — Observação direta (profissional)",
      definicao: {
        respondente: "Profissional",
        instrucoes: "Pontue cada domínio de 1 (dentro da normalidade) a 4 (gravemente atípico). Permite meios-pontos.",
        tipoResposta: "ESCALA",
        metodo: "SOMA",
        opcoes: [1, 1.5, 2, 2.5, 3, 3.5, 4].map((v) => ({ valor: v, rotulo: String(v) })),
        itens: itensSeq(15, "Domínio"),
        faixas: [
          { de: 15, ate: 29.5, classificacao: "Sem indícios de autismo" },
          { de: 30, ate: 36.5, classificacao: "Autismo leve a moderado" },
          { de: 37, ate: 60, classificacao: "Autismo grave" },
        ],
        itensExemplo: true,
        notaLicenca: NOTA_LICENCA + " A CARS é um instrumento proprietário (WPS).",
      },
    },
    {
      tipo: "SNAP_IV" as const,
      nome: "SNAP-IV — 26 itens (pais/professores)",
      definicao: {
        respondente: "Pais/professores",
        instrucoes: "Avalie cada item de 0 (Nem um pouco) a 3 (Demais).",
        tipoResposta: "ESCALA",
        metodo: "SOMA_SUBESCALAS",
        opcoes: [
          { valor: 0, rotulo: "Nem um pouco" }, { valor: 1, rotulo: "Só um pouco" },
          { valor: 2, rotulo: "Bastante" }, { valor: 3, rotulo: "Demais" },
        ],
        itens: itensSeq(26, "Item"),
        subescalas: [
          { nome: "Desatenção", itens: ["1","2","3","4","5","6","7","8","9"] },
          { nome: "Hiperatividade/Impulsividade", itens: ["10","11","12","13","14","15","16","17","18"] },
          { nome: "Comportamento opositor", itens: ["19","20","21","22","23","24","25","26"] },
        ],
        itensExemplo: true,
        notaLicenca: NOTA_LICENCA + " Os pontos de corte por subescala (pais/professores) devem ser configurados pela equipe clínica.",
      },
    },
    {
      tipo: "ATA" as const,
      nome: "ATA — Rastreio de traços autísticos",
      definicao: {
        respondente: "Profissional/responsável",
        instrucoes: "Marque cada comportamento presente (cada presença soma 1 ponto).",
        tipoResposta: "PRESENCA",
        metodo: "CONTAGEM_RISCO",
        itens: itensSeq(113, "Comportamento"),
        faixas: [
          { de: 0, ate: 22, classificacao: "Abaixo do ponto de corte (23)" },
          { de: 23, ate: 113, classificacao: "Acima do ponto de corte — rastreio positivo" },
        ],
        itensExemplo: true,
        notaLicenca: NOTA_LICENCA + " Ballabriga et al. (1994); adapt. Assumpção et al. (1999).",
      },
    },
  ];
  for (const p of protocolos) {
    await prisma.protocolo.create({ data: { tipo: p.tipo, nome: p.nome, definicao: p.definicao } });
  }

  // ----- Profissionais -----
  const psico = await prisma.especialidade.findUnique({ where: { nome: "Psicologia" } });
  const fono = await prisma.especialidade.findUnique({ where: { nome: "Fonoaudiologia" } });
  const profA = await prisma.profissional.upsert({
    where: { cpf: "11111111111" }, update: {},
    create: { nome: "Dra. Ana Lima", cpf: "11111111111", conselho: "CRP", numeroRegistro: "06/123456", especialidadeId: psico?.id, unidadeId: unidade.id },
  });
  const profB = await prisma.profissional.upsert({
    where: { cpf: "22222222222" }, update: {},
    create: { nome: "Dr. Bruno Costa", cpf: "22222222222", conselho: "CREFITO", numeroRegistro: "FN-7890", especialidadeId: fono?.id, unidadeId: unidade.id },
  });

  // ----- Pacientes de exemplo -----
  const [joao, maria, lucas] = await Promise.all([
    prisma.paciente.upsert({ where: { cpf: "30000000001" }, update: {}, create: { cpf: "30000000001", nomeCompleto: "João Pedro Almeida", dataNascimento: new Date("2018-04-12"), sexo: "MASCULINO", status: "ATIVO", nivelSuporte: "NIVEL_2", cid10: "F84.0", municipio: "Almeirim", estado: "PA", unidadeId: unidade.id } }),
    prisma.paciente.upsert({ where: { cpf: "30000000002" }, update: {}, create: { cpf: "30000000002", nomeCompleto: "Maria Clara Santos", dataNascimento: new Date("2015-09-03"), sexo: "FEMININO", status: "FILA_ESPERA", nivelSuporte: "NAO_AVALIADO", municipio: "Almeirim", estado: "PA", unidadeId: unidade.id } }),
    prisma.paciente.upsert({ where: { cpf: "30000000003" }, update: {}, create: { cpf: "30000000003", nomeCompleto: "Lucas Ferreira", dataNascimento: new Date("2012-01-22"), sexo: "MASCULINO", status: "ATIVO", nivelSuporte: "NIVEL_1", cid10: "F84.5", municipio: "Almeirim", estado: "PA", unidadeId: unidade.id } }),
  ]);

  // ----- Agendamentos de exemplo (hoje e amanhã) -----
  const slot = (offsetDias: number, hora: number) => {
    const d = new Date(); d.setDate(d.getDate() + offsetDias); d.setHours(hora, 0, 0, 0); return d;
  };
  const ag1Ini = slot(0, 9), ag2Ini = slot(0, 14), ag3Ini = slot(1, 10);
  await prisma.agendamento.createMany({
    data: [
      { pacienteId: joao.id, profissionalId: profA.id, unidadeId: unidade.id, tipo: "TERAPIA", status: "CONFIRMADO", inicio: ag1Ini, fim: new Date(ag1Ini.getTime() + 3600000) },
      { pacienteId: lucas.id, profissionalId: profB.id, unidadeId: unidade.id, tipo: "AVALIACAO", status: "AGENDADO", inicio: ag2Ini, fim: new Date(ag2Ini.getTime() + 3600000) },
      { pacienteId: joao.id, profissionalId: profA.id, unidadeId: unidade.id, tipo: "CONSULTA", status: "AGENDADO", inicio: ag3Ini, fim: new Date(ag3Ini.getTime() + 3600000) },
    ],
  });

  console.log("✓ Seed concluído. Login admin: admin@cetea.gov.br / cetea@123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
