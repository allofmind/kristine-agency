define([
  "text!views/manager/meet-page/main.html"
], function(
  template
) {

  return Backbone.View.extend({
    tagName: "article",
    className: "row valign-middle",
    events: {
    },
    initialize: function() {
      $("#main-left-bar a").removeClass("active");
      this.$el.append(template);
      $("#manager-content").html(this.$el);
    }
  });

});