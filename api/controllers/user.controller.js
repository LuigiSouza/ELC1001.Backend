const User = require('../models/user.model');

var jwt = require('jsonwebtoken');

// Dica: você pode usar req.user para acessar informações do usuário que está fazendo a request.

exports.create = async (req, res) => {
    try {
        const user = req.body;

        if( !user.username ) {
            res.status(400).send({
                message: "Missing username."
            }); 
        }
        else if( !user.name ) {
            res.status(400).send({
                message: "Missing name."
            }); 
        }
        else if( !user.email ) {
            res.status(400).send({
                message: "Missing email."
            }); 
        }
        else if( !user.password ) {
            res.status(400).send({
                message: "Missing password."
            }); 
        }

        else {

            if( user.name.first == undefined ) {
                return res.status(400).send({
                    message: "Missing first name."
                }); 
            }
            else if ( user.name.last == undefined ) {
                return res.status(400).send({
                    message: "Missing last name."
                }); 
            }

            const { email } = user.email;
            const { username } = user.username;

            const email_exist = await User.findOne({ email });
            const user_exist = await User.findOne({ username });

            if(!email_exist && !user_exist) {

                var userAux = new User(
                    user
                );

                userAux.token = await userAux.generateAuthToken();
                
                res.status(201).send({
                    sucess: true,
                    user: userAux,
                    token: userAux.tokens
                });          

            }
            else {
                res.status(400).send({
                    message: "User already exist."
                });  
            }

        }
        // Essa rota deve criar um novo usuário no banco de dados e criar um token
        // para ele (para gerar o token use o método definido no arquivo user.model.js).

        // A resposta deve estar no formato { user: [dados do usuário], token: [token gerado]}
        // Pesquise qual deve ser o código de retorno HTTP quando um novo recurso foi criado no banco.
    
        // return res.json(user);
    }
    catch(err) {
        console.error(err, err.message, err.stack);

        res.status(500).send({
            message: err.message || "An error occured when creating the user."
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, email, password } = req.body.userData;
            
        if (password) {
            
            if (email) var user = await User.findByEmail(email, password);
            else if (username) var user = await User.findByUsername(username, password);

            if ( user ) {

                let token = await user.generateAuthToken();

                return res.status(200).send({
                    sucess: true,
                    user,             
                    token
                });                
            } 
        }
        res.status(401).send({
            message: "Usuário ou senha inválidos" // usuario ou senha invalidos
        });
        // Essa rota deve, usando os métodos disponibilizados no arquivo user.model.js
        // confirmar que as credenciais digitadas estão corretas e gerar um novo token
        // JWT para o usuário.

        // A resposta deve estar no formato { user: [dados do usuário], token: [token gerado]}
        // Pesquise qual deve ser o código de retorno HTTP quando a requisição foi bem sucedida.
    } catch (err) {
        console.error(err, err.message, err.stack);

        res.status(500).send({
            message: err.message
        });
    }
};

exports.getInfo = (req, res) => {
    try {
        let user = req.user;

        delete user.password;
        delete user.tokens;

        res.status(200).send({ user: user });  
        // Essa rota deve retornar as informações do usuário que está fazendo a requisição.
        
        // Você pode escolher como retornar os dados, contanto que todas as informações do usuário
        // (exceto informações como senha e tokens).
        // Pesquise qual deve ser o código de retorno HTTP quando a requisição foi bem sucedida.
        
    } catch(err) {
        console.error(err, err.message, err.stack);

        res.status(500).send({
            message: err.message || "An error occured when trying to retrieve user info."
        });
    }
};