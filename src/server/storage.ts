import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

// Backend padrão: disco local (defina STORAGE_DIR e monte um volume no Dokploy).
// Opcional: S3/MinIO se as variáveis S3_* estiverem configuradas.
const DIR = process.env.STORAGE_DIR || join(process.cwd(), "uploads");
const usarS3 = Boolean(process.env.S3_ENDPOINT && process.env.S3_BUCKET);

export interface ArquivoSalvo { key: string; tamanho: number }

export async function salvarArquivo(buffer: Buffer, nomeOriginal: string): Promise<ArquivoSalvo> {
  const ext = nomeOriginal.includes(".") ? "." + nomeOriginal.split(".").pop() : "";
  const key = `${randomUUID()}${ext}`;
  if (usarS3) {
    const mod = "@aws-sdk/client-s3";
    const { S3Client, PutObjectCommand } = await import(mod);
    const client = new S3Client({
      endpoint: process.env.S3_ENDPOINT, region: process.env.S3_REGION || "us-east-1", forcePathStyle: true,
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY!, secretAccessKey: process.env.S3_SECRET_KEY! },
    });
    await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: buffer }));
  } else {
    await mkdir(DIR, { recursive: true });
    await writeFile(join(DIR, key), buffer);
  }
  return { key, tamanho: buffer.length };
}

export async function lerArquivo(key: string): Promise<Buffer> {
  if (usarS3) {
    const mod = "@aws-sdk/client-s3";
    const { S3Client, GetObjectCommand } = await import(mod);
    const client = new S3Client({
      endpoint: process.env.S3_ENDPOINT, region: process.env.S3_REGION || "us-east-1", forcePathStyle: true,
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY!, secretAccessKey: process.env.S3_SECRET_KEY! },
    });
    const out = await client.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    const chunks: Uint8Array[] = [];
    for await (const c of out.Body as any) chunks.push(c);
    return Buffer.concat(chunks);
  }
  return readFile(join(DIR, key));
}

export async function removerArquivo(key: string): Promise<void> {
  try {
    if (!usarS3) await unlink(join(DIR, key));
    // (remoção no S3 omitida de propósito; manter histórico)
  } catch { /* ignora */ }
}
