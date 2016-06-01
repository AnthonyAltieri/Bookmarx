(function (){
  'use strict';

  angular
    .module('app')
    .factory('UtilityService', UtilService);

  UtilService.$inject = [];

  function UtilService() {
    var self = this;

    self.hasContent = hasContent;
    self.prettyDate = prettyDate;

    function hasContent(text) {
      return (text.trim('').length > 0)
    }

    function prettyDate(date) {
      var year = date.getYear() + 1900;
      var month = date.getMonth();
      var day = date.getDay();

      return ('' + year + '-' + month + '-' + day);
    }

    return self;
  }
})();