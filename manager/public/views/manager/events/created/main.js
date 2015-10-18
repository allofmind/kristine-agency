define([
  "text!./event-form.html",
  "css!./main.css"
], function(
  eventForm
) {

  return function () {

    var EventFormModel = Backbone.Model.extend({
      url: "/events",
      defaults: {
        title: "",
        date: null,
        address: "",
        posterUrl: null,
        about: "",
        show: null
      }
    });

    var EventFormView = Backbone.View.extend({
      tagName: "li",
      className: "form-item accordion-navigation clearfix",
      template: _.template(eventForm),
      events: {
        "click #toggle-activator": function (event) {
          if (this.$el.hasClass("active")) {
            this.$el.removeClass("active");
          }
          else {
            this.$el.addClass("active");
          }
        },
        "click #hide-button": function (event) {
          var eventFormView = this;
          eventFormView.model.save({
            show: false
          }, {
            success: function () {
              eventFormView.render();
            }
          });
        },
        "click #show-button": function (event) {
          var eventFormView = this;
          eventFormView.model.save({
            show: true
          }, {
            success: function () {
              eventFormView.render();
            }
          });
        }
      },
      render: function () {
        this.$el.html(this.template(this.model.toJSON()));
      }
    });

    var EventFormsCollection = Backbone.Collection.extend({
      url: "/events",
      comparator: "createdAt"
    });

    var EventFormsView = Backbone.View.extend({
      tagName: "ul",
      className: "accordion list-of-forms",
      id: "created-events-list",
      render: function () {
        var eventFormsView = this;
        eventFormsView.collection.fetch({
          success: function (collection) {
            collection.each(function (model) {
              var eventFormView = new EventFormView({ model: model });
              eventFormView.render();
              eventFormsView.$el.append(eventFormView.$el);
            });
          }
        });
      }
    });

    return new (Backbone.View.extend({
      tagName: "article",
      className: "forms-list-article",
      initialize: function() {
        $("#events-top-navigation a").parent().removeClass("active");
        $("#events-top-navigation a[href=\"#/events/created\"]").parent().addClass("active");
        var eventFormsView = new EventFormsView({ collection: new EventFormsCollection() });        
        eventFormsView.render();
        this.$el.append(eventFormsView.$el);
        $("#events-content").html(this.$el);
      }
    }));

  };

});