var SaveScrollDirective = function($window: ng.IWindowService) {
  interface ScrollState { top: number; left: number }
  class ScrollStateCtrl {
    constructor (public state: {[key:string]: ScrollState}) {}
  }
  return {
    'restrict': 'A',
    'controller': ['SaveScrollState', ScrollStateCtrl],
    'link': function (scope: ng.IScope, elts, attrs, ctrl: ScrollStateCtrl) {
      var elt = elts[0];
      var key = null;
      var state = ctrl.state;

      function save() {
        if (key) {
          state[key] = {'top': elt.scrollTop, 'left': elt.scrollLeft};
        }
      }

      function restore() {
        if (state[key]) {
          elt.scrollTop = state[key].top;
          elt.scrollLeft = state[key].left;
        }
      }

      attrs.$observe('saveScroll', function (newkey) {
        save();
        key = newkey;
        $window.setTimeout(restore, 0);
      });

      scope.$on('$routeChangeStart', save);
      scope.$on('$routeChangeSuccess', restore);
    },
  };
};

angular.module('nebree8.save-scroll', [])
    .factory("SaveScrollState", function() { return {}; })
    .directive("saveScroll", ['$window', SaveScrollDirective]);
