module.exports = function (options) {
  var fs = require("fs");
  var express = require("express");
  var sequelize = require("sequelize");
  var path = require("path");
  var io = require("io");
  var multiparty = require("multiparty");
  var config = require("../config.js");

  var sequelizeDatabase = options.database;

  var SecondHalfReviewForm = sequelizeDatabase.define("second-half-review-form", {
    mainPhotoUrl: {
      type: sequelize.STRING,
      defaultValue: null
    },
    firstName: {
      type: sequelize.STRING,
      defaultValue: null
    },
    lastName: {
      type: sequelize.STRING,
      defaultValue: null
    },
    gender: {
      type: sequelize.FLOAT,
      defaultValue: null
    },
    phone: {
      type: sequelize.STRING,
      unique: true,
      defaultValue: null
    },
    email: {
      type: sequelize.STRING,
      unique: true,
      defaultValue: null,
      validate: {
        isEmail: true
      }
    },
    birthday: {
      type: sequelize.DATE,
      defaultValue: sequelize.NOW
    },
    height: {
      type: sequelize.FLOAT,
      defaultValue: null
    },
    weight: {
      type: sequelize.FLOAT,
      defaultValue: null
    },
    eyeСolor: {
      type: sequelize.FLOAT,
      defaultValue: null
    },
    smoke: {
      type: sequelize.FLOAT,
      defaultValue: null
    },
    aboutMe: {
      type: sequelize.STRING(1000),
      defaultValue: null
    },
    accepted: {
      type: sequelize.FLOAT,
      defaultValue: 0
    }
  });
  
  var Router = express.Router;
  
  var secondHalf = new Router();


  /*
    Error codes:
      -
  */
  secondHalf.post("/client/second-half/review-forms", function (req, res) {
    var form = new multiparty.Form();
    var reviewForm = { };
    form.on("field", function (name, value) {
      if (value) reviewForm[name] = value;
    });
    form.on("part", function (part) {
      var fileSize = part.byteCount;
      if (fileSize < 15 * 1024 * 1024) {
        var fieldName = part.name;
        var fileName = part.filename;
        var mainPhotoId = (new Date()).getTime().toString();
        var pathToSave = path.join("files/photos/users/", mainPhotoId + "-" + fileName);
        reviewForm[fieldName] = pathToSave;
        var writeStream = fs.createWriteStream(pathToSave);
        part.pipe(writeStream);
      }
    });
    form.on("close", function (part) {
      SecondHalfReviewForm.sync().then(function () {
        res.end();
        return SecondHalfReviewForm.create(reviewForm);
      });
    });
    form.parse(req);
  });

  secondHalf.get("/client/second-half/review-forms", function (req, res) {
    var where = req.query.where ? JSON.parse(req.query.where) : { };
    SecondHalfReviewForm.findAll({
      where: where
    }).then(function (allSecondHalfReviewForms) {
      res.json(allSecondHalfReviewForms);
    });
  });

  secondHalf.delete("/client/second-half/review-forms/:id", function (req, res) {
    var reviewFormId = req.params.id;
    SecondHalfReviewForm.destroy({ 
      where: {
        id: reviewFormId
      }
    }).then(function (reviewForms) {
      res.json(reviewForms);
    });
  });

  secondHalf.put("/client/second-half/review-forms/:id", function (req, res) {
    SecondHalfReviewForm.update({
      accepted: req.body.accepted
    }, {
      where: {
        id: req.body.id
      }
    }).then(function (reviewForms) {
      res.json(reviewForms);
    });;
  });

  return secondHalf;
};