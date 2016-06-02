(function() {
  'use strict';

  angular
    .module('app')
    .factory('ServerService', ServerService);

  ServerService.$inject = ['$http', '$rootScope'];

  function ServerService($http, $rootScope) {
    var self = this;
    self.sendPost = sendPost;

    function sendPost(param, url, successMessage, failureMessage ) {
      $http.post(url, param)
        .success(function (data) {
          $rootScope.$broadcast(successMessage, data);
        })
        .error(function (data) {
          $rootScope.$broadcast(failureMessage, data)
        });

    }

    return self;
  }
})();
