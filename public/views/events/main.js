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

    return Backbone.View.extend({
      tagName: "article",
      id: "main-article-wrap",
      eventsCollection: new EventsCollection(),
      load: function () {
        var $eventsView = this.eventsView.$el;
        var $loaderScreen = this.$loaderScreen;
        TweenMax.to($eventsView, 0.6, {
          opacity: 0
        });
        TweenMax.fromTo($loaderScreen, 0.6, {
          opacity: 0
        }, {
          opacity: 1,
          onStart: function () { $loaderScreen.css("display", "block"); }
        });
      },
      loaded: function () {
        var $eventsView = this.eventsView.$el;
        var $loaderScreen = this.$loaderScreen;
        TweenMax.to($eventsView, 0.6, {
          opacity: 1
        });
        TweenMax.fromTo($loaderScreen, 0.6, {
          opacity: 1
        }, {
          opacity: 0,
          onComplete: function () { $loaderScreen.css("display", "none"); }
        });
      },
      render: function () {
        var view = this;
        var $eventsView = this.eventsView.$el;
        this.load();
        this.eventsCollection.fetch({
          success: function (collection) {
            collection.each(function (model) {
              var eventView = new EventView({ model: model });
              eventView.render();
              $eventsView.append(eventView.$el);
              view.loaded();
            });
          }
        });
      },
      initialize: function() {
        this.$el.html(template);
        this.eventsView = new EventsView({ el: this.$el.find("#future-events-list") });
        this.$loaderScreen = this.$el.find("#load-form-screen");
        this.$loader = this.$el.find("#loader-container");
        $("#main-section").html(this.$el);
        this.render();
      }
    });

  };

});