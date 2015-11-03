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

  var paramsHandler = function (a) {
    var prefix, s, add, name, r20, output;
    s = [];
    r20 = /%20/g;
    add = function (key, value) {
      value = (typeof value == "function") ? value() : (value == null ? "" : value);
      s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
    };
    if (a instanceof Array) {
      for (name in a) {
        add(name, a[name]);
      }
    } else {
      for (prefix in a) {
        paramsHandler.buildParams(prefix, a[prefix], add);
      }
    }
    output = s.join("&");
    return output;
  };
  paramsHandler.buildParams = function (prefix, obj, add) {
    var name, i, l, rbracket;
    rbracket = /\[\]$/;
    if (obj instanceof Array) {
      for (i = 0, l = obj.length; i < l; i++) {
        if (rbracket.test(prefix)) {
          add(prefix, obj[i]);
        } else {
          paramsHandler.buildParams(prefix + "[" + (typeof obj[i] === "object" ? i : "") + "]", obj[i], add);
        }
      }
    } else if (typeof obj == "object") {
      for (name in obj) {
        paramsHandler.buildParams(prefix + "[" + name + "]", obj[name], add);
      }
    } else {
      add(prefix, obj);
    }
  };

  var queryHandler = function(query) {
    var nvp = query.split("&");
    var data = {};
    for( var i = 0 ; i < nvp.length ; i++ ){
      var pair = nvp[i].split("=");
      var name = decodeURIComponent(pair[0]);
      var value = decodeURIComponent(pair[1]);
      var path = name.match(/(^[^\[]+)(\[.*\]$)?/);
      var first = path[1];
      if(path[2]){
        path = path[2].match(/(?=\[(.*)\]$)/)[1].split("][")
      }else{
        path = [];
      }
      path.unshift(first);
      queryHandler.setValue(data, path, value);
    }
    return data;
  };
  queryHandler.setValue = function(root, path, value){
    if(path.length > 1){
      var dir = path.shift();
      if( typeof root[dir] == "undefined" ){
        root[dir] = path[0] == "" ? [] : {};
      }
      arguments.callee(root[dir], path, value);
    }
    else {
      if(root instanceof Array){
        root.push(value);
      }else{
        root[path] = value;
      }
    }
  };

  jQuery.extend({
    param: paramsHandler,
    query: queryHandler
  });

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
        }, function (AboutView) {
          return new AboutView();
        });
      },
      "service": function () {
        this.mainLoader({
          viewName: "service",
          viewPath: "views/service/main"
        }, function (ServiceView) {
          return new ServiceView();
        });
      },
      "service/find-love": function (params) {
        var router = this;
        this.mainLoader({
          viewName: "service",
          viewPath: "views/service/main"
        }, function (ServiceView) {
          var serviceView = new ServiceView();
          require([ "views/service/find-love/main" ], function (FindLove) {
            var findLove = router.findLove = new FindLove();
            $("body").append(findLove.$el);
          });
          return serviceView;
        }, function (serviceView) {
          require([ "views/service/find-love/main" ], function (FindLove) {
            var findLove = router.findLove = new FindLove();
            $("body").append(findLove.$el);
          });
        });
      },
      "woman": function () {
        this.mainLoader({
          viewName: "woman",
          viewPath: "views/woman/main"
        }, function (WomanView) {
          var womanView = new WomanView();
          womanView.render({
            where: {
              accepted: 2,
              gender: 1
            }
          });
          womanView.searchFormView.closed();
          return womanView;
        }, function (womanView) {
          womanView.searchFormView.close();
          womanView.render({
            where: {
              accepted: 2,
              gender: 1
            }
          });
        });
      },
      "woman/find-id/:id": function (id) {
        this.mainLoader({
          viewName: "woman",
          viewPath: "views/woman/main"
        }, function (WomanView) {
          var womanView = new WomanView();
          womanView.render({
            where: {
              accepted: 2,
              gender: 1,
              id: id
            }
          });
          womanView.searchFormView.closed();
          return womanView;
        }, function (womanView) {
          womanView.searchFormView.close();
          womanView.render({
            where: {
              accepted: 2,
              gender: 1,
              id: id
            }
          });
        });
      },
      "woman/find-params": function (queryString) {
        var query = $.query(queryString);
        query.accepted = 2;
        query.gender = 1;
        this.mainLoader({
          viewName: "woman",
          viewPath: "views/woman/main"
        }, function (WomanView) {
          var womanView = new WomanView();
          womanView.searchFormView.opened();
          womanView.render({ where: query });
          return womanView;
        }, function (womanView) {
          womanView.searchFormView.open();
          womanView.render({
            where: query
          });
        });
      },
      "man": function () {
        this.mainLoader({
          viewName: "man",
          viewPath: "views/man/main"
        }, function (ManView) {
          var manView = new ManView();
          manView.render({
            where: {
              accepted: 2,
              gender: 0
            }
          });
          manView.searchFormView.closed();
          return manView;
        }, function (manView) {
          manView.searchFormView.close();
          manView.render({
            where: {
              accepted: 2,
              gender: 0
            }
          });
        });
      },
      "man/find-id/:id": function (id) {
        this.mainLoader({
          viewName: "man",
          viewPath: "views/man/main"
        }, function (ManView) {
          var manView = new ManView();
          manView.render({
            where: {
              accepted: 2,
              gender: 0,
              id: id
            }
          });
          manView.searchFormView.closed();
          return manView;
        }, function (manView) {
          manView.searchFormView.close();
          manView.render({
            where: {
              accepted: 2,
              gender: 0,
              id: id
            }
          });
        });
      },
      "man/find-params": function (queryString) {
        var query = $.query(queryString);
        query.accepted = 2;
        query.gender = 0;
        this.mainLoader({
          viewName: "man",
          viewPath: "views/man/main"
        }, function (ManView) {
          var manView = new manView();
          manView.searchFormView.opened();
          manView.render({ where: query });
          return manView;
        }, function (manView) {
          manView.searchFormView.open();
          manView.render({
            where: query
          });
        });
      },
      "events": function (params) {
        this.mainLoader({
          viewName: "events",
          viewPath: "views/events/main"
        }, function (EventsView) {
          return new EventsView();
        });
      },
      "contacts": function (params) {
        this.mainLoader({
          viewName: "contacts",
          viewPath: "views/contacts/main"
        }, function (ContactsView) {
          return new ContactsView();
        });
      }
    },
    "mainLoader": function (params, callback, update) {
      var router = this;
      if (router.activeViewLvl1Name !== params.viewName) {
        mainHeaderView.setDeactive();
        router.activeViewLvl1Name = params.viewName;
        require([ params.viewPath ], function (Module) {
          if (router.activeViewLvl1) {
            var prevActive = router.activeViewLvl1;
            TweenMax.set(prevActive.$el, { position: "absolute" });
            TweenMax.to(prevActive.$el, 0.6, {
              opacity: 0,
              onComplete: function () { prevActive.remove(); }
            });
          }
          var View = Module();
          var view = callback(View);
          router.activeViewLvl1 = view;
          TweenMax.fromTo(view.$el, 0.6, { opacity: 0 }, {
            opacity: 1
          });
          $("#main-section").append(view.$el);
        });
      }
      else {
        if (update) update(router.activeViewLvl1);
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