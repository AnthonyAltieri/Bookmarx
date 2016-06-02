(function() {
  'use strict';

  angular
    .module('app')
    .controller('NavController', NavController);

  NavController.$inject = ['$rootScope', '$scope', '$state', '$document', 'localStorageService', 'ServerService'];

  function NavController($rootScope, $scope, $state, $document, localStorageService, ServerService) {
    $scope.hideNav = true;
    $scope.editPasswordMode =  false;
    $scope.hideDashboard = true;

    // Functions
    $scope.submitPassword = submitPassword;
    $scope.closePasswordForm = closePasswordForm;
    $scope.editPassword = editPassword;
    $scope.hideNavSlider = hideNavSlider;
    $scope.showNavSlider = showNavSlider;
    $scope.flipNavContainer = clickBox;
    $scope.addBookmark = addBookmark;
    $scope.logout = logout;
    $scope.saveBookmark = saveBookmark;
    $scope.cancelAddBookmark = cancelAddBookmark;
    $rootScope.loggedIn = loggedIn;
    $rootScope.loggedOut = loggedout;


    // Objects
    $scope.password = {
      username: '',
      currentPassword: '',
      password1: '',
      password2: ''
    };

    // Nav
    $scope.mode = {};
    $scope.mode.addBookmark = false;


    window.onresize = function () {
      adjustWindowMode();
    };
    adjustWindowMode();


    function adjustWindowMode() {
      if (window.innerWidth > 990) {
        $scope.mode.mobileNav = false;
        $scope.mode.desktopNav = true;
        $scope.hideHamburger = true;
      }
      else {
        $scope.mode.mobileNav = true;
        $scope.mode.desktopNav = false;
        $scope.hideHamburger = false;
      }
    }

    function logout() {
      loggedout();
      localStorageService.clearAll();
      localStorageService.cookie.clearAll();
      $state.go('login');
    }


    function clickBox() {
      $scope.mode.addBookmark = false;
      if($scope.mode.mobileNav) {
        $scope.mode.mobileNav = false;
        $scope.mode.desktopNav = true;
      } else {
        $scope.mode.mobileNav = true;
        $scope.mode.desktopNav = false;
      }
    }

    function editPassword(){
      $scope.editPasswordMode = true;
    }

    function closePasswordForm(){
      clearChangePW();
      $scope.editPasswordMode = false;
    }

    function submitPassword(data){
      console.log(data);
      if(!data.username || data.username.trim().length === 0){
        humane.log('You need to enter a username', {addCls: 'humane-flatty-info'});
        console.log('No username content');
        return;
      }
      if(!data.password1 || data.password1.trim().length === 0){
        humane.log('You need to enter a password', {addCls: 'humane-flatty-info'});
        return;
      }
      if(!data.currentPassword || data.currentPassword.trim().length === 0){
        humane.log('You need to enter a password', {addCls: 'humane-flatty-info'});
        return;
      }
      else if(!data.password2 || data.password2.trim().length === 0) {
        humane.log('You need to confirm a password', {addCls: 'humane-flatty-info'});
        return;
      }
      else if (data.password1 != data.password2) {
        // Do something, probably toast
        humane.log("Your passwords don't match!", {addCls: 'humane-flatty-info'});
        console.log("Passwords don't match");
        return;
      }

      var postData ={
        username : data.username,
        currentPassword : data.currentPassword,
        newPassword: data.password1
      };

      ServerService.sendPost(postData,
        ROUTE.CHANGE_PW,
        ROUTE.CHANGE_PW_SUCCESS,
        ROUTE.CHANGE_PW_FAIL
      );
    }

    $scope.$on(ROUTE.CHANGE_PW_FAIL, function(event, data) {
      humane.log('Error changing password, try again', {addCls: 'humane-flatty-error'});
    });

    $scope.$on(ROUTE.CHANGE_PW_SUCCESS, function(event, data) {
      console.log(data);
      if(data.msg === 'Could not find user') {
        humane.log('Wrong credentials, please try again', {addCls: 'humane-flatty-error'});
      }
      if(data.msg === 'Password successfully changed'){
        humane.log('Password succesfully changed', {addCls: 'humane-flatty-error'});
        clearChangePW();
        $scope.editPasswordMode = false;
      }
    });

    function clearChangePW(){
      $scope.password = {
        username: '',
        currentPassword: '',
        password1: '',
        password2: ''
      };
    }

    $rootScope.nav = {};
    $rootScope.nav.isSliderShowing = false;

    $scope.add = {
      name: '',
      url: '',
      tags: '',
      folder: '',
      description: ''
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
      $scope.mode.addBookmark = true;
      if (window.innerWidth <= 990) clickBox();
      if (!$rootScope.isSliderShowing) {
        $scope.showNavSlider($scope.navSlider)
      }
    }

    function saveBookmark() {
      if (!$scope.add.url || $scope.add.url.trim('').length === 0 || !checkURL($scope.add.url)) {
        humane.log('You must have a valid url (example: http://google.com)');
        return;
      }
      if (!$scope.add.tag1 || $scope.add.tag1.trim('').length === 0) {
        $scope.add.tag1 = 'null';
      }
      if (!$scope.add.tag2 || $scope.add.tag2.trim('').length === 0) {
        $scope.add.tag2 = 'null';
      }
      if (!$scope.add.tag3 || $scope.add.tag3.trim('').length === 0) {
        $scope.add.tag3 = 'null';
      }
      if (!$scope.add.tag4 || $scope.add.tag4.trim('').length === 0) {
        $scope.add.tag4 = 'null';
      }
      if (!$scope.add.description || $scope.add.description.trim('').length === 0) {
        $scope.add.description = 'none';
      }
      var bookmark = {
        name: $scope.add.name,
        title: $scope.add.title,
        description: $scope.add.description,
        tag1: $scope.add.tag1,
        tag2: $scope.add.tag2,
        tag3: $scope.add.tag3,
        tag4: $scope.add.tag4,
        folder: $scope.add.folder,
        url: $scope.add.url,
        star: '0',
        counter: 0
      };
      var data = { bookmark: bookmark };
      $rootScope.$broadcast('add-bookmark', data);
      $scope.add.tag1 = '';
      $scope.add.tag2 = '';
      $scope.add.tag3 = '';
      $scope.add.tag4 = '';
      $scope.add.title = '';
      $scope.add.url = '';
      $scope.add.description = '';
    }

    function cancelAddBookmark() {
      if ($rootScope.nav.isSliderShowing) {
        $scope.hideNavSlider($scope.navSlider);
      }
      $scope.mode.addBookmark = false;
    }

    function loggedIn() {
      $scope.hideNav = false;
      $rootScope.$broadcast('show-nav');
    }

    function loggedout() {
      $scope.hideNav = true;
      $rootScope.$broadcast('hide-nav');
    }

    function prettyDate(date) {
      var year = date.getYear() + 1900;
      var month = date.getMonth();
      var day = date.getDate();

      return ('' + year + '-' + month + '-' + day);
    }


    function checkURL(url) {
      var chars = url.split('');
      if ((chars[0].toLowerCase() != 'h' && chars[1].toLowerCase() != 't' && chars[2].toLowerCase() != 't'
          && chars[3].toLowerCase() != 'p') && (chars[0].toLowerCase() != 'w' && chars[1].toLowerCase() != 'w' && chars[2].toLowerCase() != 'w')) {
        return false;
      }
      var urlExpression = /((http|https)\:\/\/)?[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\&\.\/\?\:@\-_=#])*/;
      var urlRegex = new RegExp(urlExpression);

      return urlRegex.test(url);
    }

    $rootScope.$on('hide-nav', function(event, data) {
      var content = document.getElementById('content');
      content.classList.remove('no-nav');
      content.classList.add('has-nav');
      $scope.hideNav = true;
    });

    $rootScope.$on('show-nav', function(event, data) {
      var content = document.getElementById('content');
      content.classList.remove('has-nav');
      content.classList.add('no-nav');
      $scope.hideNav = false;
    });

    $rootScope.$on('added-bookmark', function(event, data) {
      hideNavSlider($scope.navSlider);
      $scope.mode.addBookmark = false;
    });

    $rootScope.$on('update-folders', function(event, data) {
      var folders = [];
      for (var i = 0 ; i < data.folders.length ; i++) {
        var folder = data.folders[i];
        if (folder.name != 'all') {
          folders.push(folder);
        }
      }
      $scope.add.folders = folders;
    });
  }

})();
