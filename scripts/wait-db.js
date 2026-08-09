import pg from 'pg';
const { Client } = pg;

async function waitDb() {
  console.log('Waiting for database to be ready...');
  const maxRetries = 30;
  for (let i = 0; i < maxRetries; i++) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    try {
      await client.connect();
      await client.end();
      console.log('Database is ready! Proceeding with migrations...');
      process.exit(0);
    } catch {
      console.log(
        `Database not ready yet (attempt ${i + 1}/${maxRetries}), retrying in 1s...`
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  console.error('Database did not become ready in time. Exiting.');
  process.exit(1);
}

waitDb();
