(function() {
  'use strict';

  angular
    .module('app')
    .controller('LogInController', LogInController);

  LogInController.$inject = ['$scope', '$rootScope', '$state', 'ServerService', 'localStorageService'];

  function LogInController($scope, $rootScope, $state, ServerService, localStorageService) {
    // Check to make sure javascript and cookies are enabled
    localStorageService.cookie.set('checkForCookiesAndJavascript', 'cse136');
    var cookie = localStorageService.cookie.get('checkForCookiesAndJavascript');
    var cookieCheck = {cookiesEnabled: false}
    console.log('cookie: ' + cookie);
    //if (cookie) {
    //  cookieCheck.cookiesEnabled = true;
    //} else {
    //  ServerService.sendPost(cookieCheck,
    //    ROUTE.ENABLE_COOKIE_PAGE,
    //    ROUTE.ENABLE_COOKIE_PAGE_SUCCESS,
    //    ROUTE.ENABLE_COOKIE_PAGE_FAIL
    //  );
    //}

    if (localStorageService.cookie.get('goToDashboard')) {
      $state.go('dashboard');
    }

    var vm = this;

    vm.modeLogIn = true;
    vm.modeSignUp = false;

    // Functions
    vm.submitLogin = submitLogin;
    vm.goToSignUp = goToSignUp;
    vm.goToLogIn = goToLogIn;
    vm.submitSignUp = submitSignUp;

    // Objects
    vm.login = {
      username: '',
      password: ''
    };
    vm.signup = {
      username: '',
      password1: '',
      password2: '',
      firstname: '',
      lastname: ''
    };
    activateModeLogIn();

    // Hide navbar
    $rootScope.$broadcast('hide-nav');

    function submitLogin(input) {
      var form = {
        username: input.username.trim('').toLocaleLowerCase(),
        password: input.password
      };
      console.log(form);
      ServerService.sendPost(form,
        ROUTE.LOGIN,
        ROUTE.LOGIN_SUCCESS,
        ROUTE.LOGIN_FAIL
      );
    }

    function submitSignUp(input) {
      if(!input) {
        // Do something, probably toast
        humane.log('You need to enter a username', {addCls: 'humane-flatty-info'});
        console.log('No username content');
        return;
      }
      // Make sure there is content in all of the fields
      if (!input.username || input.username.trim('').length === 0) {
        // Do something, probably toast
        humane.log('You need to enter a username', {addCls: 'humane-flatty-info'});
        console.log('No username content');
        return;
      }
      if (!input.password1 || input.password1.trim('').length === 0) {
        // Do something, probably toast
        humane.log('You need to enter a password', {addCls: 'humane-flatty-info'});
        console.log('No password1 content');
        return;
      }
      if (!input.password2 || input.password2.trim('').length === 0) {
        // Do something, probably toast
        humane.log('You need to confirm the password', {addCls: 'humane-flatty-info'});
        console.log('No password2 content');
        return;
      }
      if (!input.firstname || input.firstname.trim('').length === 0) {
        // Do something, probably toast
        humane.log('You need to enter your First Name', {addCls: 'humane-flatty-info'});
        console.log('No firstname content');
        return;
      }
      if (!input.lastname || input.lastname.trim('').length === 0) {
        // Do something, probably toast
        humane.log('You need to enter your Last Name', {addCls: 'humane-flatty-info'});
        console.log('No lastname content');
        return;
      }
      // Make sure the passwords match
      if (input.password1 != input.password2) {
        // Do something, probably toast
        humane.log("Your passwords don't match!", {addCls: 'humane-flatty-info'});
        console.log("Passwords don't match");
        return;
      }
      var data = {
        username: input.username.trim('').toLocaleLowerCase(),
        password: input.password1,
        name: input.firstname,
        lastname: input.lastname
      };
      ServerService.sendPost(data,
        ROUTE.SIGNUP,
        ROUTE.SIGNUP_SUCCESS,
        ROUTE.SIGNUP_FAIL
      );
    }

    function goToLogIn() {
      activateModeLogIn();
    }

    function goToSignUp() {
      console.log('in goToSignUp');
      activateModeSignUp();
    }

    function activateModeLogIn() {
      vm.modeLogIn = true;
      vm.modeSignUp = false;
    }

    function activateModeSignUp() {
      vm.modeLogIn = false;
      vm.modeSignUp = true;
    }


    // Watchers

    $scope.$on(ROUTE.LOGIN_SUCCESS, function(event, data) {
      console.log(event);
      console.log('msg: ' + data.msg);
      console.log('data');
      console.log(data);
      if (data.success) {
        localStorageService.cookie.set('username', data.user.username);
        $rootScope.$broadcast('show-nav');
        $state.go('dashboard');
      } else {
        // Couldn't find the user
        // TODO: toast or something
        return;
      }
    });
    $scope.$on(ROUTE.LOGIN_FAIL, function(event, data) {
      console.log(event);
      console.log('msg: ' + data.msg);
    });

    $scope.$on(ROUTE.SIGNUP_SUCCESS, function(event, data) {
      console.log(event);
      console.log('msg: ' + data.msg);

      // Log them in
      localStorageService.cookie.set('username', data.username)
      $rootScope.$broadcast('show-nav');
      $state.go('dashboard');
    });
    $scope.$on(ROUTE.SIGNUP_FAIL, function(event, data) {
      console.log(event);
      console.log('msg: ' + data.msg);
    });

  }
})();