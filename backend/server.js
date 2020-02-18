// Configurando o servidor
const express = require('express');
const server = express();

// Configurar o servidor para apresentar arquivos estáticos
server.use(express.static('../frontend/public'));

// Habilitar body da formulario
server.use(express.urlencoded({ extended: true }));

const config = require('./dbconfig.json');
const { user, password, host, port, database } = config;

// Configurar a conexão com o database
const Pool = require('pg').Pool;
const db = new Pool({ 
    user,
    password,
    host,
    port,
    database,
});

// Configurando a template engine
const nunjucks = require('nunjucks');
nunjucks.configure('../frontend', {
    express: server,
    noCache: true,
});



// Configurar a apresentação da página
server.get('/', (req, res) => {
    
    db.query('SELECT * FROM donors', (err, result) => {
        if (err) return res.send('Erro de banco de dados.');

        const donors = result.rows;
        return res.render('index.html', { donors });
    })

});

server.post('/', (req, res) => {
    // Pegar dados do formulário
    const { name, email, blood } = req.body;
    
    if (name == "" || email == "" || blood == "") {
        return res.send('Todos os campos são obrigatórios');
    }

    // Coloco valores dentro do banco de dados
    const query = `
        INSERT INTO donors ("name", "email", "blood")
        VALUES ($1, $2, $3)`
    
    const values = [name, email, blood];

    db.query(query, values, (err) => {
        // Fluxo de erro
        if (err) return res.send('Erro no banco de dados.');

        // Fluxo ideal
        return res.redirect('/');
    });

});

// Ligar o servidor e permitir o acesso na porta 3000
server.listen(3000, () => {
    console.log('> Server running on port 3000');
});
