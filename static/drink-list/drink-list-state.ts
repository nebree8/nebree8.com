/**
 * @constructor
 * @ngInject
 * @struct
 */
var DrinkListStateService = function() {
  /** @export {boolean} */
  this.searching = false;
  /** @export {string} */
  this.query = '';

  /** @type {number} */
  this.scrollX = 0;
  /** @type {number} */
  this.scrollY = 0;
};

angular.module('nebree8.drink-list.state', [])
  .service('DrinkListStateService', DrinkListStateService);
