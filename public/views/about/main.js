define([
  "text!./main.html",
  "css!./main"
], function(
  template,
  style
) {

  return function () {

    return Backbone.View.extend({
      tagName: "article",
      id: "main-article-wrap",
      initialize: function() {
        this.$el.append(template);
      }
    });

  };

});