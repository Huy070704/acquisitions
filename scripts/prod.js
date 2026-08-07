import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
process.chdir(rootDir);

console.log('Checking environment variables...');
if (!fs.existsSync('.env.production')) {
  console.error('Error: .env.production not found.');
  console.error(
    'Please create .env.production based on the provided template and fill in your production Neon credentials.'
  );
  process.exit(1);
}

console.log('Starting Docker containers in production mode...');

const isWindows = process.platform === 'win32';

// Kiểm tra xem hệ thống dùng "docker compose" (V2 mới) hay "docker-compose" (V1 cũ)
const checkV2 = spawnSync(
  isWindows ? 'docker.exe' : 'docker',
  ['compose', 'version'],
  { shell: isWindows }
);
const useDockerComposeV2 = checkV2.status === 0;

let command = '';
let args = [];

if (useDockerComposeV2) {
  // Lệnh hiện đại: docker compose -f docker-compose.prod.yml up -d --build
  command = isWindows ? 'docker.exe' : 'docker';
  args = ['compose', '-f', 'docker-compose.prod.yml', 'up', '-d', '--build'];
} else {
  // Lệnh cũ: docker-compose -f docker-compose.prod.yml up -d --build
  command = isWindows ? 'docker-compose.exe' : 'docker-compose';
  args = ['-f', 'docker-compose.prod.yml', 'up', '-d', '--build'];
}

const upResult = spawnSync(command, args, {
  stdio: 'inherit',
  shell: isWindows,
});

if (upResult.error) {
  console.error(
    'Failed to start production Docker containers:',
    upResult.error
  );
  process.exit(1);
}

console.log('========================================');
console.log('Production environment is starting up...');
console.log(
  'The application will be running at http://localhost:3000 once ready.'
);
console.log(
  `To view logs, run: ${useDockerComposeV2 ? 'docker compose' : 'docker-compose'} -f docker-compose.prod.yml logs -f app`
);
