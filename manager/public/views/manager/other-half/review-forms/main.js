define([
  "text!./main.html",
  "text!./form.html",
  "css!./main.css"
], function(
  template,
  formToReviewTemplate
) {

  return function (options) {

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
        updatedAt: "",
        accepted: null
      }
    });
  
    var ReviewFormView = Backbone.View.extend({
      tagName: "li",
      id: "forms-to-review-item",
      className: "accordion-navigation clearfix",
      template: _.template(formToReviewTemplate),
      events: {
        "click #delete-button": "delete",
        "click #deny-button": "deny",
        "click #accept-button": "accept",
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
      deny: function () {
        var reviewFormView = this;
        if (reviewFormView.model.get("accepted") !== 1) {
          reviewFormView.model.save({
            accepted: 1
          }, {
            success: function () {
              reviewFormView.remove();
            }
          });
        }
      },
      accept: function () {
        var reviewFormView = this;
        if (reviewFormView.model.get("accepted") !== 2) {
          reviewFormView.model.save({
            accepted: 2
          }, {
            success: function () {
              reviewFormView.remove();
            }
          });
        }
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
      comparator: function (current, next) {
        var currentAccepted = current.get("accepted");
        var nextAccepted = next.get("accepted");
        var currentCreatedAt = current.get("createdAt");
        var nextCreatedAt = next.get("createdAt");
        if (currentAccepted === 0) {
          if (nextAccepted === 0) {
            if (currentCreatedAt > nextCreatedAt) {
              return 1;
            }
            else {
              return -1;
            }
          }
          else if (nextAccepted === 1 || nextAccepted === 2) {
            return -1;
          }
        }
        else if (currentAccepted === 1) {
          if (nextAccepted === 0 || nextAccepted === 2) {
            return 1;
          }
          else if (nextAccepted === 1) {
            if (currentCreatedAt > nextCreatedAt) {
              return 1;
            }
            else {
              return -1;
            }
          }
        }
        else if (currentAccepted === 2) {
          if (nextAccepted === 0) {
            return 1;
          }
          else if (nextAccepted === 2) {
            if (currentCreatedAt > nextCreatedAt) {
              return 1;
            }
            else {
              return -1;
            }
          }
          else if (nextAccepted === 1) {
            return -1;
          }
        }
      },
      render: function (acceptedFilterValue) {
        var $formsToReviewContainer = $("#forms-to-review-list");
        this.fetch({
          data: {
            where: JSON.stringify({ accepted: acceptedFilterValue })
          },
          success: function (collection) {
            $formsToReviewContainer.html("");
            collection.sort();
            collection.each(function (reviewFormModel) {
              var reviewFormView = new ReviewFormView({ model: reviewFormModel });
              reviewFormView.render();
              $formsToReviewContainer.append(reviewFormView.$el);
            });
          }
        });
      }
    });
  
    var reviewFormCollection = null;
  
    return new (Backbone.View.extend({
      tagName: "article",
      className: "other-half-article",
      initialize: function() {
        $("#other-half-bar a").parent().removeClass("active");
        $("#other-half-bar a[href=\"" + location.hash + "\"]").parent().addClass("active");
        $("#other-half-content").html(this.$el);
        this.$el.append(template);
        reviewFormCollection = new ReviewFormCollection();
        reviewFormCollection.render(options.acceptedFilterValue);
      }
    }));

  };

});