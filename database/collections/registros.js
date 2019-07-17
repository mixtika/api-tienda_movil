const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var registrosSchema = new Schema({
  nombres : String,
  apellidos : String,
  correo : String,
  sexo : String,
  edad : Number,
  lat: String,
  log: String,
  fecha_registro: Date
});
var registros = mongoose.model("data", registrosSchema);
module.exports = registros;
