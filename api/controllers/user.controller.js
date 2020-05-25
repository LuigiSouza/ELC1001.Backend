const User = require('../models/user.model');

var jwt = require('jsonwebtoken');

// Dica: você pode usar req.user para acessar informações do usuário que está fazendo a request.

exports.create = async (req, res) => {
    try {
        const { username, name, email, password, gender, phone } = req.body;

        if( !username || !name || !email || !password ) {
            res.status(400).send({
                message: "Missing information."
            }); 
        }

        const email_exist = await User.findOne({ email });
        const user_exist = await User.findOne({ username });

        let user = await User.findOne({ username , email });

        if(!email_exist && !user_exist) {

            const split = name.split(' ');
            const fullname = {
                first: split[0],
                last: split[1]
            };

            var userAux = new User({
                username,
                name: fullname,
                email,
                password,
                gender,
                phone
            });

            userAux.token = userAux.generateAuthToken();
            
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

        if (username == undefined || email == undefined || password == undefined) {
            res.status(401).send({
                message: "Email ou senha inválidos" // usuario ou senha invalidos
            });
        } else {

            // A decidir: validar via email ou via usuario
            var validUser = await User.findByUsername(username, password);
            var validEmail = await User.findByEmail(email, password);

            if (validUser && validEmail) {

                let tokenData = {
                    name: validUser.name,
                    email: validUser.email,
                    // id: validUser._id
                }
                let token = jwt.sign(tokenData, process.env.JWT_KEY, { expiresIn: '1m' });

                res.status(200).send({
                    sucess: true,
                    user: validUser,                    
                    token: token
                });                
            } else {
                res.status(401).send({
                    message: "Email ou senha inválidos" // usuario ou senha invalidos
                });
            }
        }
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