import { execSync } from 'child_process';
import { createConnection } from 'net';
import { setTimeout } from 'timers/promises';
import { resolve } from 'path';

const { DATABASE_URL } = process.env;
const DB_TIMEOUT = 60;
const MIGRATE_RETRIES = 5;

function parseDbHost(url: string): { host: string; port: number } {
  const match = url?.match(/@([^:]+):(\d+)/);
  return { host: match ? match[1] : 'localhost', port: match ? Number(match[2]) : 5432 };
}

async function waitDb(): Promise<void> {
  const { host, port } = parseDbHost(DATABASE_URL || '');
  console.log(`==> Esperando DB en ${host}:${port}...`);
  for (let i = 1; i <= DB_TIMEOUT; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const sock = createConnection({ host, port }, () => {
          sock.end();
          resolve();
        });
        sock.on('error', reject);
        sock.setTimeout(2000, () => { sock.destroy(); reject(new Error('timeout')); });
      });
      console.log('==> DB lista');
      return;
    } catch {
      process.stdout.write(`\r==> Esperando DB... ${i}s`);
      await setTimeout(1000);
    }
  }
  throw new Error('Timeout esperando DB');
}

function run(cmd: string): void {
  const cwd = resolve(__dirname, '../..');
  console.log(`==> Ejecutando: ${cmd} (cwd: ${cwd})`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

async function main(): Promise<void> {
  await waitDb();
  for (let i = 1; i <= MIGRATE_RETRIES; i++) {
    try {
      run('npx prisma migrate deploy');
      break;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`==> Error migraciones (intento ${i}/${MIGRATE_RETRIES}):`, msg);
      if (i === MIGRATE_RETRIES) throw new Error(`Migraciones fallaron: ${msg}`);
      console.log(`Reintentando migraciones en 3s...`);
      await setTimeout(3000);
    }
  }
  try { run('node dist/prisma/seed.js'); } catch { console.log('Seed omitido'); }
  console.log('==> Iniciando NestJS...');
  require('./main');
}

main().catch((err) => { console.error(err); process.exit(1); });
