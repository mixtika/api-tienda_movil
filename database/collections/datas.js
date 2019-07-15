const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var userSchema = new Schema({
  nombres : String,
  apellidos : String,
  correo : String,
  fono : String,
});
var data = mongoose.model("data", userSchema);
module.exports = data;
