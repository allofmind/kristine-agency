define([
  "text!views/service/main.html",
  "css!views/service/main"
], function(
  template,
  style
) {

//   var DateView = Backbone.View.extend({
//     // el: "#date-input",
//     mask: /\d\d\/\d\d\/\d\d\d\d/,
//     value: "__/__/____",
//     events: {
//       "focus": function (event) {
//         var target = event.target;
//         var value = target.value;
//         this.currentValue = value;
//       },
//       "input": function (event) {
//         var target = event.target;
//         var value = target.value;
//         var matchSymbol = value.match(/\d/);
//         debugger;
//         if (matchSymbol.length) {
//           var newIndex = value.indexOf(matchSymbol);
//           var startValue = this.value;
//           var endValue = startValue.replace("_", matchSymbol[0]);
//           target.value = endValue;
//         }
//       }
//     },
//     initialize: function() {
//       this.$el.val(this.value);
//     }
//   });

  return Backbone.View.extend({
    tagName: "article",
    id: "main-article-wrap",
    initialize: function() {
      this.$el.append(template);
    }
  });

});