define([
  "text!views/service/find-love/main.html",
  "css!views/service/find-love/main"
], function(
  template,
  style
) {

  // var DateView = Backbone.View.extend({
  //   el: "#date-input",
  //   events: {
  //     "input": function (event) {
  //       console.log(event);
  //     }
  //   },
  //   initialize: function () {
  //     console.log(this);
  //   }
  // });

  var MainPhotoView = Backbone.View.extend({
    events: {
      "change input[name=\"mainPhoto\"]": function (event) {
        var mainPhoto = this;
        var image = event.target.files[0];
        var fileReader = new FileReader();
        fileReader.onload = function () {
          mainPhoto.$imageContainer.attr("src", fileReader.result);
        };
        fileReader.readAsDataURL(image);
      }
    },
    initialize: function () {
      this.$imageContainer = this.$el.find("#main-photo-image");
    }
  });

  return Backbone.View.extend({
    id: "registration-popup",
    events: {
      "click #poppup-closer": function () {
        this.close();
        history.back();
      },
      "submit form[name=\"second-half-form\"]": function (event) {
        var mainView = this;
        TweenMax.fromTo(this.$loadScreen, 0.6, {
          opacity: 0
        }, {
          opacity: 1,
          onStart: function () {
            mainView.$loadScreen.css("display", "block");
          }
        });
        var form = event.target;
        var data = new FormData();
        data.append("mainPhoto", form.mainPhoto.files[0]);
        data.append("firstName", form.firstName.value);
        data.append("firstName", form.firstName.value);
        data.append("lastName", form.lastName.value);
        data.append("gender", form.gender.value);
        data.append("phone", form.phone.value);
        data.append("email", form.email.value);
        data.append("birthday", new Date(form.day.value + "." + form.month.value + "." + form.year.value));
        data.append("height", form.height.value);
        data.append("weight", form.weight.value);
        data.append("eyeСolor", form.eyeСolor.value);
        data.append("badHabits", form.badHabits.value);
        data.append("aboutMe", form.aboutMe.value);
        $.ajax({
          url: "/client/second-half/review-forms",
          type: "POST",
          processData: false,
          contentType: false,
          data: data
        }).done(function (secondHalfForm) {
          var messagePopupLoading = mainView.$loadScreen.find("#message-popup-loading")
          var messagePopupComplete = mainView.$loadScreen.find("#message-popup-complete")
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
      var mainPhotoView = new MainPhotoView({ el: this.$el.find("#main-photo") });
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