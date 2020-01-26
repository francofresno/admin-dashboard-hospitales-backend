var express = require('express');

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var Hospital = require('../models/hospital');

// ==========================================
// Obtener todos los hospital
// ==========================================
app.get('/', (req, res, next) => {

    // Paginación
    var from = req.query.from || 0;
    from = Number(from);

    Hospital.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .exec(
            (err, hospitals) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, total) => {
                    res.status(200).json({
                        ok: true,
                        hospitals: hospitals,
                        total: total
                    });
                });
            });
});

// ==========================================
// Actualizar hospital
// ==========================================
app.put('/:id', mdAuthentication.verifyToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.name = body.name;
        hospital.user = req.user._id;

        hospital.save((err, hospitalSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalSaved
            });
        });
    });

});


// ==========================================
// Crear un nuevo hospital
// ==========================================
app.post('/', mdAuthentication.verifyToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        name: body.name,
        user: req.user._id
    });

    hospital.save((err, hospitalSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear el hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalSaved
        });
    });

});


// ============================================
//   Borrar un hospital por el id
// ============================================
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalDeleted) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al borrar el hospital',
                errors: err
            });
        }

        if (!hospitalDeleted) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalDeleted
        });

    });

});


module.exports = app;