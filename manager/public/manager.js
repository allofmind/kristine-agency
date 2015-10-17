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
            router.activeLvl2ViewName = "meet-page";
            require([ "views/manager/meet-page/main" ], function (MeetPage) {
              if (router.activeLvl2ViewName = "meet-page") {
                router.activeLvl2View = new MeetPage();
              }
            });
          }
        });
      },
      "login": function () {
        var router = this;
        if (router.activeLvl1ViewName !== "login") {
          router.activeLvl1ViewName = "login";
          require([ "views/login/main" ], function (Login) {
            if (router.activeLvl1ViewName === "login") {
              router.activeLvl1View = new Login();
            }
          });
        }
      },
      "other-half": function () {
        this.navigate("#/other-half/new");
      },
      "other-half/new": function () {
        this.otherHalfFormList([ 0 ]);
      },
      "other-half/accepted": function () {
        this.otherHalfFormList([ 2 ]);
      },
      "other-half/denied": function () {
        this.otherHalfFormList([ 1 ]);
      },
      "*All": function () { }
    },
    "mainLoader": function (callback) {
      var router = this;
      if (router.activeLvl1ViewName !== "manager") {
        router.activeLvl1ViewName = "manager";
        require([ "views/manager/main" ], function (Manager) {
          if (router.activeLvl1ViewName === "manager") {
            router.activeLvl1View = new Manager();
            if (callback) callback();
          }
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
            if (router.activeLvl2ViewName === "other-half") {
              router.activeLvl2View = new OtherHalf();
              if (callback) callback();
            }
          });
        }
        else {
          if (callback) callback();
        }
      });
    },
    "otherHalfFormList": function (filterValue) {
      var router = this;
      this.otherHalfLoader(function () {
        if (router.activeLvl1OtherHalfViewName !== "other-half/review-forms") {
          router.activeLvl1OtherHalfViewName = "other-half/review-forms";
          require([ "views/manager/other-half/review-forms/main" ], function (FormsToReview) {
            if (router.activeLvl1OtherHalfViewName === "other-half/review-forms") {
              var formsToReview = router.activeLvl1OtherHalfView = new FormsToReview({ acceptedFilterValue: filterValue });
            }
          });
        }
        else {
          router.activeLvl1OtherHalfView.update({ acceptedFilterValue: filterValue });
        }
      });
    },
    execute: function (callback, args) {
      var router = this;
      var hashLvl = location.hash.split("/").length;
      if (hashLvl < 1) {
        router.activeLvl2ViewName = "";
        if (router.activeLvl2View) router.activeLvl2View.remove();
      }
      if (hashLvl < 2) {
        router.activeLvl1OtherHalfViewName = "";
        if (router.activeLvl1OtherHalfView) router.activeLvl1OtherHalfView.remove();
      }
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