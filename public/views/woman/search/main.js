define([
  "text!./main.html"
], function(
  template
) {

  return function (options) {

    var SearchFormModel = Backbone.Model.extend({
      defaults: {
        lookingFor: "",
        intention: "",
        ageFrom: "",
        ageTo: "",
        heightFrom: "",
        heightTo: "",
        weightFrom: "",
        weightTo: "",
        work: "",
        eyeСolor: "",
        smoke: "",
        alcohol: "",
        id: ""
      }
    });
  
    var SearchFormView = Backbone.View.extend({
      model: new SearchFormModel(),
      id: "search-filter",
      className: "search-filter",
      events: {
        "change select[name=\"lookingFor\"]": function (event) {
          this.model.set("lookingFor", event.target.value);
        },
        "change select[name=\"intention\"]": function (event) {
          this.model.set("intention", event.target.value);
        },
        "change select[name=\"work\"]": function (event) {
          this.model.set("work", event.target.value);
        },
        "change select[name=\"eyeСolor\"]": function (event) {
          this.model.set("eyeСolor", event.target.value);
        },
        "change select[name=\"smoke\"]": function (event) {
          this.model.set("smoke", event.target.value);
        },
        "change select[name=\"alcohol\"]": function (event) {
          this.model.set("alcohol", event.target.value);
        },
        "input select[name=\"id\"]": function (event) {
          this.model.set("id", event.target.value);
        }
      },
      open: function () {
        var searchFormView = this;
        if (!searchFormView.searchFormContainerHeight) {
          searchFormView.searchFormContainerHeight = searchFormView.$el.height();
        }
        TweenMax.fromTo(searchFormView.$el, 0.6, {
          opacity: 0,
          height: 0
        }, {
          opacity: 1,
          height: searchFormView.searchFormContainerHeight,
          onStart: function () {
            searchFormView.$el.css("display", "block");
          }
        });
      },
      close: function () {
        var searchFormView = this;
        TweenMax.to(searchFormView.$el, 0.6, {
          opacity: 0,
          height: 0,
          onComplete: function () {
            searchFormView.$el.css("display", "none");
          }
        });
      },
      initialize: function () {
        var searchFormView = this;
        searchFormView.$el.html(template);
        var $sliderAge = searchFormView.$el.find("#slider-age");
        $sliderAge.slider({
          range: true,
          min: 16,
          max: 55,
          values: [ 16, 55 ],
          slide: function(event, ui) {
            searchFormView.$el.find("#age-from").text(ui.values[0]);
            searchFormView.$el.find("#age-to").text(ui.values[1]);
            searchFormView.model.set("ageFrom", ui.values[0]);
            searchFormView.model.set("ageFrom", ui.values[1]);
          }
        });
        searchFormView.$el.find("#age-from").text($sliderAge.slider("values", 0));
        searchFormView.$el.find("#age-to").text($sliderAge.slider("values", 1));
        searchFormView.model.set("ageFrom", $sliderAge.slider("values", 0));
        searchFormView.model.set("ageFrom", $sliderAge.slider("values", 1));
        var $sliderHeight = searchFormView.$el.find("#slider-height");
        $sliderHeight.slider({
          range: true,
          min: 140,
          max: 230,
          values: [ 140, 230 ],
          slide: function(event, ui) {
            searchFormView.$el.find("#height-from").text(ui.values[0]);
            searchFormView.$el.find("#height-to").text(ui.values[1]);
            searchFormView.model.set("heightFrom", ui.values[0]);
            searchFormView.model.set("heightFrom", ui.values[1]);
          }
        });
        searchFormView.$el.find("#height-from").text($sliderHeight.slider("values", 0));
        searchFormView.$el.find("#height-to").text($sliderHeight.slider("values", 1));
        searchFormView.model.set("heightFrom", $sliderHeight.slider("values", 0));
        searchFormView.model.set("heightFrom", $sliderHeight.slider("values", 1));
        var $sliderWeight = searchFormView.$el.find("#slider-weight");
        $sliderWeight.slider({
          range: true,
          min: 45,
          max: 130,
          values: [ 45, 130 ],
          slide: function(event, ui) {
            searchFormView.$el.find("#weight-from").text(ui.values[0]);
            searchFormView.$el.find("#weight-to").text(ui.values[1]);
            searchFormView.model.set("weightFrom", ui.values[0]);
            searchFormView.model.set("weightFrom", ui.values[1]);
          }
        });
        searchFormView.$el.find("#weight-from").text($sliderWeight.slider("values", 0));
        searchFormView.$el.find("#weight-to").text($sliderWeight.slider("values", 1));
        searchFormView.model.set("weightFrom", $sliderWeight.slider("values", 0));
        searchFormView.model.set("weightFrom", $sliderWeight.slider("values", 1));
      }
    });

    return new SearchFormView();

  };

});