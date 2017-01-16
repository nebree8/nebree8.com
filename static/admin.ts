class n8AdminCtrl {
  queue: Order[];

  constructor(private $http: angular.IHttpService,
              private DrinksService: DrinksService) {
    this.queue = [];
    this.refresh();
  }

  ingredientsCsv(order: Order): string {
    return this.DrinksService.ingredientsCsv(order);
  };

  approve(order: Order, isApproved: boolean) {
    this.$http({
      'method': 'POST',
      'url': '/api/approve_drink',
      // Convert to string because we're not marshalling parameters.
      'params': {'key': order.id, 'approved': isApproved ? 'true' : 'false'}
    }).then((resp: angular.IHttpPromiseCallbackArg<Order>) => {
      this.updateQueue(order, resp.data);
    });
  }

  archive(order: Order) {
    this.$http({
      'method': 'POST',
      'url': '/api/archive_drink',
      'params': {'key': order.id, 'archive': true}
    }).then((resp: angular.IHttpPromiseCallbackArg<Order>) => {
      this.refresh();
    });
  }

  promote(order: Order) {
    this.$http({
      'method': 'POST',
      'url': '/api/promote_drink',
      'params': {'key': order.id}
    }).then((resp: angular.IHttpPromiseCallbackArg<Order>) => {
      this.promoteToTop(order);
    });
  }

  refresh() {
    this.$http.get('/api/drink_queue')
      .then((resp: angular.IHttpPromiseCallbackArg<Order[]>) => {
        this.queue = resp.data;
        this.assignPositions();
      });
  }

  // Partial update of just one item, needed because App Engine is eventually
  // consistent.
  updateQueue(toUpdate: Order, updatedOrder: Order) {
    var index: number = null;
    updatedOrder.id = toUpdate.id;
    angular.forEach(this.queue, function(o, idx) {
      if (o.id == toUpdate.id) {
        index = idx;
      }
    });
    this.queue.splice(index, 1, updatedOrder);

    // Update the queue positions for drinks that are going to be made
    this.assignPositions();
  }

  promoteToTop(toTop: Order) {
    var index: number = null;
    angular.forEach(this.queue, function(o, idx) {
      if (o.id == toTop.id) {
        index = idx;
      }
    });
    this.queue.splice(index, 1);
    this.queue.splice(0, 0, toTop);

    // Update the queue positions for drinks that are going to be made
    this.assignPositions();
  }

  assignPositions() {
    var position: number = 0;
    for (var i = 0; i < this.queue.length; i++) {
      if (this.queue[i].approved) {
        if (this.queue[i].progress_percent > 0) {
          this.queue[i].position = '!';
        } else {
          this.queue[i].position = ++position;
        }
      } else {
        this.queue[i].position = null;
      }
    }
  }
}

var n8Admin = angular.module('n8Admin', ['ngMaterial', 'nebree8.drinks']);
n8Admin.controller('n8AdminCtrl', n8AdminCtrl);
