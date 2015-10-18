define([
  "text!./main.html",
  "text!./event-item.html",
  "css!./main"
], function(
  template,
  eventItemTemplate
) {

  return function () {

    var EventModel = Backbone.Model.extend({
      defaults: {
        title: "",
        date: null,
        address: "",
        posterUrl: null,
        about: "",
        show: null
      }
    });

    var EventView = Backbone.View.extend({
      className: "future-event",
      template: _.template(eventItemTemplate),
      render: function () {
        this.$el.html(this.template(this.model.toJSON()));
      }
    });

    var EventsCollection = Backbone.Collection.extend({
      url: "/events",
      model: EventModel,
      comparator: "date"
    });

    var EventsView = Backbone.View.extend({

    });

    return new (Backbone.View.extend({
      tagName: "article",
      id: "main-article-wrap",
      initialize: function() {
        this.$el.append(template);
        var eventsCollection = new EventsCollection();
        var eventsView = new EventsView({ el: this.$el.find("#future-events-list") });
        eventsCollection.fetch({
          success: function (collection) {
            collection.each(function (model) {
              var eventView = new EventView({ model: model });
              eventView.render();
              eventsView.$el.append(eventView.$el);
            });
          }
        });
        $("#main-section").append(this.$el);
      }
    }));

  };

});