var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
}, { collection: 'hospitals' }); // es como el @Table(name=...) de Spring, por defecto se le agrega la s al final del nombre de la clase por lo que en este caso no es necesario


module.exports = mongoose.model('Hospital', hospitalSchema);