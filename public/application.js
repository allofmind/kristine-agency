requirejs.config({
  map: {
    "*": {
      "text": "libraries/text",
      "css": "libraries/css"
    }
  },
  shim: {
    "libraries/backbone-min": {
      deps: [ "libraries/underscore-min", "libraries/jquery-2.1.4.min", "libraries/TweenMax.min.js", "libraries/jquery-ui.js" ],
      exports: "Backbone"
    },
    "libraries/underscore-min": {
      exports: "_"
    },
    "libraries/jquery-ui.js": {
      deps: [ "libraries/jquery-2.1.4.min" ]
    }
  },
  waitSeconds: 50
});

require([ "libraries/backbone-min" ], function () {

  $(function () {

  var MainView = Backbone.View.extend({
    el: $("main"),
    initialize: function () {
      var mainView = this;
      TweenMax.to(mainView.$el, 0.6, {
        onStart: function () {
          mainView.$el.css({ display: "block" });
        },
        opacity: 1
      });
    }
  });

  var MainHeaderView = Backbone.View.extend({
    el: $("#main-header #name a"),
    setActive: function () {
      var mainHeaderView = this;
      if (this.activeView === false) {
        this.activeView = true;
        TweenMax.to(this.$el, 0.6, { fontSize: 120 });
      }
      else if (typeof this.activeView === "undefined") {
        this.activeView = true;
        TweenMax.set(this.$el, { fontSize: 120 });
      }
    },
    setDeactive: function () {
      if (this.activeView === true) {
        this.activeView = false;
        TweenMax.to(this.$el, 0.6, { fontSize: 72 });
      }
      else if (typeof this.activeView === "undefined") {
        this.activeView = false;
        TweenMax.set(this.$el, { fontSize: 72 });
      }
    }
  });

  var mainHeaderView = new MainHeaderView();

  var Router = Backbone.Router.extend({
    routes: {
      "": function (params) {
        var router = this;
        mainHeaderView.setActive();
        if (this.activeViewLvl1) {
          router.activeViewLvl1Name = "";
          TweenMax.to(this.activeViewLvl1.$el, 0.6, {
            opacity: 0,
            onComplete: function () { router.activeViewLvl1.remove(); }
          });
        }
      },
      "about": function (params) {
        this.mainLoader({
          viewName: "about",
          viewPath: "views/about/main"
        });
      },
      "service": function () {
        this.mainLoader({
          viewName: "service",
          viewPath: "views/service/main"
        });
      },
      "service/find-love": function (params) {
        var router = this;
        this.mainLoader({
          viewName: "service",
          viewPath: "views/service/main"
        }, function () {
          require([ "views/service/find-love/main" ], function (FindLove) {
            var findLove = router.findLove = new FindLove();
            $("body").append(findLove.$el);
          });
        });
      },
      "woman": function (params) {
        this.mainLoader({
          viewName: "woman",
          viewPath: "views/woman/main"
        });
      },
      "woman/search": function (params) {
        var router = this;
        this.mainLoader({
          viewName: "woman",
          viewPath: "views/woman/main"
        }, function (parentView) {
          if (!router.womanSearch) {
            require([ "views/woman/search/main" ], function (WomanSearch) {
              router.womanSearch = new WomanSearch();
              parentView.searchView = router.womanSearch;
              parentView.$el.find("#search-filter-container").append(parentView.searchView.$el);
              router.womanSearch.open();
            });
          }
          else {
            parentView.$el.find("#search-filter-container").append(parentView.searchView.$el);
            router.womanSearch.open();
          }
        });
      },
      "man": function (params) {
        this.mainLoader({
          viewName: "man",
          viewPath: "views/man/main"
        });
      },
      "events": function (params) {
        this.mainLoader({
          viewName: "events",
          viewPath: "views/events/main"
        });
      },
      "contacts": function (params) {
        this.mainLoader({
          viewName: "contacts",
          viewPath: "views/contacts/main"
        });
      }
    },
    "mainLoader": function (params, callback) {
      var router = this;
      if (router.activeViewLvl1Name !== params.viewName) {
        mainHeaderView.setDeactive();
        router.activeViewLvl1Name = params.viewName;
        require([ params.viewPath ], function (module) {
          if (router.activeViewLvl1) {
            var prevActive = router.activeViewLvl1;
            TweenMax.set(prevActive.$el, { position: "absolute" });
            TweenMax.to(prevActive.$el, 0.6, {
              opacity: 0,
              onComplete: function () { prevActive.remove(); }
            });
          }
          var view = module();
          router.activeViewLvl1 = view;
          TweenMax.fromTo(view.$el, 0.6, { opacity: 0 }, {
            opacity: 1
          });
          $("#main-section").append(view.$el);
          if (callback) callback(view);
        });
      }
      else {
        if (callback) callback(router.activeViewLvl1);
      }
    },
    initialize: function () {
      var router = this;
      this.on("all", function () {
        if (router.findLove && router.fragment !== "service/find-love") {
          router.findLove.close();
        }
      });
    }
  });

  new Router();

  Backbone.history.start();

  new MainView();

  });

});