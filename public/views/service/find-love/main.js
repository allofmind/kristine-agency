define([
  "text!./main.html",
  "css!./main"
], function(
  template,
  style
) {

  var FormModel = Backbone.Model.extend({
    url: "/client/second-half/review-forms",
    defaults: {
      mainPhotoFile: "",
      firstName: "",
      gender: "",
      birthday: "",
      email: "",
      phone: "",
      looking: "",
      intention: "",
      height: "",
      weight: "",
      eye: "",
      work: "",
      smoke: "",
      drink: "",
      about: ""
    },
    sync: function (method, model, options) {
      if (method === "create") {
        var formData = new FormData();
        _.each(model.attributes, function (value, key) {
          formData.append(key, value);
        });
        _.defaults(options || (options = { }), {
          data: formData,
          processData: false,
          contentType: false
        });
      }
      return Backbone.sync.call(this, method, model, options);
    }
  });

  return Backbone.View.extend({
    model: new FormModel,
    id: "registration-popup",
    events: {
      "click #poppup-closer": function () {
        this.close();
        history.back();
      },
      "change input[name=\"mainPhoto\"]": function (event) {
        var formView = this;
        this.model.set("mainPhotoFile", event.target.files[0]);
        var fileReader = new FileReader();
        fileReader.onload = function () {
          formView.$el.find("#main-photo-image").attr("src", fileReader.result);
        };
        fileReader.readAsDataURL(this.model.get("mainPhotoFile"));
      },
      "input input[name=\"firstName\"]": function (event) {
        this.model.set("firstName", event.target.value);
      },
      "change select[name=\"gender\"]": function (event) {
        this.model.set("gender", event.target.value);
      },
      "change select[name=\"day\"]": function (event) {
        this.model.set("birthday", new Date(this.$el.find("[name=\"month\"]").val() + "." + this.$el.find("[name=\"day\"]").val() + "." + this.$el.find("[name=\"year\"]").val()));
      },
      "change select[name=\"month\"]": function (event) {
        this.model.set("birthday", new Date(this.$el.find("[name=\"month\"]").val() + "." + this.$el.find("[name=\"day\"]").val() + "." + this.$el.find("[name=\"year\"]").val()));
      },
      "change select[name=\"year\"]": function (event) {
        this.model.set("birthday", new Date(this.$el.find("[name=\"month\"]").val() + "." + this.$el.find("[name=\"day\"]").val() + "." + this.$el.find("[name=\"year\"]").val()));
      },
      "input input[name=\"email\"]": function (event) {
        this.model.set("email", event.target.value);
      },
      "input input[name=\"phone\"]": function (event) {
        this.model.set("phone", event.target.value);
      },
      "change select[name=\"looking\"]": function (event) {
        this.model.set("looking", event.target.value);
      },
      "change select[name=\"intention\"]": function (event) {
        this.model.set("intention", event.target.value);
      },
      "input input[name=\"height\"]": function (event) {
        this.model.set("height", event.target.value);
      },
      "input input[name=\"weight\"]": function (event) {
        this.model.set("weight", event.target.value);
      },
      "change select[name=\"eye\"]": function (event) {
        this.model.set("eye", event.target.value);
      },
      "change select[name=\"work\"]": function (event) {
        this.model.set("work", event.target.value);
      },
      "change select[name=\"smoke\"]": function (event) {
        this.model.set("smoke", event.target.value);
      },
      "change select[name=\"drink\"]": function (event) {
        this.model.set("drink", event.target.value);
      },
      "input textarea[name=\"about\"]": function (event) {
        this.model.set("about", event.target.value);
      },
      "submit form[name=\"second-half-form\"]": function () {
        var formView = this;
        this.model.save(null, {
          success: function () {
            var messagePopupLoading = formView.$loadScreen.find("#message-popup-loading")
            var messagePopupComplete = formView.$loadScreen.find("#message-popup-complete")
            TweenMax.fromTo(messagePopupLoading, 0.6, {
              opacity: 1
            }, {
              opacity: 0,
              onComplete: function () {
                messagePopupLoading.css("display", "none");
              }
            });
            TweenMax.fromTo(messagePopupComplete, 0.6, {
              opacity: 0
            }, {
              opacity: 1,
              onStart: function () {
                messagePopupComplete.css("display", "block");
              },
              onComplete: function () {
                setTimeout(function () {
                  Backbone.history.navigate("#/service");
                }, 1500);
              }
            });
          },
          error: function () {
            console.error("error");
          }
        });
      }
    },
    close: function () {
      var findLove = this;
      $("body").removeClass("poppup-active");
      TweenMax.to(findLove.$el, 0.6, {
        opacity: 0,
        onComplete: function () {
          findLove.remove();
        }
      });
      TweenMax.to(this.$formBox, 0.6, {
        scaleX: 1.1,
        scaleY: 1.1,
        onComplete: function () {
          findLove.remove();
        }
      });
    },
    initialize: function() {
      $("body").addClass("poppup-active");
      this.$el.append(template);
      this.$formBox = this.$el.find("#form-box");
      TweenMax.fromTo(this.$el, 0.6, {
        opacity: 0
      }, {
        opacity: 1
      });
      TweenMax.fromTo(this.$formBox, 0.6, {
        scaleX: 1.1,
        scaleY: 1.1
      }, {
        scaleX: 1,
        scaleY: 1
      });
      this.$loadScreen = this.$el.find("#send-form-screen");
    }
  });

});