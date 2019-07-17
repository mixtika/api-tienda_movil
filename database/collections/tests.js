const mongoose = require("../connect");
var mon = require('mongoose');
var Schema = mon.Schema;
var testsSchema = new Schema({
  id: String,
  name: String
});
var tests = mongoose.model("tests", testsSchema);
module.exports = tests;
