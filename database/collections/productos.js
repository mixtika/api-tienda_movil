const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var productosSchema = new Schema({
  usuario: String,
  titulo : String,
  descripcion : String,
  cantidad : Number,
  precio : Number,
  foto: String,
  estado: Boolean,
  fecha_registro: Date
});
var productos = mongoose.model("productos", productosSchema);
module.exports = productos;
