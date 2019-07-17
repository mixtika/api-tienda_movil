const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var userSchema = new Schema({
  nombres : String,
  apellidos : String,
  correo : String,
  sexo : String,
  edad : Number
});
var data = mongoose.model("data", userSchema);
module.exports = data;
