requirejs.config({
  map: {
    "*": {
      "text": "libraries/text",
      "css": "libraries/css"
    }
  },
  shim: {
    "libraries/backbone-min": {
      deps: [ "libraries/underscore-min", "libraries/jquery-2.1.4.min", "libraries/TweenMax.min.js", "libraries/view-loader-0.0.1.js" ],
      exports: "Backbone"
    },
    "libraries/underscore-min": {
      exports: "_"
    },
    "libraries/jquery.mobile.custom.js": {
      deps: [ "libraries/jquery-2.1.4.min" ],
      exports: "$"
    },
    "libraries/view-loader-0.0.1.js": {
      exports: "viewLoader"
    }
  },
  waitSeconds: 50
});

require([ "libraries/view-loader-0.0.1.js", "libraries/backbone-min"  ], function (
  ViewLoader
) {

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
      if (this.active === false) {
        this.active = true;
        TweenMax.to(this.$el, 0.6, { fontSize: 120 });
      }
      else if (typeof this.active === "undefined") {
        this.active = true;
        TweenMax.set(this.$el, { fontSize: 120 });
      }
    },
    setDeactive: function () {
      if (this.active === true) {
        this.active = false;
        TweenMax.to(this.$el, 0.6, { fontSize: 72 });
      }
      else if (typeof this.active === "undefined") {
        this.active = false;
        TweenMax.set(this.$el, { fontSize: 72 });
      }
    }
  });

  var mainHeaderView = new MainHeaderView();

  var viewLoader = new ViewLoader(
    {
      request: function(url, callback) {
        require([ url ], function (data) {
          callback(data);
        });
      },
      initialization: function(Module, params) {
        return new Module(params);
      },
      moduleInsert: function(module, selector, parentModule) {
        if (parentModule) {
          parentModule.find(selector).append(module.$el);
        }
        else {
          $("body").find(selector).append(module.$el);
        }
      },
      loaderInsert: function($parentContainer, $loader) {
        $parentContainer.append($loader);
      },
      update: function(module, params) {
        module.render(params);
      },
      destroy: function(module) {
        module.remove();
      }
    }, [
      {
        group: "user",
        selector: "#main-section",
        getContainer: function () { return $("<main/>", { class: "main-container" }); },
        animation: {
          handler: {
            simpleShow: function (view, done) {
              TweenMax.fromTo(view.$el, 0.6, { opacity: 0 }, { opacity: 1, onComplete: function () { done(); } });
            },
            simpleHide: function (view, done) {
              TweenMax.fromTo(view.$el, 0.6, { opacity: 1 }, { opacity: 0, onComplete: function () { view.remove(); done(); } });
            }
          },
          order: {
            come: 0,
            leave: 1
          }
        },
        loaderConfiguration: {
          getElement: function () { return new MainLoader() },
          canceledBeforeTime: 60,
          animation: {
            come: function (loader, done) { },
            leaving: function (loader, done) { }
          }
        },
        module: [
          {
            name: "about",
            path: "views/about/main",
            priority: "00"
          }, {
            name: "service",
            path: "views/service/main",
            priority: "01"
          }
        ]
      }
    ]
  );

  var Router = Backbone.Router.extend({
    routes: {
      "": function (params) {
        mainHeaderView.setActive();
        viewLoader.downloadModule([ ]);
      },
      "about": function (params) {
        mainHeaderView.setDeactive();
        viewLoader.downloadModule({
          "user:about": params
        });
      },
      "service": function (params) {
        mainHeaderView.setDeactive();
        viewLoader.downloadModule({
          "user:service": params
        });
      }
    }
  });

  new Router();

  Backbone.history.start();

  new MainView();

  });

});