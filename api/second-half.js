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
    mainPhotoUrl: sequelize.STRING,
    firstName: sequelize.STRING,
    gender: sequelize.FLOAT,
    birthday: {
      type: sequelize.DATE,
      defaultValue: sequelize.NOW
    },
    email: sequelize.STRING,
    phone: sequelize.STRING,
    looking: sequelize.FLOAT,
    intention: sequelize.FLOAT,
    height: sequelize.FLOAT,
    weight: sequelize.FLOAT,
    eye: sequelize.FLOAT,
    work: sequelize.FLOAT,
    smoke: sequelize.FLOAT,
    drink: sequelize.FLOAT,
    about: sequelize.STRING(1000),
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
        reviewForm.mainPhotoUrl = pathToSave;
        var writeStream = fs.createWriteStream(pathToSave);
        part.pipe(writeStream);
      }
    });
    form.on("close", function () {
      SecondHalfReviewForm.create(reviewForm).then(function (form) {
        res.json(form);
      });
    });
    form.parse(req);
  });

  secondHalf.get("/server/second-half/review-forms", function (req, res) {
    SecondHalfReviewForm.findAll(req.query).then(function (allSecondHalfReviewForms) {
      res.json(allSecondHalfReviewForms);
    });
  });

  secondHalf.get("/client/second-half/review-forms", function (req, res) {
    var attributes = [ "mainPhotoUrl", "firstName", "gender", "birthday", "looking", "intention", "height", "weight", "eye", "work", "smoke", "drink", "about" ];
    SecondHalfReviewForm.findAll({
      attributes: attributes,
      where: req.query.where
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