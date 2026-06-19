import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: { title: "CETEA API", version: "1.0.0", description: "API REST para integração (e-SUS, CNES, sistemas municipais, mobile)." },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/token": {
      post: {
        summary: "Obter token de acesso", security: [],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, senha: { type: "string" } }, required: ["email", "senha"] } } } },
        responses: { "200": { description: "Token emitido" }, "401": { description: "Credenciais inválidas" }, "429": { description: "Muitas tentativas" } },
      },
    },
    "/pacientes": {
      get: {
        summary: "Listar pacientes (paginado)",
        parameters: [
          { name: "pagina", in: "query", schema: { type: "integer", default: 1 } },
          { name: "tamanho", in: "query", schema: { type: "integer", default: 50, maximum: 100 } },
        ],
        responses: { "200": { description: "Lista de pacientes" }, "401": { description: "Não autenticado" }, "429": { description: "Limite excedido" } },
      },
    },
    "/pacientes/{id}": {
      get: { summary: "Obter paciente", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Paciente" }, "404": { description: "Não encontrado" } } },
    },
    "/agendamentos": {
      get: {
        summary: "Listar agendamentos por período",
        parameters: [
          { name: "inicio", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "fim", in: "query", schema: { type: "string", format: "date-time" } },
        ],
        responses: { "200": { description: "Lista de agendamentos" } },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec);
}
