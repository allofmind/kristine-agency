define([
  "text!views/about/main.html",
  "css!views/about/main"
], function(
  template,
  style
) {

  return Backbone.View.extend({
    tagName: "article",
    id: "main-article",
    initialize: function() {
      this.$el.append(template);
    }
  });

});