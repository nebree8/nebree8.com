class DrinkListStateService {
  searching: boolean = false;
  query: string = '';
  viewingOrders: boolean = false;
}

angular.module('nebree8.drink-list.state', [])
  .service('DrinkListStateService', DrinkListStateService);
