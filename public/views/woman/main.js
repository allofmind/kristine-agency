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
        formsCollection.fetch({
          data: {
            where: JSON.stringify({
              accepted: [ 2 ],
              gender: [ 2 ]
            })
          },
          success: function (collection) {
            formsCollection.$container.html("");
            collection.sort();
            collection.each(function (formModel) {
              var formView = new FormView({ model: formModel });
              formView.render();
              formsCollection.$container.append(formView.$el);
            });
          }
        });
      },
      initialize: function (options) {
        this.$container = options.$container;
      }
    });
  
    var formsCollection;

    var MainView = Backbone.View.extend({
      tagName: "article",
      id: "main-article-wrap",
      initialize: function() {
        this.$el.html(template);
        formsCollection = new FormsCollection({ $container: this.$el.find("#forms-profile-container") });
        formsCollection.render();
      }
    });

    var mainView = new MainView();

    return mainView;

  };

});