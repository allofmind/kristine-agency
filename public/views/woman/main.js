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

    var FormModel = Backbone.Model.extend({
      defaults: {
        id: null,
        mainPhotoUrl: "",
        firstName: "",
        lastName: "",
        gender: "",
        email: "",
        phone: "",
        birthday: "",
        height: "",
        weight: "",
        eyeСolor: "",
        badHabits: "",
        aboutMe: "",
        createdAt: "",
        updatedAt: "",
        accepted: null
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
      model: FormModel,
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
      render: function () {
        var formsCollection = this;
        formsCollection.load();
        formsCollection.fetch({
          data: {
            where: JSON.stringify({
              accepted: [ 2 ],
              gender: [ 2 ]
            })
          },
          success: function (collection) {
            formsCollection.$collectionContainer.html("");
            collection.sort();
            collection.each(function (formModel) {
              var formView = new FormView({ model: formModel });
              formView.render();
              formsCollection.$collectionContainer.append(formView.$el);
            });
            formsCollection.loaded();
          }
        });
      },
      load: function () {
        var formsCollection = this;
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
      }
    });
  
    var formsCollection;

    var MainView = Backbone.View.extend({
      tagName: "article",
      id: "main-article-wrap",
      events: {
        "click #search-button": function () {
          var mainView = this;
          if (Backbone.history.fragment.indexOf("woman/search") === -1) {
            Backbone.history.navigate("#/woman/search");
          }
          else {
            Backbone.history.navigate("#/woman");
            mainView.searchView.close();
          }
        }
      },
      initialize: function() {
        this.$el.html(template);
        this.$searchFormContainer = this.$el.find("#filter-container");
        formsCollection = new FormsCollection({ $container: this.$el.find("#forms-profile-container") });
        formsCollection.render();
        this.$filterContainer = this.$el.find("#filter-container");
      }
    });

    var mainView = new MainView();

    return mainView;

  };

});