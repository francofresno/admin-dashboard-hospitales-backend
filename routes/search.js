var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medic = require('../models/medic');
var User = require('../models/user');


app.get('/collection/:table/:search', (req, res) => {
    var table = req.params.table;
    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    var promise;

    switch (table) {
        case 'users':
            promise = searchUsers(search, regex);
            break;
        case 'medics':
            promise = searchMedics(search, regex);
            break;
        case 'hospitals':
            promise = searchHospitals(search, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                messege: 'Búsqueda inválida',
                error: {message: 'Tipo de tabla inválido'}
            });
    }
    
    promise.then(data => {
        res.status(200).json({
            ok: true,
            [table]: data //si ponés table te lo guarda como 'table'
        });        
    });
});

// Obtener todos los que coinciden con param search
app.get('/all/:search', (req, res, next) => {

    var search = req.params.search;
    // Expresión regular. Es para que sea no-casesensitive y filtre bien
    var regex = new RegExp(search, 'i');

    Promise.all([
        searchHospitals(search, regex),
        searchMedics(search, regex),
        searchUsers(search, regex)])
        .then(responses => {

            res.status(200).json({
                ok: true,
                hospitals: responses[0],
                medics: responses[1],
                users: responses[2]
            });

        });

});

function searchHospitals(search, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ name: regex }
            .populate('user', 'name email')
            .exec((err, hospitals) => {

                if (err) {
                    reject('Error al cargar hospitales: ', err);
                } else {
                    resolve(hospitals);
                }
            })
        )
    });
}

function searchMedics(search, regex) {

    return new Promise((resolve, reject) => {
        Medic.find({ name: regex }
            .populate('user', 'name email')
            .populate('hospital')
            .exec((err, medics) => {

                if (err) {
                    reject('Error al cargar medicos: ', err);
                } else {
                    resolve(medics);
                }
            })
        )
    });
}

function searchUsers(search, regex) {

    return new Promise((resolve, reject) => {
        User.find({}, 'name email role')
            .or([{ 'name': regex }, { 'email': regex }])
            .exec((err, users) => {

                if (err) {
                    reject('Error al cargar usuarios: ', err);
                } else {
                    resolve(users);
                }

            });
    });

}


module.exports = app;