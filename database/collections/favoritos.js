const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var favoritosSchema = new Schema({
  comprador: String,
  vendedor : String,
  producto : String,
  cantidad : Number
});
var favoritos = mongoose.model("favoritos", favoritosSchema);
module.exports = favoritos;
