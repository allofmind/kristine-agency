define([
  "text!./main.html",
  "css!./main"
], function(
  template
) {

  return function () {

    var FeedbackModel = Backbone.Model.extend({
      url: "/feedback",
      defaults: {
        name: "",
        phone: "",
        reason: ""
      },
      sync: function (method, model, options) {
        if (method === "create") {
          var formData = new FormData();
          _.each(model.attributes, function (value, key) {
            formData.append(key, value);
          });
          _.defaults(options || (options = { }), {
            data: formData,
            processData: false,
            contentType: false
          });
        }
        return Backbone.sync.call(this, method, model, options);
      }
    });

    var FeedbackView = Backbone.View.extend({
      model: new FeedbackModel(),
      events: {
        "input input[name=\"name\"]": function (event) {
          this.model.set("name", event.target.value);
        },
        "input input[name=\"phone\"]": function (event) {
          this.model.set("phone", event.target.value);
        },
        "input textarea[name=\"reason\"]": function (event) {
          this.model.set("reason", event.target.value);
        },
        "submit": function () {
          var feedbackView = this;
          feedbackView.load(function () {
            feedbackView.model.save(null, {
              success: function () {
                feedbackView.loaded();
              },
              error: function () { }
            });
          });
        }
      },
      load: function (callback) {
        var $sendButton = this.$sendButton;
        $sendButton.attr("disabled", true);
        $sendButton.text("Обработка данных");
        var $loadScreen = this.$loadScreen;
        TweenMax.fromTo($loadScreen, 0.6, {
          opacity: 0
        }, {
          opacity: 1,
          onStart: function () {
            $loadScreen.css("display", "block");
            callback();
          }
        });
      },
      loaded: function (callback) {
        var $sendButton = this.$sendButton;
        $sendButton.addClass("sended");
        $sendButton.text("Данные приняты");
        var $loadScreen = this.$loadScreen;
        $loadScreen.addClass("loaded");
        setTimeout(function () {
          Backbone.history.navigate("#/");
        }, 3000);
      },
      initialize: function () {
        this.$loadScreen = this.$el.find("#load-form-screen");
        this.$sendButton = this.$el.find("#send-button");
      }
    });

    return new (Backbone.View.extend({
      tagName: "article",
      id: "main-article-wrap",
      initialize: function() {
        this.$el.append(template);
        new FeedbackView({ el: this.$el.find("form[name=\"sendContacts\"]") });
        $("#main-section").append(this.$el);
      }
    }));

  };

});