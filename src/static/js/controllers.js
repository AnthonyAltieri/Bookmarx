'use strict';

angular.module('BookMarx.controllers', [])

.controller('NavCtrl', function ($rootScope, $scope, initFolders) {
    vm = this;


    $rootScope.nav = {};
    $rootScope.nav.isSliderShowing = false;

    vm.navSlider = document.getElementById('nav__slider');
    vm.hideNavSlider = hideNavSlider;
    vm.showNavSlider = showNavSlider;

    console.log('In NavCtrl')

    function hideNavSlider (navSlider) {
        navSlider.classList.remove('nav__slider-show');
        navSlider.classList.add('nav__slider-hide');
        $rootScope.nav.isSliderShowing = false;
    }

    function showNavSlider (navSlider) {
        navSlider.classList.remove('nav__slider-hide');
        navSlider.classList.add('nav__slider-show');
        $rootScope.nav.isSliderShowing = true;
    }

    $scope.addBookmark = function () {
        if (!$rootScope.isSliderShowing) {
            vm.showNavSlider(vm.navSlider)
        }
    };

    $scope.cancleAddBookmark = function () {
        if ($rootScope.nav.isSliderShowing) {
            vm.hideNavSlider(vm.navSlider);
        }

    };

    $scope.folders = initFolders.init();
    console.log($scope.folders);

})

.controller('StageCtrl', function ($rootScope, $scope, initFolders) {
    const vm = this;

    $scope.clearFilter = function () {
        $scope.filter = '';
        document.getElementById('filter').focus();

    };

    $scope.clickStar = function (bookmark) {
        bookmark.starActive = !bookmark.starActive;
    };



    $scope.folders = initFolders.init();
    console.log($scope.folders);
    $rootScope.folders = vm.folders;
    $rootScope.$broadcast('init-folders');

    // Default active folder is General
    $scope.activeFolder = $scope.folders[0];

    $scope.selectFolder = function (folder) {
        if (folder.isActive) return;
        $scope.activeFolder = $scope.folders[folder.idx];
        for (var i = 0 ; i < $scope.folders.length ; i++) {
            $scope.folders[i].isActive = i === folder.idx;
        }
    };



});

