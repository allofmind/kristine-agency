requirejs.config({
  map: {
    "*": {
      "text": "libraries/text",
      "css": "libraries/css"
    }
  },
  shim: {
    "global/user": {
      deps: [ "libraries/jquery-2.1.4.min" ]
    },
    "libraries/backbone-min": {
      deps: [ "libraries/underscore-min", "libraries/jquery-2.1.4.min", "libraries/TweenMax.min.js" ],
      exports: "Backbone"
    },
    "libraries/underscore-min": {
      exports: "_"
    },
    "libraries/jquery.mobile.custom.js": {
      deps: [ "libraries/jquery-2.1.4.min" ],
      exports: "$"
    }
  },
  waitSeconds: 50
});


require([
  "libraries/backbone-min",
  "global/user"
], function (
  backbone,
  user
) {

  $.ajaxSetup({
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      var statusCode = XMLHttpRequest.status;
      var error = JSON.parse(XMLHttpRequest.responseText);
      if (statusCode === 401 && error.code === 1) {
        user.logout();
        var fragment = Backbone.history.fragment;
        if (fragment !== "login") {
          Backbone.history.navigate("#/login");
        }
      }
    }
  });

  var Router = Backbone.Router.extend({
    routes: {
      "": function () {
        var router = this;
        this.mainLoader(function () {
          if (router.activeLvl2ViewName !== "meet-page") {
            router.activeLvl1V2ewName = "meet-page";
            require([ "views/manager/meet-page/main" ], function (MeetPage) {
              new MeetPage();
            });
          }
        });
      },
      "login": function () {
        var router = this;
        if (router.activeLvl1ViewName !== "login") {
          router.activeLvl1ViewName = "login";
          require([ "views/login/main" ], function (Login) {
            new Login();
          });
        }
      },
      "other-half": function () {
        this.navigate("#/other-half/forms-to-review");
      },
      "other-half/forms-to-review": function () {
        var router = this;
        this.otherHalfLoader(function () {
          if (router.activeLvl1OtherHalfViewName !== "forms-to-review") {
            router.activeLvl1OtherHalfViewName = "forms-to-review";
            require([ "views/manager/other-half/forms-to-review/main" ], function (FormsToReview) {
              var formsToReview = new FormsToReview();
              // $("#main-left-bar a.item[href=\"#/other-half\"]").addClass("active");
            });
          }
        });
      },
      "*All": function () { }
    },
    "mainLoader": function (callback) {
      var router = this;
      if (router.activeLvl1ViewName !== "manager") {
        router.activeLvl1ViewName = "manager";
        require([ "views/manager/main" ], function (Manager) {
          new Manager();
          if (callback) callback();
        });
      }
      else {
        if (callback) callback();
      }
    },
    "otherHalfLoader": function (callback) {
      var router = this;
      this.mainLoader(function () {
        if (router.activeLvl2ViewName !== "other-half") {
          router.activeLvl2ViewName = "other-half";
          require([ "views/manager/other-half/main" ], function (OtherHalf) {
            new OtherHalf();
            $("#main-left-bar a.item[href=\"#/other-half\"]").addClass("active");
            if (callback) callback();
          });
        }
        else {
          if (callback) callback();
        }
      });
    },
    execute: function (callback, args) {
      var router = this;
      if (Backbone.history.fragment !== "login" && !user.isLogin()) {
        router.navigate("#/login");
        return false;
      }
      else if (Backbone.history.fragment === "login" && user.isLogin()) {
        history.back();
        return false;
      } else {
        if (callback) {
          callback.apply(this, args);
        }
      }
    }
  });

  new Router();

  Backbone.history.start();

});