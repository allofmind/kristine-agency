var http = require("http");

var express = require("express");
var serveFavicon = require("serve-favicon");

var app = express();

app.set("port", (process.env.PORT || 5000));

app.use(serveFavicon(__dirname + "/favicon.ico"));

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("*", function (req, res) {
  res.writeHead(500);
  res.end("Error loading " + req.url);
})

app.listen(app.get("port"), function() {
  console.log("Node app is running on port", app.get("port"));
});