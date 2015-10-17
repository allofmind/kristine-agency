define([
  "text!./main.html",
  "global/user"
], function(
  template,
  user
) {

  return Backbone.View.extend({
    tagName: "main",
    events: {
      "click #logout": function (event) {
        $.get("/manager/auth/logout", function () {
          user.logout();
          Backbone.history.navigate("#/login");
        });
      }
    },
    initialize: function() {
      this.$el.append(template);
      $("body").html(this.$el);
    }
  });

});