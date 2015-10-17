define([
  "text!./main.html"
], function(
  template
) {

  return Backbone.View.extend({
    tagName: "div",
    events: {
    },
    initialize: function() {
      $("#main-left-bar a").removeClass("active");
      $("#main-left-bar a[href=\"#/other-half\"]").addClass("active");
      this.$el.append(template);
      $("#manager-content").html(this.$el);
    }
  });

});