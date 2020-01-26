var express = require('express');
var bcrypt = require('bcryptjs');

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var User = require('../models/user');

// ==========================================
// Obtener todos los usuarios
// ==========================================
app.get('/', (req, res, next) => {

    // Paginación
    var from = req.query.from || 0;
    from = Number(from);

    User.find({}, 'name email img role google')
        .skip(from)
        .limit(5)
        .exec(
            (err, users) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error cargando usuario',
                        errors: err
                    });
                }

                User.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        users: users,
                        total: total
                    });
                });

            });
});

// ==========================================
// Actualizar usuario
// ==========================================
// mdAuthentication.verifyToken es middleware. Se ejecuta antes del resto para validar cosas
// Se puede poner [middle1, middle2, etc] para muchas validaciones
app.put('/:id', mdAuthentication.verifyToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    User.findById(id, (err, user) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }


        user.name = body.name;
        user.email = body.email;
        user.role = body.role;

        user.save((err, userSaved) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar usuario',
                    errors: err
                });
            }

            userSaved.password = ':)';

            res.status(200).json({
                ok: true,
                user: userSaved
            });

        });

    });

});



// ==========================================
// Crear un nuevo usuario
// ==========================================
app.post('/', /* mdAuthentication.verifyToken, */ (req, res) => {

    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, userSaved) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            user: userSaved,
            usertoken: req.user
        });


    });

});


// ============================================
//   Borrar un usuario por el id
// ============================================
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {

    var id = req.params.id;

    User.findByIdAndRemove(id, (err, userDeleted) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error borrar usuario',
                errors: err
            });
        }

        if (!userDeleted) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            user: userDeleted
        });

    });

});


module.exports = app;