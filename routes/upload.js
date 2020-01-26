var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var User = require('../models/user');
var Hospital = require('../models/hospital');
var Medic = require('../models/medic');

//middleware
app.use(fileUpload());

app.put('/:type/:id', (req, res, next) => {

    var type = req.params.type;
    var id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre archivo
    var file = req.files.image;
    var cutName = file.name.split('.');
    var fileExtension = cutName[cutName.length - 1];

    // Colecciones permitidas
    var validCollections = ['hospitals', 'medics', 'users'];

    if (validCollections.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Colección inválida',
            errors: { message: 'Las colecciones válidas son ' + validExtensions.join(', ') }
        });
    }

    // Extensiones permitidas
    var validExtensions = ['png', 'jpg', 'gif', 'jpeg'];

    if (validExtensions.indexOf(fileExtension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extensión inválida',
            errors: { message: 'Las extensiones válidas son ' + validExtensions.join(', ') }
        });
    }

    // Nombre archivo personalizado
    var filename = `${id}-${new Date().getMilliseconds()}.${fileExtension}`;

    // Mover archivo a un path
    var path = `./uploads/${type}/${filename}`;

    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover el archivo',
                errors: err
            });
        }

        uploadForType(type, id, filename, res);
    });
});

function uploadForType(type, id, filename, res) {
    if (type === 'users') {
        User.findById(id, (err, user) => {
            var oldPath = './uploads/users/' + user.img;

            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, err => { });
            } // elimino img anterior

            user.img = filename;
            user.save((err, userUpdated) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario actualizada',
                    user: userUpdated
                });
            });
        });
    }
    if (type === 'medics') {
        Medic.findById(id, (err, medic) => {
            var oldPath = './uploads/medics/' + medic.img;

            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, err => { });
            } // elimino img anterior

            medic.img = filename;
            medic.save((err, medicUpdated) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de medico actualizada',
                    medic: medicUpdated
                });
            });
        });
    }
    if (type === 'hospitals') {
        Hospital.findById(id, (err, hospital) => {
            var oldPath = './uploads/hospitals/' + hospital.img;

            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, err => { });
            } // elimino img anterior

            hospital.img = filename;
            hospital.save((err, hospitalUpdated) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de hospital actualizada',
                    hospital: hospitalUpdated
                });
            });
        });
    }
}

module.exports = app;