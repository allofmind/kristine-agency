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
      events: {
        "change select[name=\"find-partner\"]": function (event) {
            Backbone.history.navigate(event.target.value);
        }
      },
      initialize: function() {
        this.$el.append(template);
      }
    });

  };

});