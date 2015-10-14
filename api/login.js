var express = require("express");
var pg = require("pg");
var io = require("io");
var config = require("../config.js");

var Router = express.Router;

var api = new Router();

/*
  Error codes:
    401:
      0 - User is not defined;
      1 - Unauthorised;
    404:
      0 - User id is not defined, logout is impossible;
*/
api.post("/manager/auth/login", function (req, res) {
  var authData = req.body;
  pg.connect(config.DATABASE_URL, function(connectError, client, userDone) {
    if (connectError) {
      userDone();
      var connectErrorMessage = __filename + "::" + __line +  "\n" + connectError.toString();
      io.write(connectErrorMessage, "red");
      res.status(401)
         .json({
           code: 0,
           message: connectErrorMessage
         });
    }
    else {
      client.query("SELECT * FROM managers WHERE email = '" + authData.email + "' AND password = '" + authData.password + "'", function(selectError, selectResult) {
        if (selectError) {
          userDone();
          var selectErrorMessage = __filename + "::" + __line +  "\n" + selectError.toString();
          io.write(selectErrorMessage, "red");
          res.status(401)
             .json({
               code: 0,
               message: selectErrorMessage
             });
        }
        else {
          var userInfo = selectResult.rows.shift();
          if (userInfo) {
            var newToken = (new Date()).getTime().toString();
            client.query("UPDATE managers SET token = '" + newToken + "' WHERE id = " + userInfo.id, function(updateError, updateResult) {
              userDone();
              if (updateError) {
                var updateErrorMessage = __filename + "::" + __line +  "\n" + updateError.toString();
                io.write(updateErrorMessage, "red");
                res.status(401)
                   .json({
                     code: 0,
                     message: updateErrorMessage
                   });
              }
              else {
                res.json({
                  id: userInfo.id,
                  email: userInfo.email,
                  token: newToken
                });
              }
            });
          }
          else {
            userDone();
            res.status(404)
               .json({
                 code: 0
               });
          }
        }
      });
    }
  });
});


api.get("/manager/auth/logout", function (req, res) {
  pg.connect(config.DATABASE_URL, function(connectError, client, userDone) {
    if (connectError) {
      userDone();
      var connectErrorMessage = __filename + "::" + __line +  "\n" + connectError.toString();
      io.write(connectErrorMessage, "red");
      res.status(401)
         .json({
           code: 1,
           message: connectErrorMessage
         });
    }
    else {
      var userId = req.headers["user-id"];
      console.log(userId);
      if (userId) {
        client.query("UPDATE managers SET token = 'none' WHERE id = " + userId, function(logoutError, updateResult) {
          userDone();
          if (logoutError) {
            var logoutErrorMessage = __filename + "::" + __line +  "\n" + logoutError.toString();
            io.write(logoutErrorMessage, "red");
            res.status(401)
               .json({
                 code: 0,
                 message: logoutErrorMessage
               });
          }
          else {
            res.end();
          }
        });
      }
      else {
        userDone();
        res.status(404)
           .json({
             code: 0
           });
      }
    }
  });
});

function verification (req, res, next) {
  pg.connect(config.DATABASE_URL, function(connectError, client, userDone) {
    if (connectError) {
      userDone();
      var connectErrorMessage = __filename + "::" + __line +  "\n" + connectError.toString();
      io.write(connectErrorMessage, "red");
      res.status(401)
         .json({
           code: 1,
           message: connectErrorMessage
         });
    }
    else {
      var userId = req.headers["user-id"];
      var userToken = req.headers["user-token"];
      if (userId && userToken) {
        client.query("SELECT EXISTS (SELECT 1 FROM managers WHERE id = '" + userId + "' AND token = '" + userToken + "')", function(existError, existResult) {
          userDone();
          if (existError) {
            var existErrorMessage = __filename + "::" + __line +  "\n" + existError.toString();
            io.write(existErrorMessage, "red");
            res.status(401)
               .json({
                 code: 1,
                 message: existErrorMessage
               });
          }
          else {
            var userExist = existResult.rows.shift();
            if (userExist.exists) {
              next();
            }
            else {
              res.status(401)
                 .json({
                   code: 1
                 });
            }
          }
        });
      }
      else {
        userDone();
        res.status(401)
           .json({
             code: 1
           });
      }
    }
  });
};

module.exports = {
  verification: verification,
  api: api
};