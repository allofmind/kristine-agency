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

  return Backbone.View.extend({
    id: "registration-popup",
    events: {
      "click #poppup-closer": function () {
        this.close();
        history.back();
      }
    },
    close: function () {
      var findLove = this;
      $("body").removeClass("poppup-active");
      TweenMax.to(findLove.$el, 0.6, {
        scaleX: 1.1,
        scaleY: 1.1,
        opacity: 0,
        onComplete: function () {
          findLove.remove();
        }
      });
    },
    initialize: function() {
      $("body").addClass("poppup-active");
      this.$el.append(template);
      var formBox = this.$el.find("#form-box");
      var tl = new TimelineMax();
      TweenMax.fromTo(this.$el, 0.6, {
        scaleX: 1.1,
        scaleY: 1.1,
        opacity: 0
      }, {
        scaleX: 1,
        scaleY: 1,
        opacity: 1
      });
    }
  });

});