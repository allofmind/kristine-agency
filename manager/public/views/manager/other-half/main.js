define([
  "text!views/manager/other-half/main.html"
], function(
  template
) {

  return Backbone.View.extend({
    tagName: "div",
    events: {
    },
    initialize: function() {
      this.$el.append(template);
      $("#manager-content").html(this.$el);
    }
  });

});