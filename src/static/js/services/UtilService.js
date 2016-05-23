(function (){
  'use strict';

  angular
    .module('app')
    .factory('UtilService', UtilService);

  function UtilService() {
    var self = this;

    self.hasContent = hasContent;

    function hasContent(text) {
      return (text.trim('').length > 0)
    }

    return self;
  }
});