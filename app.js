const express = require('express');
const fileUpload = require('express-fileupload');
var fs=require('fs');
const app = express();
app.use(fileUpload());

var PRODUCTO = require("./database/collections/productos");
var REGISTRO = require("./database/collections/registros");

var TEST = require("./database/collections/tests");

app.post('/upload',(req,res) => {
  var params = req.body;
  let EDFile = req.files.file;

  var _id = params.id;
  var _name = params.name;

  EDFile.mv('./public/imgs/'+ _id + _name + EDFile.name, err => {
    if(err) return res.status(500).send({ message : err });

      var newTest = new TEST(params);
      newTest.save().then( rr => {
        res.status(200).json({
          "id": rr._id,
          "msn": "Agregado con exito"
        });
      });
      //return res.status(200).send({ message : _id });
    });
});

app.post('/registro', (req, res) => {
  //res.status(200).json({"id":req.query});
  var data=req.query;
  data['fecha_registro'] = new Date();
  var newregistro = new REGISTRO(data);
  newregistro.save().then( rr => {
    res.status(200).json({
      "id": rr._id,
      "msn": "agregado con exito"
    });
  });
});

app.post('/verificar', (req, res) => {
  var data=req.query;
  REGISTRO.find({correo: data.correo}).exec( (error, docs) => {
      if (docs != null) {
          res.status(200).json({"users": docs});
          return;
      }
      res.status(200).json({
        "correo" : true
      });
    });
});




app.post('/uploadx',(req,res) => {
  var data=req.query;
  let foto = data['foto'];
  let buff = new Buffer(foto, 'base64');
  let text = buff.toString('ascii');
  fs.writeFile("./public/imgs/out.jpg", text, "binary", function (err) {
    console.log(err);//writes out file without error, but it's not a valid image
});

res.status(200).json({
  "msn" : "ok"
});

});

function randomIntInc(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}

app.post('/guardar_producto', (req, res) => {
  //res.status(200).json({"id":req.query});
  var data=req.query;
  data['fecha_registro'] = new Date();
  data['foto'] = randomIntInc(1000,1000000)+".jpg";
  var newproducto = new PRODUCTO(data);
  newproducto.save().then( rr => {
    res.status(200).json({
      "id": rr._id,
      "msn": "Producto agregado con exito"
    });
  });
});

app.get('/lista_productos', (req, res) => {
  var data=req.query;
  PRODUCTO.find({usuario: data.usuario}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json({"orders": docs});
        return;
    }
    res.status(200).json({
      "msn" : "No existe el recurso"
    });
});
});

app.listen(3000,() => console.log('Corriendo'))
