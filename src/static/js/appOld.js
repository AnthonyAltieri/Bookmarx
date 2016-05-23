angular.module('BookMarx', ['BookMarx.controllers', 'BookMarx.services', 'ngRoute'])

.config(function ($routeProvider) {
   $routeProvider
       .when('/dash', {
           controller: 'DashCtrl',
           templateUrl: 'templates/dashboard.html'
       })
       .otherwise({ redirectTo: '/dash' });
});