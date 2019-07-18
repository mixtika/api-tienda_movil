const express = require('express');
const fileUpload = require('express-fileupload');
var fs=require('fs');
const app = express();
app.use(fileUpload());

app.use(express.static(__dirname + '/public'));

var PRODUCTO = require("./database/collections/productos");
var REGISTRO = require("./database/collections/registros");
var FAVORITO = require("./database/collections/favoritos");

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

app.post('/buscarusuario', (req, res) => {
  var params=req.query;
  REGISTRO.find({ _id: params.id }).exec( (error, docs) => {
      if (docs != null) {
          res.status(200).json({"users": docs});
          return;
      }
      res.status(200).json({
        "users" : null
      });
    });
});



app.post('/producto',(req,res) => {
  var params = req.body;
  let EDFile = req.files.file;
  var _name = EDFile.name;
  var _name_ale = randomIntInc(1000,1000000) + _name.substring(_name.lastIndexOf("."),_name.length);
  params['foto'] = _name_ale;
  params['estado'] = true;
  params['fecha_registro'] = new Date();
  REGISTRO.findOne({ correo: params.correo }).exec( (error, docs) => {
      if (docs != null) {
        params['usuario'] = docs._id;
        EDFile.mv('./public/imgs/'+ _name_ale, err => {
          if(err) return res.status(500).send({ message : err });
            var newproducto = new PRODUCTO(params);
              newproducto.save().then( rr => {
                res.status(200).json({
                  "id": rr._id,
                  "msn": "Agregado con exito"
              });
            });
          });
      }
      else {
        res.status(200).json({
          "msn": "Error"
        });
      }
  });
});

app.post('/mispublicaciones', (req, res) => {
  var data=req.query;
  REGISTRO.findOne({ correo: data.correo }).exec( (error, docs) => {
      if (docs != null) {
        PRODUCTO.find({ usuario: docs._id, estado: true }).exec( (error, docs) => {
            if (docs != null) {
                res.status(200).json({ "productos" : docs });
                return;
            }
        });
      }
      else {
        res.status(200).json({
          "msn": "Error"
        });
      }
  });
});

app.post('/publicaciones', (req, res) => {
  PRODUCTO.find({ estado: true }).exec( (error, docs) => {
            if (docs != null) {
                res.status(200).json({ "productos" : docs });
                return;
            }
            else {
                res.status(200).json({ "productos" : null });
            }
        });
});

app.post('/buscarpub', (req, res) => {
  var params=req.query;
  PRODUCTO.find({titulo: {$regex:".*"+ params.texto +"", $options:"i"},estado:true}).exec( (error, docs) => {
            if (docs != null) {
                res.status(200).json({ "productos" : docs });
                return;
            }
            else {
                res.status(200).json({ "productos" : null });
            }
        });
});

app.post('/darbajapub', (req, res) => {
  var params=req.query;
  PRODUCTO.findOne({ _id : params.id }).exec( (error, docs) => {
            if (docs != null) {
              docs.estado=false;
              docs.save(function(error, documento){
                          if(error){
                            res.status(200).json({ "producto" : null });
                          }else{
                             res.status(200).json({ "producto" : docs });
                          }
                       });
            }
            else {
                res.status(200).json({ "producto" : null });
            }
        });
});

app.post('/buscarpubid', (req, res) => {
  var params=req.query;
  PRODUCTO.find({ _id : params.id }).exec( (error, docs) => {
            if (docs != null) {
                res.status(200).json({ "producto" : docs });
                return;
            }
            else {
                res.status(200).json({ "producto" : null });
            }
        });
});



app.post('/editcantidad', (req, res) => {
  var params=req.query;
  PRODUCTO.findOne({ _id : params.id }).exec( (error, docs) => {
            if (docs != null) {
              docs.cantidad=docs.cantidad-1;
              docs.save(function(error, documento){
                          if(error){
                            res.status(200).json({ "producto" : null });
                          }else{
                             res.status(200).json({ "producto" : docs });
                          }
                       });
            }
            else {
                res.status(200).json({ "producto" : null });
            }
        });
});

/******************AGREGAR A FAVORITOS********************/
app.post('/agregarfavorito', (req, res) => {
  var params=req.query
  REGISTRO.findOne({ correo: params.correo }).exec( (error, docs) => {
    if (docs != null) {
      params['comprador']=docs._id;
      FAVORITO.findOne({ comprador : docs._id, vendedor : params.vendedor, producto : params.producto  }).exec( (error, docs) => {
                if (docs == null) {
                  var newfav = new FAVORITO(params);
                    newfav.save().then( rr => {
                      res.status(200).json({ "favorito" : newfav });
                    });
                }
                else {
                  docs.cantidad=docs.cantidad + 1;
                  docs.save(function(error, documento){
                              if(error){
                                res.status(200).json({ "favorito" : null });
                              }else{
                                 res.status(200).json({ "favorito" : docs });
                              }
                           });
                }
            });
    }
    else {
      res.status(200).json({ "favorito" : null });
    }
  });
});

//REGISTRO.findOne({ correo: params.correo }).exec( (error, docs) => {
  //  if (docs != null) {

//db.people.find({"name": {$regex:".*fis", $options:"i"}},{name:1})

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

app.listen(3000,() => console.log('♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥\n♥♥♥     CORRIENDO EN EL PUERTO 3000    ♥♥♥\n♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥'))
