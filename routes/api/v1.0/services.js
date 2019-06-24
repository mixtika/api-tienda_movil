var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');
//var _ = require("underscore");
var RESTAURANT = require("../../../database/collections/restaurant");
var USER = require("../../../database/collections/users");
var MENU = require("../../../database/collections/menus");
var ORDER = require("../../../database/collections/orders")


var Home = require("../../../database/collections/restaurant");

var Img = require("../../../database/collections/img");

var jwt = require("jsonwebtoken");


var storage = multer.diskStorage({
  destination: "./public/avatars",
  filename: function (req, file, cb) {
    console.log("-------------------------");
    console.log(file);
    cb(null, "IMG_" + Date.now() + ".jpg");
  }
});

var upload = multer({
  storage: storage
}).single("img");;


//Middelware
function verifytoken (req, res, next) {
  //Recuperar el header
  const header = req.headers["authorization"];
  if (header  == undefined) {
      res.status(403).json({
        msn: "No autotizado"
      })
  } else {
      req.token = header.split(" ")[1];
      jwt.verify(req.token, "secretkey123", (err, authData) => {
        if (err) {
          res.status(403).json({
            msn: "No autotizado"
          })
        } else {
          next();
        }
      });
  }
}
//CRUD Create, Read, Update, Delete
//Creation of users
router.post(/homeimg\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  upload(req, res, (err) => {
    if (err) {
      res.status(500).json({
        "msn" : "No se ha podido subir la imagen"
      });
    } else {
      var ruta = req.file.path.substr(6, req.file.path.length);
      console.log(ruta);
      var img = {
        idhome: id,
        name : req.file.originalname,
        physicalpath: req.file.path,
        relativepath: "http://localhost:7777" + ruta
      };
      var imgData = new Img(img);
      imgData.save().then( (infoimg) => {
        //content-type
        //Update User IMG
        var home = {
          gallery: new Array()
        }
        Home.findOne({_id:id}).exec( (err, docs) =>{
          //console.log(docs);
          var data = docs.gallery;
          var aux = new  Array();
          if (data.length == 1 && data[0] == "") {
            home.gallery.push("/api/v1.0/homeimg/" + infoimg._id)
          } else {
            aux.push("/api/v1.0/homeimg/" + infoimg._id);
            data = data.concat(aux);
            home.gallery = data;
          }
          Home.findOneAndUpdate({_id : id}, home, (err, params) => {
              if (err) {
                res.status(500).json({
                  "msn" : "error en la actualizacion del usuario"
                });
                return;
              }
              res.status(200).json(
                req.file
              );
              return;
          });
        });
      });
    }
  });
});
router.get(/homeimg\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  console.log(id)
  Img.findOne({_id: id}).exec((err, docs) => {
    if (err) {
      res.status(500).json({
        "msn": "Sucedio algun error en el servicio"
      });
      return;
    }
    //regresamos la imagen deseada
    var img = fs.readFileSync("./" + docs.physicalpath);
    //var img = fs.readFileSync("./public/avatars/img.jpg");
    res.contentType('image/jpeg');
    res.status(200).send(img);
  });
});
router.post("/home", (req, res) => {
  //Ejemplo de validacion
  if (req.body.name == "" && req.body.email == "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }
  var home = {
    street : req.body.street,
    descripcion : req.body.descripcion,
    price : req.body.price,
    lat : req.body.lat,
    lon : req.body.lon,
    neighborhood : req.body.neighborhood,
    city : req.body.city,
    gallery: "",
    contact: req.body.contact
  };
  var homeData = new Home(home);

  homeData.save().then( (rr) => {
    //content-type
    res.status(200).json({
      "id" : rr._id,
      "msn" : "usuario Registrado con exito "
    });
  });
});

// READ all users
router.get("/home", (req, res, next) => {
  var params = req.query;
  console.log(params);
  var price = params.price;
  var over = params.over;

  if (price == undefined && over == undefined) {
    // filtra los datos que tengan en sus atributos lat y lon null;
    Home.find({lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
    return;
  }
  if (over == "equals") {
    console.log("--------->>>>>>>")
    Home.find({price:price, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
    return;
  } else if ( over == "true") {
    Home.find({price: {$gt:price}, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
  } else if (over == "false") {
    Home.find({price: {$lt:price}, lat: {$ne: null}, lon: {$ne: null}}).exec( (error, docs) => {
      res.status(200).json(
        {
          info: docs
        }
      );
    })
  }
});
// Read only one user
router.get(/home\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  User.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({
      "msn" : "No existe el recurso "
    });
  })
});

router.delete(/home\/[a-z0-9]{1,}$/, verifytoken, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  User.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});
router.patch(/home\/[a-z0-9]{1,}$/, (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var home = {};
  for (var i = 0; i < keys.length; i++) {
    home[keys[i]] = req.body[keys[i]];
  }
  console.log(home);
  Home.findOneAndUpdate({_id: id}, home, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
router.put(/home\/[a-z0-9]{1,}$/, verifytoken,(req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['name', 'altura', 'peso', 'edad', 'sexo', 'email'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var user = {
    name : req.body.name,
    altura : req.body.altura,
    peso : req.body.peso,
    edad : req.body.edad,
    sexo : req.body.sexo,
    email : req.body.email
  };
  Home.findOneAndUpdate({_id: id}, user, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
module.exports = router;

//API RESTAURANT

router.post('/restaurant', (req, res) => {
  var data=req.body;
  data['registerdate'] = new Date();
  var newrest = new RESTAURANT(data);
  newrest.save().then( rr => {
    res.status(200).json({
      "id": rr._id,
      "msn": "restaurant agregado con exito"
    });
  });
});

router.post('/restauran', (req, res) => {
    res.status(200).json({
      "id": "1",
      "msn": "restaurant agregado con exito"
    });
});

router.get('/list', (req, res) => {
RESTAURANT.find().exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json({"restaurants": docs});
        return;
    }
    res.status(200).json({
      "msn" : "No existe el recurso "
    });
});
});

router.post('/save_restaurant', (req, res) => {
  var data=req.query;
  data['logo'] = "logo.jpg";
  data['picture'] = "picture.jpg";
  data['registerdate'] = new Date();
  var newrest = new RESTAURANT(data);
  newrest.save().then( rr => {
    res.status(200).json({
      "id": rr._id,
      "msn": "restaurant agregado con exito"
    });
  });
});

router.post('/test', (req, res) => {
  var params=req.query;;
  res.status(200).json({
      "msn" : params
  });
});


router.post('/test', (req, res) => {
  var params=req.query;
  res.status(200).json({
      "msn" : params
  });
});

/*
Login USER
*/
router.post('/save_user', (req, res) => {
  var data=req.body;
  var newUser = new USER(data);
  newUser.save().then( rr => {
    res.status(200).json({
      "id": rr._id,
      "msn": "usuario agregado con exito"
    });
  });
});

router.post("/login", (req, res, next) => {
  var params = req.query;

  var username = params.username;
  var password = params.password;

  var result = USER.find({username: username, password: password}).exec((err, doc) => {
    if (err) {
      res.status(200).json({
        msn : "No se puede concretar con la peticion"
      });
      return;
    }
    else
    {
      res.status(200).json({ "users": doc });
      return;
    }
  });
});

/***********CODIGO ORDEN************************/
router.post('/save_order', (req, res) => {
  res.status(200).json({"id":req.query});
  var data=req.query;
  data['orderdate'] = new Date();
  var neworder = new ORDER(data);
  neworder.save().then( rr => {
    res.status(200).json({
      "id": rr._id,
      "msn": "Orden agregado con exito"
    });
  });
});

router.get('/list_order', (req, res) => {
  var data=req.query;
  ORDER.find({id_restaurant: data.id_restaurant}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json({"orders": docs});
        return;
    }
    res.status(200).json({
      "msn" : "No existe el recurso "
    });
});
});
/***********CODIGO MENU*************/
router.post('/save_menu', (req, res) => {
  var data=req.query;
  data['picture'] = "picture.jpg";
  data['registerdate'] = new Date();
  var newrest = new MENU(data);
  newrest.save().then( rr => {
    res.status(200).json({
      "id": rr._id,
      "msn": "Menu agregado con exito"
    });
  });
});

router.get('/list_menu', (req, res) => {
  var data=req.query;
  MENU.find({id_restaurant: data.id_restaurant}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json({"menus": docs});
        return;
    }
    res.status(200).json({
      "msn" : "No existe el recurso "
    });
});
});

router.post('/upload', function(req, res, next) {
    res.status(200).json({ "msn": req.query });
    console.log(req);
    /*for(var x=0;x<req.files.length;x++) {
        //copiamos el archivo a la carpeta definitiva de fotos
       fs.createReadStream('./uploads/'+req.files[x].filename).pipe(fs.createWriteStream('./public/menu/'+req.files[x].originalname)); 
       //borramos el archivo temporal creado
       fs.unlink('./uploads/'+req.files[x].filename); 
    }  
    var pagina='<!doctype html><html><head></head><body>'+
               '<p>Se subieron las fotos</p>'+
               '<br><a href="/">Retornar</a></body></html>';
      res.send(pagina);*/        
});