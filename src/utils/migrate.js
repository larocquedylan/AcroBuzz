const { execSync } = require('child_process');

if (process.argv.length < 3) {
  console.error('Please provide a migration name.');
  process.exit(1);
}

const migrationName = process.argv[2];
const command = `npx prisma migrate dev --name ${migrationName}`;

try {
  console.log(`Running command: ${command}`);
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Error executing command:', error.message);
  process.exit(1);
}
