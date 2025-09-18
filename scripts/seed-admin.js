#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://phoenix_user:phoenix_password@localhost:5432/phoenixsound',
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function seedAdmin() {
  try {
    console.log('🌟 Phoenix Sound Admin User Seeder');
    console.log('===================================\n');

    // Get admin details
    const username = await question('Enter admin username (default: admin): ') || 'admin';
    const email = await question('Enter admin email (default: admin@phoenixsound.com): ') || 'admin@phoenixsound.com';

    let password;
    if (process.argv.includes('--password') && process.argv[process.argv.indexOf('--password') + 1]) {
      password = process.argv[process.argv.indexOf('--password') + 1];
    } else {
      password = await question('Enter admin password: ');
    }

    if (!password) {
      console.error('❌ Password is required');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);

    if (existingUser.rows.length > 0) {
      console.log('⚠️  User already exists. Updating password...');

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update existing user
      await pool.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE username = $2',
        [hashedPassword, username]
      );

      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('👤 Creating new admin user...');

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      await pool.query(
        'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)',
        [username, hashedPassword, email]
      );

      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin Details:');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log('\n🚀 You can now login at http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    rl.close();
  }
}

// Run the seeder
seedAdmin();