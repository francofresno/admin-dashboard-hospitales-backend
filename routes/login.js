var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var User = require('../models/user');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//// AUTENTICACIÓN GOOGLE
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async (req, res) => {

    var token = req.body.token;
    await verify(token)
        .then(
            googleUser => {
                User.findOne({ email: googleUser.email }, (err, userDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error al buscar usuario',
                            errors: err
                        });
                    }
                    if (userDB) {
                        if (!userDB.google) {
                            return res.status(400).json({
                                ok: false,
                                message: 'Debe de usar su autenticación normal',
                                errors: err
                            });
                        } else {
                            var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // 4 horas

                            res.status(200).json({
                                ok: true,
                                user: userDB,
                                token: token,
                                googleUser,
                                id: userDB._id
                            });
                        }
                    } else {
                        // el usuario no existe, crearlo
                        var user = new User();
                        user.name = googleUser.name;
                        user.email = googleUser.email;
                        user.img = googleUser.img;
                        user.google = true;
                        user.password = ':)';

                        user.save((err, userDB) => {
                            var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // 4 horas

                            res.status(200).json({
                                ok: true,
                                user: userDB,
                                token: token,
                                googleUser,
                                id: userDB._id
                            });
                        });
                    }

                });

            })
        .catch((e) => {
            return res.status(403).json({
                ok: false,
                message: 'Token inválido'
            });;
        });


});



//// AUTENTICACIÓN NORMAL
app.post('/', (req, res) => {

    var body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        /////////////////////////
        // Al momento de producción, combinar estos ifes. No se deben dar pistas al usuario de si ingresó bien la pw o email
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - password',
                errors: err
            });
        }
        /////////////////////////

        // Crear un token!!!
        userDB.password = ':)';

        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            user: userDB,
            token: token,
            id: userDB._id
        });

    });


});


module.exports = app;