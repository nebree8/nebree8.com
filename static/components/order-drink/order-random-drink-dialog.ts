class OrderRandomDrinkDialogCtrl {
  orderForm: ng.IFormController;  // Set from partial.
  userName: string;
  recipe: any;
  
  constructor(private $mdDialog: ng.material.IDialogService,
              private DrinksService: DrinksService,
              private RandomDrinkService: RandomDrinkService) {}

  submitDialog() {
    if (this.orderForm.$valid) {
      this.$mdDialog.hide({recipe: this.recipe, userName: this.userName});
    }
  }
  
  orderSurprise() {
    if (this.orderForm.$valid) {
      this.RandomDrinkService.createDrink().then((recipe: Recipe) => {
        this.$mdDialog.hide({recipe: recipe, userName: this.userName});
      })
    }
  }

  preview() {
    this.RandomDrinkService.createDrink().then((recipe: Recipe) => {
      this.recipe = recipe;
    });
  }

  ingredientsCsv(): string {
    return this.DrinksService.ingredientsCsv(this.recipe);
  }

  cancelDialog() {
    this.$mdDialog.cancel();
  }
}

angular.module('nebree8.order-drink')
  .controller('OrderRandomDrinkDialogCtrl', OrderRandomDrinkDialogCtrl)
