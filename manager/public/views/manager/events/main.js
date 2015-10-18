define([
  "text!./main.html"
], function(
  template
) {

  return Backbone.View.extend({
    events: {
    },
    initialize: function() {
      $("#main-left-bar a").removeClass("active");
      $("#main-left-bar a[href=\"#/events/create\"]").addClass("active");
      this.$el.append(template);
      $("#manager-content").html(this.$el);
    }
  });

});