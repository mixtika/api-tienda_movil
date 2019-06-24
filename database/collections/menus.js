const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var menusSchema = new Schema({
  name : String,
  price : Number,
  description : String,
  registerdate : Date,
  picture : String,
  id_restaurant : String
});
var menus = mongoose.model("menus", menusSchema);
module.exports = menus;
