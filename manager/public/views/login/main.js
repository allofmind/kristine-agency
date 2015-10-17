define([
  "text!./main.html",
  "global/user",
  "common/messager"
], function(
  template,
  user,
  messager
) {

  return Backbone.View.extend({
    className: "row valign-middle",
    events: {
      "submit #form-authorization": function (event) {
        var login = this;
        var form = event.target;
        $.post("/manager/auth/login", {
          email: form.email.value,
          password: form.password.value
        }).done(function (userInfo) {
          user.login(userInfo);
          Backbone.history.navigate("#/", { replace: true });
        }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
          var status = XMLHttpRequest.status;
          var response = JSON.parse(XMLHttpRequest.responseText);
          login.showError(messager.get(status, response.code));
        });
      },
      "input #form-authorization input[name=\"email\"]": "hideError",
      "input #form-authorization input[name=\"password\"]": "hideError"
    },
    showError: function (message) {
      if (message) {
        this.$error.text(message);
        this.$error.removeClass("hide");
      }
    },
    hideError: function () {
      if (!this.$error.hasClass("hide")) {
        this.$error.addClass("hide");
      }
    },
    initialize: function() {
      this.$el.append(template);
      this.$error = this.$el.find(".error");
      $("body").html(this.$el);
    }
  });

});