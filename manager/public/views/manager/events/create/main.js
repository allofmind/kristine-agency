define([
  "text!./main.html",
  "css!./main.css"
], function(
  template
) {

  return function () {

    var EventModel = Backbone.Model.extend({
      url: "/events",
      defaults: {
        title: "",
        date: null,
        address: "",
        posterUrl: null,
        about: "",
        show: false
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

    var EventFormView = Backbone.View.extend({
      model: new EventModel(),
      events: {
        "input [name=\"title\"]": function (event) {
          this.model.set("title", event.target.value);
        },
        "blur [name=\"date\"]": function (event) {
          this.model.set("date", new Date(event.target.value));
        },
        "input [name=\"address\"]": function (event) {
          this.model.set("address", event.target.value);
        },
        "change [name=\"posterUrl\"]": function (event) {
          var fileReader = new FileReader();
          fileReader.onload = function () { $("#poster").attr("src", fileReader.result); };
          fileReader.readAsDataURL(event.target.files[0]);
          this.model.set("posterUrl", event.target.files[0]);
        },
        "input [name=\"about\"]": function (event) {
          this.model.set("about", event.target.value);
        },
        "change [name=\"show\"]": function (event) {
          this.model.set("show", event.target.checked);
        },
        "submit": function (event) {
          this.model.save();
        }
      }
    });

    return new (Backbone.View.extend({
      tagName: "article",
      className: "row valign-middle",
      initialize: function() {
        $("#events-top-navigation a").parent().removeClass("active");
        $("#events-top-navigation a[href=\"#/events/create\"]").parent().addClass("active");
        this.$el.append(template);
        var eventFormView = new EventFormView({ el: this.$el.find("form[name=\"create-event\"]") });
        $("#events-content").html(this.$el);
      }
    }));

  };

});