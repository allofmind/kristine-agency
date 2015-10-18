module.exports = function (options) {

  var fs = require("fs");
  var path = require("path");

  var express = require("express");
  var sequelize = require("sequelize");
  var multiparty = require("multiparty");
  
  var Router = express.Router;
  var Form =  multiparty.Form;
  
  var events = new Router();

  var database = options.database;
  
  var Event = database.define("event", {
    title: sequelize.STRING,
    date: sequelize.DATE,
    address: sequelize.STRING,
    posterUrl: sequelize.STRING,
    about: sequelize.STRING(1500),
    show: {
      type: sequelize.BOOLEAN,
      defaultValue: false
    }
  });

  events.post("/events", function (req, res) {
    var form = new Form();
    var result = { };
    form.on("field", function (name, value) {
      result[name] = value;
    });
    form.on("part", function (part) {
      var fileId = Date.now();
      var filePath = path.join("files/posters/", fileId.toString() + "-" + part.filename);
      result[part.name] = filePath;
      part.pipe(fs.createWriteStream(filePath));
    });
    form.on("close", function () {
      // Event.sync({ force: true }).then(function () {
      Event.create(result).then(function (event) {
        res.json(event);
      });
      // });
    });
    form.parse(req);
  });

  events.get("/events", function (req, res) {
    Event.all().then(function (eventsData) {
      res.json(eventsData);
    });
  });

  events.put("/events/:id", function (req, res) {
    Event.update({
      show: req.body.show
    },
    {
      where: {
        id: req.params.id
      }
    }).then(function (ids) {
      res.json(ids);
    });
  });

  return events;

};