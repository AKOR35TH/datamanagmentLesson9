const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// --- Middleware Setup ---
app.use(express.urlencoded({ extended: true }));

// --- Database Connection and Initialization ---
const DB_PATH = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database:', DB_PATH);
    
    // Create table with created_at timestamp
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error("⚠️ Table creation error:", err.message);
    });
  }
});

// =================================================================
// === HTML & CSS GENERATION FUNCTIONS (Modularized Views) =======
// =================================================================

// Function to hold all the CSS styles for consistency
function getCSS() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .container { background-color: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); width: 100%; max-width: 500px; overflow: hidden; }
    .container.success, .container.error { max-width: 600px; }
    .header { background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; padding: 25px 20px; text-align: center; }
    .header h2 { font-weight: 600; font-size: 1.5rem; margin-bottom: 5px; }
    .header p { opacity: 0.9; font-size: 0.9rem; }
    .form-container { padding: 30px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; }
    .form-control { width: 100%; padding: 12px 15px; border: 2px solid #e1e5ee; border-radius: 8px; font-size: 16px; outline: none; }
    .form-control:focus { border-color: #6a11cb; box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.1); }
    .btn { background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; border: none; border-radius: 8px; padding: 14px 20px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; text-decoration: none; display: inline-block; text-align: center; box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3); }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4); }
    .btn.secondary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); }
    .button-group { display: flex; gap: 10px; margin-top: 20px; }
    .button-group .btn { width: auto; flex: 1; }
    .footer { text-align: center; padding: 20px 0 0 0; color: #666; font-size: 0.85rem; margin-top: 15px; border-top: 1px solid #eee; }
    .footer a { color: #6a11cb; text-decoration: none; font-weight: 500; }
    .user-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .user-info p { margin: 10px 0; font-size: 1.1rem; }
    .error-message { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5c6cb; }
    .table-container { margin: 20px 0; overflow-x: auto; }
    .users-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9rem; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); }
    .users-table thead tr { background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; text-align: left; }
    .users-table th, .users-table td { padding: 12px 15px; border-bottom: 1px solid #e1e5ee; }
    .users-table tbody tr:nth-of-type(even) { background-color: #f8f9fa; }
    .users-table tbody tr:hover { background-color: #e3f2fd; }
    .users-table tbody tr:last-of-type { border-bottom: 2px solid #6a11cb; }
    .empty-state { text-align: center; padding: 40px 20px; color: #666; }
    .empty-state h3 { margin-bottom: 10px; color: #333; }
  `;
}

// Generates the HTML for the registration form
function getFormHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>User Registration</title>
      <style>${getCSS()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>User Registration Form</h2>
        </div>
        <form action="/submit" method="POST" class="form-container">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" class="form-control" required>
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" class="form-control" required>
          </div>
          <button type="submit" class="btn">Register User</button>
          
          <div class="footer">
            <a href="/users">View All Registered Users</a>
          </div>
        </form>
      </div>
    </body>
    </html>
  `;
}

// Generates the status page (Success or Error)
function getStatusHTML(type, title, message, user) {
  const userDetails = user ? 
    `<div class="user-info">
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>User ID:</strong> ${user.id}</p>
    </div>` : 
    `<div class="error-message">
        <p><strong>Error:</strong> ${message}</p>
        <p>This email might already be registered.</p>
    </div>`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>${getCSS()}</style>
    </head>
    <body>
      <div class="container ${type}">
        <div class="header">
          <h2>${title}</h2>
        </div>
        <div class="form-container">
          ${(type === 'error' && !user) ? userDetails : ''}
          ${(type === 'success' && user) ? userDetails : ''}
          <div class="button-group">
            <a href="/" class="btn">Go Back to Form</a>
            <a href="/users" class="btn secondary">View Users</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generates the full HTML for the users table
function getUsersHTML(rows) {
  let tableRows = '';
  if (rows.length === 0) {
    tableRows = `
      <div class="empty-state">
        <h3>No Users Registered Yet</h3>
        <p>Be the first to register!</p>
        <a href="/" class="btn">Register Now</a>
      </div>
    `;
  } else {
    rows.forEach((user) => {
      const registerDate = new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      tableRows += `
        <tr>
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${registerDate}</td>
        </tr>
      `;
    });

    tableRows = `
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Registered On</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Registered Users</title>
      <style>${getCSS()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Registered Users</h2>
          <p>Total: ${rows.length} user(s)</p>
        </div>
        
        <div class="form-container">
          <div class="table-container">
            ${tableRows}
          </div>
          <div class="button-group">
            <a href="/" class="btn">Register New User</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}


// =================================================================
// === EXPRESS ROUTES (Clean and Simple) ===========================
// =================================================================

// 1. Root Route: Serves the Form
app.get('/', (req, res) => {
    res.send(getFormHTML()); 
});

// 2. POST Route: Handles Form Submission
app.post('/submit', (req, res) => {
  const { name, email } = req.body; 
  const sql = `INSERT INTO users (name, email) VALUES (?, ?)`;
  
  db.run(sql, [name, email], function(err) {
    if (err) {
      console.error('❌ Error inserting data:', err.message);
      // Use the modular function for error status
      return res.send(getStatusHTML('error', 'Registration Failed', err.message, null));
    }
    
    console.log(`✨ Success! New user inserted with ID: ${this.lastID}`);
    // Use the modular function for success status
    res.send(getStatusHTML('success', 'Registration Successful!', null, { id: this.lastID, name, email }));
  });
});

// 3. GET Route: Retrieves and Displays All Users
app.get('/users', (req, res) => {
    const sql = `SELECT id, name, email, created_at FROM users ORDER BY id DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Error retrieving data:', err.message);
            // Use the modular function for retrieval error
            return res.send(getStatusHTML('error', 'Error Retrieving Users', 'There was an error retrieving the user data.', null));
        }
        
        // Use the modular function to generate and send the table view
        res.send(getUsersHTML(rows));
    });
});

// --- Server Start and Graceful Exit ---
app.listen(port, () => {
  console.log(`🌍 Server running on http://localhost:${port}`);
  console.log(`➡️ Access form at http://localhost:${port}`);
  console.log(`➡️ View users at http://localhost:${port}/users`);
});

process.on('SIGINT', () => {
  console.log('\nServer shutting down...');
  db.close((err) => {
    if (err) console.error("Error closing database:", err.message);
    else console.log("Database connection closed.");
    process.exit(0);
  });
});