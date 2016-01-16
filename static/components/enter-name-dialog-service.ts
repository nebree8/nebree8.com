

class EnterNameDialogController {
  nameForm: ng.IFormController;  // Set from partial.
  userName: string;
  constructor(private $mdDialog: ng.material.IDialogService) {}
  submitDialog() {
    if (this.nameForm.$valid) this.$mdDialog.hide(this.userName);
  }
  cancelDialog() { this.$mdDialog.cancel(); }
}

class EnterNameDialogService {
  constructor(private $mdDialog: ng.material.IDialogService) {}

  getUserName(event: MouseEvent): ng.IPromise<string> {
    return this.$mdDialog.show({
      clickOutsideToClose: true,
      controller: 'EnterNameDialogController',
      controllerAs: 'ctrl',
      escapeToClose: true,
      hasBackdrop: true,
      targetEvent: event,
      templateUrl: 'components/enter-name-dialog/enter-name-dialog.html',
    })
  }
}

angular.module('nebree8.enter-name-dialog', ['ngMaterial'])
  .controller('EnterNameDialogController', EnterNameDialogController)
  .service('EnterNameDialogService', EnterNameDialogService);
