const express = require('express');
const path = require('path');
const db = require('../database/db');

const router = express.Router();

// Servir formulário
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Processar registro
router.post('/submit', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await db.insertUser(name, email);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sucesso</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="container success">
          <div class="header"><h2>Registro Bem-Sucedido!</h2></div>
          <div class="form-container">
            <div class="user-info">
              <p><strong>Nome:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>ID:</strong> ${user.id}</p>
            </div>
            <div class="button-group">
              <a href="/" class="btn">Novo Registro</a>
              <a href="/users" class="btn secondary">Ver Usuários</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="container error">
          <div class="header"><h2>Erro no Registro</h2></div>
          <div class="form-container">
            <div class="error-message">
              <p>${error.message}</p>
            </div>
            <a href="/" class="btn">Voltar</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

// Listar usuários
router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    
    let userRows = '';
    users.forEach(user => {
      const date = new Date(user.created_at).toLocaleDateString('pt-BR');
      userRows += `
        <tr>
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${date}</td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Usuários Registrados</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Usuários Registrados</h2>
            <p>Total: ${users.length} usuário(s)</p>
          </div>
          <div class="form-container">
            ${users.length === 0 ? 
              '<div class="empty-state"><h3>Nenhum usuário registrado</h3><a href="/" class="btn">Registrar Agora</a></div>' : 
              `<div class="table-container">
                <table class="users-table">
                  <thead>
                    <tr><th>ID</th><th>Nome</th><th>Email</th><th>Registrado em</th></tr>
                  </thead>
                  <tbody>${userRows}</tbody>
                </table>
              </div>`
            }
            <div class="button-group">
              <a href="/" class="btn">Novo Usuário</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="container error">
          <div class="header"><h2>Erro no Banco de Dados</h2></div>
          <div class="form-container">
            <div class="error-message">
              <p>${error.message}</p>
            </div>
            <a href="/" class="btn">Voltar</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

module.exports = router;