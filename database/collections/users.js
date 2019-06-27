const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var userSchema = new Schema({
  username : String,
  password : String,
  id_user_google : integer
  
});
var user = mongoose.model("user", userSchema);
module.exports = user;
