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
    lastName: sequelize.STRING,
    gender: sequelize.STRING,
    phone: sequelize.STRING,
    email: sequelize.STRING,
    birthday: sequelize.DATE,
    height: sequelize.STRING,
    weight: sequelize.STRING,
    eyeСolor: sequelize.STRING,
    badHabits: sequelize.STRING,
    aboutMe: sequelize.STRING
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
      reviewForm[name] = value;
    });
    form.on("part", function (part) {
      var fileSize = part.byteCount;
      if (fileSize < 5 * 1024 * 1024) {
        var fieldName = part.name;
        var pathToSave = path.join("files/photos/users/", part.filename);
        reviewForm[fieldName] = pathToSave;
        var writeStream = fs.createWriteStream(pathToSave);
        part.pipe(writeStream);
      }
    });
    form.on("close", function (part) {
      res.json(reviewForm);
      SecondHalfReviewForm.sync().then(function () {
        return SecondHalfReviewForm.create(reviewForm);
      });
      // .then(function (secondHalfReviewForm) {
      //   console.log(secondHalfReviewForm.get({ plain: true }));
      // });
    });
    form.parse(req);
  });

  secondHalf.get("/client/second-half/review-forms", function (req, res) {
    SecondHalfReviewForm.all().then(function (allSecondHalfReviewForms) {
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

  return secondHalf;
};