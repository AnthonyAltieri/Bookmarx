(function () {
  'use strict';

  angular
    .module('app', ['ui.router', 'LocalStorageModule'])
    .run(function($http) {
      $http.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    })
    .config(['localStorageServiceProvider', function(localStorageServiceProvider){
      localStorageServiceProvider.setPrefix('cse136team10');
    }])
    .config(config);


  function config($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/login');

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: '/static/templates/login.html',
        controller: 'LogInController',
        controllerAs: 'vm'
      })
      .state('dashboard', {
        url: '/dashboard',
        templateUrl: '/static/templates/dashboard.html',
        controller: 'DashboardController',
        controllerAs: 'vm'
      })
  }
})();