//Importamos las librerias que serán necesarias
const express = require('express');
const router = express.Router();
const http = require('http');
var mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret_key = process.env.SECRET_KEY || "prew";

require('dotenv').config();
const servidor = process.env.HOST;
const usuario = process.env.USER;
const clave = process.env.PASSWORD;
const baseDatos = process.env.DATABASE;

//Creamos la conexión a la base de datos¨
var mysql = require("mysql");

console.log(process.env.HOST);

var con = mysql.createPool({
    host:"localhost",
    user: "root",
    password:"",
    database:"proyectosemsoft",
    insecureAuth:true,
    multipleStatements:true
});



//APIs CRUD para mantenimiento de Vehiculos
router.get('/get_agenda', (req, res, next) => {
    var query = 'select * from agenda';
    con.query(query, (err, result, field) => {
       if(err){
           next(err);
       } else {
           res.status(200).json(result)
       }
      });
});

router.get('/get_agenda', (req, res, next) => {
    var query = 'select * from agenda where idagenda = ?';
    var values = [req.query.idagenda];

    con.query(query, values, (err, result, field) => {
       if(err){
           next(err);
       } else {
           res.status(200).json(result)
       }
      });
});

router.post('/insert_agenda', (req, res, next) => {
    var query = 'INSERT INTO agenda (idagenda, fecha, actividad, descripcion) values (?, ?, ?, ?)';
    var values = [req.body.idagenda,
                  req.body.fecha,
                  req.body.actividad,
                  req.body.descripcion];

    con.query(query, values, (err, result, field) => {
       if(err){
           next(err);
       } else {
           res.status(200).json(result)
       }
      });
});

router.put('/update_agenda', (req, res, next) => {
    var query = 'Update agenda set fecha=?, actividad=?, descripcion=?  WHERE idagenda = ?';
    
    var values = [req.body.fecha,
                  req.body.actividad,
                  req.body.descripcion,
                  req.body.idagenda];

    con.query(query, values, (err, result, field) => {
       if(err){
           next(err);
       } else {
           res.status(200).json(result)
       }
      });
});

router.delete('/delete_agenda', (req, res, next) => {
    var query = 'delete from proyectosemsoft.agenda where idagenda = ?';
    
    var values = [req.query.idagenda];

    con.query(query, values, (err, result, field) => {
       if(err){
           next(err);
       } else {
           res.status(200).json(result)
       }
      });
});

//APIs para Manejo de usuarios

router.get('/get_usuarios', (req, res, next) => {
    var query = 'select * from usuarios';
    con.query(query, (err, result, fields) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json(result);
        }
    });
});

router.post('/insert_usuario', (req, res, next) => {
    var user = {
        username: req.body.username,
        password: req.body.password
    };
    const create_user = (user) => {
        var query = "INSERT INTO usuarios (username, password) VALUES (?) ";
        con.query(query, [Object.values(user)], (err, result, fields) => {
            if (err) {
                console.log(err);
                res.status(500).send();
            } else {
                res.status(200).send();
            }
        });
    };
    bcrypt.hash(user.password, 10).then((hashedPassword) => {
        user.password = hashedPassword;
        create_user(user);
    });
});

router.post('/login', (req,res,next) =>{
    var user = {
        username: req.body.username,
        password: req.body.password
    };
    const get_token = (user) => {
        var query = "SELECT USERNAME, PASSWORD FROM usuarios WHERE username = ?"
        con.query(query, [user.username], (err, result, fields) => {
            if (err || result.length == 0) {
                console.log(err);
                res.status(400).json({message:"Usuario o Contraseña Incorrectos"});
            } else {
                bcrypt.compare(user.password,result[0].PASSWORD, (error, isMatch)=> {
                    if (isMatch){
                        var token = jwt.sign({userId: result[0].id}, secret_key);
                        res.status(200).json({token});
                    }else if (error){
                        res.status(400).json(error);
                    }else {
                        res.status(400).json({message: "Usuario o Contraseña Incorrectos"});
                    }
                });
            }
        });
    }
    get_token(user);

});


module.exports = router;