define([
  "text!views/service/main.html",
  "css!views/service/main"
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