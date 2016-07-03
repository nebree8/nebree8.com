class OrderDrinkDialogCtrl {
  orderForm: ng.IFormController;  // Set from partial.
  userName: string;
  recipe: Recipe;  // Set in bindToController/locals.
  
  constructor(private $mdDialog: ng.material.IDialogService
              private DrinksService: DrinksService) {}

  submitDialog() {
    if (this.orderForm.$valid) {
      this.$mdDialog.hide(this.userName);
    }
  }

  slugify(): string {
    return this.DrinksService.slugifyDrinkName(this.recipe.drink_name);
  }

  ingredientsCsv(): string {
    return this.DrinksService.ingredientsCsv(this.recipe);
  }
  
  cancelDialog() {
    this.$mdDialog.cancel();
  }
}

angular.module('nebree8.order-drink', ['ngMaterial'])
  .controller('OrderDrinkDialogCtrl', OrderDrinkDialogCtrl)
