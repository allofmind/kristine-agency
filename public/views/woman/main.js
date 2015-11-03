define([
  "text!./main.html",
  "css!./main",
  "text!./form.html"
], function(
  template,
  style,
  formTemplate
) {

  return function (options) {

    var SearchFormModel = Backbone.Model.extend({
      defaults: {
        mainPhotoUrl: null,
        firstName: null,
        gender: null,
        birthday: null,
        looking: null,
        intention: null,
        height: null,
        weight: null,
        eye: null,
        work: null,
        smoke: null,
        drink: null,
        about: null
      }
    });

    var FormView = Backbone.View.extend({
      className: "form-profile clearfix",
      template: _.template(formTemplate),
      render: function () {
        this.$el.html(this.template(this.model.toJSON()));
      }
    });
  
    var FormsCollection = Backbone.Collection.extend({
      model: SearchFormModel,
      url: "/client/second-half/review-forms",
      comparator: function (current, next) {
        var currentCreatedAt = current.get("createdAt");
        var nextCreatedAt = next.get("createdAt");
        if (currentCreatedAt > nextCreatedAt) {
          return -1;
        }
        else {
          return 1;
        }
      },
      render: function (params) {
        var formsCollection = this;
        formsCollection.load();
        formsCollection.fetch({
          data: $.param(params),
          success: function (collection) {
            formsCollection.$collectionContainer.html("");
            collection.sort();
            if (collection.length > 0) {
              collection.each(function (formModel) {
                var formView = new FormView({ model: formModel });
                formView.render();
                formsCollection.$collectionContainer.append(formView.$el);
              });
              formsCollection.loaded();
            }
            else {
              formsCollection.notFound();
            }
          }
        });
      },
      notFound: function () {
        var formsCollection = this;
        TweenMax.fromTo(formsCollection.$notFound, 0.3, {
          opacity: 0
        }, {
          opacity: 1,
          onStart: function () {
            formsCollection.$notFound.css("display", "block");
          }
        });
        TweenMax.to(formsCollection.$loadFormScreen, 0.3, {
          opacity: 0,
          onComplete: function () {
            formsCollection.$loadFormScreen.css("display", "none");
          }
        });
      },
      load: function () {
        var formsCollection = this;
        TweenMax.to(formsCollection.$notFound, 0.3, {
          opacity: 0,
          onComplete: function () {
            formsCollection.$notFound.css("display", "none");
          }
        });
        TweenMax.to(formsCollection.$collectionContainer, 0.3, {
          opacity: 0,
          onComplete: function () {
            formsCollection.$collectionContainer.css("display", "none");
          }
        });
        TweenMax.fromTo(formsCollection.$loadFormScreen, 0.3, {
          opacity: 0
        }, {
          opacity: 1,
          onStart: function () {
            formsCollection.$loadFormScreen.css("display", "block");
          }
        });
      },
      loaded: function () {
        var formsCollection = this;
        TweenMax.fromTo(formsCollection.$collectionContainer, 0.3, {
          opacity: 0
        }, {
          opacity: 1,
          onStart: function () {
            formsCollection.$collectionContainer.css("display", "block");
          }
        });
        TweenMax.to(formsCollection.$loadFormScreen, 0.3, {
          opacity: 0,
          onComplete: function () {
            formsCollection.$loadFormScreen.css("display", "none");
          }
        });
      },
      initialize: function (options) {
        var formsCollection = this;
        formsCollection.$container = options.$container;
        formsCollection.$collectionContainer = formsCollection.$container.find("#forms-profile");
        formsCollection.$loadFormScreen = formsCollection.$container.find("#load-form-screen");
        formsCollection.$notFound = formsCollection.$container.find("#not-found");
      }
    });
  
    var formsCollection;

    var MainView = Backbone.View.extend({
      model: new SearchFormModel(),
      tagName: "article",
      id: "main-article-wrap",
      events: {
        "input input[name=\"user-id\"]": function (event) {
          this.model.set("id", event.target.value);
        },
        "click #find-by-id": function () {
          var mainView = this;
          if (this.model.get("id")) {
            Backbone.history.navigate("#/woman/find-id/" + this.model.get("id"));
          }
          else {
            Backbone.history.navigate("#/woman");
          }
          // if (Backbone.history.fragment.indexOf("woman/search") === -1) {
          //   Backbone.history.navigate("#/woman/search");
          // }
          // else {
          //   Backbone.history.navigate("#/woman");
          //   mainView.searchView.close();
          // }
        },
        "click #find-by-params": function () {
          var mainView = this;
          var currentUrl = Backbone.history.fragment;
          if (currentUrl === "woman" || currentUrl.indexOf("woman/find-id/") !== -1) {
            // this.joinedToFindFrom = Backbone.history.fragment;
            var query = { };
            _.each(this.searchFormView.model.toJSON(), function (value, prop) {
              if (value) query[prop] = value;
            });
            Backbone.history.navigate("#/woman/find-params?" + $.param(query));
          }
          else {
            Backbone.history.navigate("#/woman");
            // if (this.joinedToFindFrom) {
            //   Backbone.history.navigate("#/" + this.joinedToFindFrom);
            // }
            // else {
            //   Backbone.history.navigate("#/woman");
            // }
          }
        }
      },
      initialize: function() {
        this.$el.html(template);
        formsCollection = new FormsCollection({ $container: this.$el.find("#forms-profile-container") });
        this.searchFormView = new SearchFormView({ el: this.$el.find("form[name=\"filter-form\"]") });
      },
      render: function (params) {
        formsCollection.render(params);
        if (params.where.id) {
          this.model.set("id", params.where.id);
          this.$el.find("input[name=\"user-id\"]").val(params.where.id);
        }
        else {
          this.model.set("id", "");
          this.$el.find("input[name=\"user-id\"]").val("");
        }
      }
    });



    var SearchFormView = Backbone.View.extend({
      model: new SearchFormModel(),
      // id: "search-filter",
      // className: "search-filter",
      events: {
        "change select[name=\"looking\"]": function (event) {
          this.model.set("looking", event.target.value);
        },
        "change select[name=\"intention\"]": function (event) {
          this.model.set("intention", event.target.value);
        },
        "change select[name=\"work\"]": function (event) {
          this.model.set("work", event.target.value);
        },
        "change select[name=\"eye\"]": function (event) {
          this.model.set("eye", event.target.value);
        },
        "change select[name=\"smoke\"]": function (event) {
          this.model.set("smoke", event.target.value);
        },
        "change select[name=\"alcohol\"]": function (event) {
          this.model.set("alcohol", event.target.value);
        },
        "input input[name=\"id\"]": function (event) {
          this.model.set("id", event.target.value);
        },
        "click #find-by-params-submit": function () {
          var query = {
            where: { }
          };
          _.each(this.model.toJSON(), function (value, prop) {
            if (value) query[prop] = value;
          });
          Backbone.history.navigate("#/woman/find-params?" + $.param(query));
        }
      },
      opened: function () {
        this.$el.css("display", "block");
      },
      open: function () {
        var searchFormView = this;
        if (!searchFormView.active) {
          searchFormView.active = true;
          if (!searchFormView.searchFormContainerHeight) {
            searchFormView.searchFormContainerHeight = searchFormView.$el.height();
          }
          TweenMax.fromTo(searchFormView.$el, 0.6, {
            opacity: 0,
            height: 0
          }, {
            opacity: 1,
            height: searchFormView.searchFormContainerHeight,
            onStart: function () {
              searchFormView.$el.css("display", "block");
            }
          });
        }
      },
      closed: function () {
        this.$el.css("display", "none");
      },
      close: function () {
        var searchFormView = this;
        if (searchFormView.active) {
          searchFormView.active = false;
          if (!searchFormView.searchFormContainerHeight) {
            searchFormView.searchFormContainerHeight = searchFormView.$el.height();
          }
          TweenMax.to(searchFormView.$el, 0.6, {
            opacity: 0,
            height: 0,
            onComplete: function () {
              searchFormView.$el.css("display", "none");
            }
          });
        }
      },
      initialize: function () {
        if (Backbone.history.fragment.indexOf("woman/find-params") !== -1) this.active = true;
        var searchFormView = this;
        var $sliderAge = searchFormView.$el.find("#slider-age");
        $sliderAge.slider({
          range: true,
          min: 16,
          max: 55,
          values: [ 16, 55 ],
          slide: function(event, ui) {
            searchFormView.$el.find("#age-from").text(ui.values[0]);
            searchFormView.$el.find("#age-to").text(ui.values[1]);
            var dateFrom = new Date();
            dateFrom.setFullYear(dateFrom.getFullYear()-ui.values[1]);
            var dateTo = new Date();
            dateTo.setFullYear(dateTo.getFullYear()-ui.values[0]);
            searchFormView.model.set("birthday", {
              $gte: dateFrom.toGMTString(),
              $lte: dateTo.toGMTString()
            });
          }
        });
        searchFormView.$el.find("#age-from").text($sliderAge.slider("values", 0));
        searchFormView.$el.find("#age-to").text($sliderAge.slider("values", 1));
        var dateFrom = new Date();
        dateFrom.setFullYear(dateFrom.getFullYear()-$sliderAge.slider("values", 1));
        var dateTo = new Date();
        dateTo.setFullYear(dateTo.getFullYear()-$sliderAge.slider("values", 0));
        searchFormView.model.set("birthday", {
          $gte: dateFrom.toGMTString(),
          $lte: dateTo.toGMTString()
        });
        var $sliderHeight = searchFormView.$el.find("#slider-height");
        $sliderHeight.slider({
          range: true,
          min: 135,
          max: 230,
          values: [ 135, 230 ],
          slide: function(event, ui) {
            searchFormView.$el.find("#height-from").text(ui.values[0]);
            searchFormView.$el.find("#height-to").text(ui.values[1]);
            searchFormView.model.set("height", {
              $gte: ui.values[0],
              $lte: ui.values[1]
            });
          }
        });
        searchFormView.$el.find("#height-from").text($sliderHeight.slider("values", 0));
        searchFormView.$el.find("#height-to").text($sliderHeight.slider("values", 1));
        searchFormView.model.set("height", {
          $gte: $sliderHeight.slider("values", 0),
          $lte: $sliderHeight.slider("values", 1)
        });
        var $sliderWeight = searchFormView.$el.find("#slider-weight");
        $sliderWeight.slider({
          range: true,
          min: 35,
          max: 130,
          values: [ 35, 130 ],
          slide: function(event, ui) {
            searchFormView.$el.find("#weight-from").text(ui.values[0]);
            searchFormView.$el.find("#weight-to").text(ui.values[1]);
            searchFormView.model.set("weight", {
              $gte: ui.values[0],
              $lte: ui.values[1]
            });
          }
        });
        searchFormView.$el.find("#weight-from").text($sliderWeight.slider("values", 0));
        searchFormView.$el.find("#weight-to").text($sliderWeight.slider("values", 1));
        searchFormView.model.set("weight", {
          $gte: $sliderWeight.slider("values", 0),
          $lte: $sliderWeight.slider("values", 1)
        });
      }
    });








    return MainView;

  };

});