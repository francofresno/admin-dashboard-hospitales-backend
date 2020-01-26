var express = require('express');

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var Medic = require('../models/medic');


// ==========================================
// Obtener todos los medico
// ==========================================
app.get('/', (req, res, next) => {

    // Paginación
    var from = req.query.from || 0;
    from = Number(from);

    Medic.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec((err, medics) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error cargando medicos',
                    errors: err
                });
            }

            Medic.count({}, (err, total) => {
                res.status(200).json({
                    ok: true,
                    medics: medics,
                    total: total
                });
            });
        });
});

// ==========================================
// Actualizar medico
// ==========================================
app.put('/:id', mdAuthentication.verifyToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medic.findById(id, (err, medic) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el medico',
                errors: err
            });
        }
        if (!medic) {
            return res.status(400).json({
                ok: false,
                message: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medic.name = body.name;
        medic.img = body.img;
        medic.user = body.user;
        medic.hospital = body.hospital;

        medic.save((err, medicSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medic: medicSaved
            });
        });
    });

});



// ==========================================
// Crear un nuevo medico
// ==========================================
app.post('/', mdAuthentication.verifyToken, (req, res) => {

    var body = req.body;

    var medic = new Medic({
        name: body.name,
        img: body.img,
        user: body.user,
        hospital: body.hospital
    });

    medic.save((err, medicSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear el medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medic: medicSaved,
            medictoken: req.medic
        });
    });

});


// ============================================
//   Borrar un medico por el id
// ============================================
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {

    var id = req.params.id;

    Medic.findByIdAndDelete(id, (err, medicDeleted) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al borrar el medico',
                errors: err
            });
        }

        if (!medicDeleted) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medic: medicDeleted
        });
    });

});


module.exports = app;