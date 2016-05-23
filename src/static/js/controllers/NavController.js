(function() {
  'use strict';

  angular
    .module('app')
    .controller('NavController', NavController);

  NavController.$inject = ['$rootScope', '$scope','FolderService'];

  function NavController($rootScope, $scope, FolderService) {
    console.log('In NavigationController');
    $scope.hideNav = true;

    // Functions
    $scope.hideNavSlider = hideNavSlider;
    $scope.showNavSlider = showNavSlider;
    $scope.addBookmark = addBookmark;
    $scope.saveBookmark = saveBookmark;
    $scope.cancelAddBookmark = cancelAddBookmark;
    $rootScope.loggedIn = loggedIn;
    $rootScope.loggedOut = loggedout;

    // Objects

    // Nav
    $rootScope.nav = {};
    $rootScope.nav.isSliderShowing = false;

    $scope.add = {
      name: '',
      url: '',
      tags: '',
      folder: ''
    };

    $scope.navSlider = document.getElementById('nav__slider');

    function hideNavSlider(navSlider) {
      $scope.navSlider.classList.remove('nav__slider-show');
      $scope.navSlider.classList.add('nav__slider-hide');
      $rootScope.nav.isSliderShowing = false;
    }

    function showNavSlider(navSlider) {
      navSlider.classList.remove('nav__slider-hide');
      navSlider.classList.add('nav__slider-show');
      $rootScope.nav.isSliderShowing = true;
    }

    function addBookmark(add) {
      console.log('in addBookmark');
      if (!$rootScope.isSliderShowing) {
        $scope.showNavSlider($scope.navSlider)
      }
    }

    function saveBookmark() {
      var data = { bookmark: $scope.add };
      $rootScope.$broadcast('add-bookmark', data);
    }

    function cancelAddBookmark() {
      if ($rootScope.nav.isSliderShowing) {
        $scope.hideNavSlider($scope.navSlider);
      }
    }

    function loggedIn() {
      $scope.hideNav = false;
      $rootScope.$broadcast('show-nav');
    }

    function loggedout() {
      $scope.hideNav = true;
      $rootScope.$broadcast('hide-nav');
    }

    $rootScope.$on('hide-nav', function() {
      var content = document.getElementById('content');
      content.classList.remove('no-nav');
      content.classList.add('has-nav');
      $scope.hideNav = true;
    });

    $rootScope.$on('show-nav', function() {
      var content = document.getElementById('content');
      content.classList.remove('has-nav');
      content.classList.add('no-nav');
      $scope.hideNav = false;
    });

    $rootScope.$on('added-bookmark', function(data) {
      hideNavSlider($scope.navSlider);
    })
  }

})();
