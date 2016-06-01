(function() {
  'use strict';

  angular
    .module('app')
    .controller('LogInController', LogInController);

  LogInController.$inject = ['$scope', '$rootScope', '$state', 'ServerService', 'localStorageService'];

  function LogInController($scope, $rootScope, $state, ServerService, localStorageService) {
    // TODO: uncomment on server
    //var splitUrl = location.href.split('//');
    //var rhs = splitUrl[1];
    //console.log('rhs: ' + rhs)
    //if (rhs[0] === 'w' && rhs[1] === 'w' && rhs[2] === 'w' && rhs[3] === '.') {
    //  location.href = 'http://anthonyraltieri.com';
    //}

    var vm = this;
    
    console.log('========================================');
    console.log('this is our test');
    console.log('localStorageService.isSupported: ' + localStorageService.isSupported);
    console.log('localStorageService.cookie.isSupported: ' + localStorageService.cookie.isSupported);
    console.log('========================================');

    // Set local storage and cookie prefix
    localStorageService.set('cse136team10');

    // Activate log in mode for display
    activateModeLogIn();

    // Hide navbar
    $rootScope.$broadcast('hide-nav');

    vm.modeLogIn = true;
    vm.modeSignUp = false;

    // Functions
    vm.submitLogin = submitLogin;
    vm.goToSignUp = goToSignUp;
    vm.goToLogIn = goToLogIn;
    vm.submitSignUp = submitSignUp;

    // Objects Initialization
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

    document.onkeydown = function(event) {
      // If enter is pressed
      if (event.keyCode === 13) {
        if (vm.modeLogIn) {
          // submit log in
          vm.submitLogin(vm.login);
        } else {
          // submit sign up
          vm.submitSignUp(vm.signup)
        }
      }
    };

    // Function implementations
    function initLogin() {
      vm.login = {
        username: '',
        password: ''
      };
    }

    function initSignup() {
      vm.signup = {
        username: '',
        password1: '',
        password2: '',
        firstname: '',
        lastname: ''
      };
    }

    function submitLogin(input) {
      console.log("in submit login");
      if (!localStorageService.cookie.isSupported) {
        console.log("entered if");
        humane.log('You need javascript and cookies enabled', {addCls: 'humane-flatty-info'});
        $state.go('login'); 
        return;
      }

      if (input.username.trim().length === 0) {
        humane.log('Enter a username', {addCls: 'humane-flatty-info'});
        return;
      }
      if (input.password.trim().length === 0) {
        humane.log('Enter a password', {addCls: 'humane-flatty-info'});
        return;
      }


      var form = {
        username: input.username.trim().toLocaleLowerCase(),
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
      if (!input.username || input.username.trim().length === 0) {
        // Do something, probably toast
        humane.log('You need to enter a username', {addCls: 'humane-flatty-info'});
        console.log('No username content');
        return;
      }
      if (!input.password1 || input.password1.trim().length === 0) {
        // Do something, probably toast
        humane.log('You need to enter a password', {addCls: 'humane-flatty-info'});
        console.log('No password1 content');
        return;
      }
      if (!input.password2 || input.password2.trim().length === 0) {
        // Do something, probably toast
        humane.log('You need to confirm the password', {addCls: 'humane-flatty-info'});
        console.log('No password2 content');
        return;
      }
      if (!input.firstname || input.firstname.trim().length === 0) {
        // Do something, probably toast
        humane.log('You need to enter your First Name', {addCls: 'humane-flatty-info'});
        console.log('No firstname content');
        return;
      }
      if (!input.lastname || input.lastname.trim().length === 0) {
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
        username: input.username.trim().toLocaleLowerCase(),
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
      initLogin();
      initSignup();
      activateModeLogIn();
    }

    function goToSignUp() {
      initLogin();
      initSignup();
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

    localStorageService.clearAll();

    // Watchers

    $scope.$on(ROUTE.LOGIN_SUCCESS, function(event, data) {
      console.log(event);
      console.log('msg: ' + data.msg);
      console.log('data');
      console.log(data);
      if (data.msg === "Couldn't find one user") {
        humane.log('No account found for these credentials', {addCls: 'humane-flatty-log'});
        return;
      }
      localStorageService.cookie.clearAll();
      if (data.success) {
        if (localStorageService.isSupported) {
          var localUser = localStorageService.get('username');
          if (localUser != data.user.username) {
            localStorageService.clearAll();
          }
          localStorageService.set('username', data.user.username);
        }
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
      humane.log('Error logging in, try again', {addCls: 'humane-flatty-error'});
      console.log(event);
      console.log('msg: ' + data.msg);
    });

    $scope.$on(ROUTE.SIGNUP_SUCCESS, function(event, data) {
      console.log(event);
      console.log('msg: ' + data.msg);

      goToLogIn();

    });
    $scope.$on(ROUTE.SIGNUP_FAIL, function(event, data) {
      console.log(event);
      console.log('msg: ' + data.msg);
    });

  }
})();