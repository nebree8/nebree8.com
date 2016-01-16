class DrinkListStateService {
  searching: boolean = false;
  query: string = '';
  scrollX: number = 0;
  scrollY: number = 0;
}

angular.module('nebree8.drink-list.state', [])
  .service('DrinkListStateService', DrinkListStateService);
