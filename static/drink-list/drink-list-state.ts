class DrinkListStateService {
  searching: boolean = false;
  query: string = '';
}

angular.module('nebree8.drink-list.state', [])
  .service('DrinkListStateService', DrinkListStateService);
