import pkg from 'pg';
import bcrypt from 'bcrypt';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ferreteria',
  user: 'postgres',
  password: 'postgres',
});

const hash = await bcrypt.hash('admin123', 10);

await pool.query(
  "INSERT INTO users (id, username, password_hash, role) VALUES (gen_random_uuid(), $1, $2, $3) ON CONFLICT (username) DO UPDATE SET password_hash = $2",
  ['admin', hash, 'admin']
);

console.log('Admin creado con hash:', hash);

const result = await pool.query("SELECT username, password_hash FROM users WHERE username = 'admin'");
console.log('Verificación:', result.rows[0]);

await pool.end();