const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var ordersSchema = new Schema({
  client: String,
  product : String,
  quantity : Number,
  price : Number,
  lat : String,
  log : String,
  id_restaurant : String,
  orderdate: Date
});
var orders = mongoose.model("orders", ordersSchema);
module.exports = orders;
