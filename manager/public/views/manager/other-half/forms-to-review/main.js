define([
  "text!./main.html",
  "text!./form-to-review.html",
  "css!./main.css"
], function(
  template,
  formToReviewTemplate
) {

  var ReviewFormModel = Backbone.Model.extend({
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
      updatedAt: ""
    }
  });

  var ReviewFormView = Backbone.View.extend({
    tagName: "li",
    id: "forms-to-review-item",
    className: "accordion-navigation clearfix",
    template: _.template(formToReviewTemplate),
    events: {
      "click #delete-button": "delete",
      "click #toggle-activator": function (event) {
        this.toggleContent();
      }
    },
    toggleContent: function () {
      if (this.$el.hasClass("active")) {
        this.$el.removeClass("active");
      }
      else {
        this.$el.addClass("active");
      }
    },
    delete: function () {
      var reviewFormView = this;
      reviewFormView.model.destroy({
        success: function () {
          reviewFormView.remove();
        }
      });
    },
    render: function () {
      var renderedTemplate = this.template(this.model.toJSON());
      this.$el.html(renderedTemplate);
    },
    initialize: function (options) {
      this.model = options.model;
    }
  });

  var ReviewFormCollection = Backbone.Collection.extend({
    url: "/client/second-half/review-forms",
    model: ReviewFormModel,
    render: function () {
      var $formsToReviewContainer = $("#forms-to-review-list");
      this.fetch({
        success: function (collection) {
          $formsToReviewContainer.html("");
          collection.each(function (reviewFormModel) {
            var reviewFormView = new ReviewFormView({ model: reviewFormModel });
            reviewFormView.render();
            $formsToReviewContainer.append(reviewFormView.$el);
          });
        }
      });
    }
  });

  return Backbone.View.extend({
    tagName: "article",
    className: "other-half-article",
    initialize: function() {
      $("#other-half-content").html(this.$el);
      this.$el.append(template);
      var reviewFormCollection = new ReviewFormCollection();
      reviewFormCollection.render();
    }
  });

});