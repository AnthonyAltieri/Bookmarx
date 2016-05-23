(function() {
  'use strict';

  angular
    .module('app')
    .controller('DashboardController', DashboardController);


  DashboardController.$inject = ['$rootScope', '$scope', 'FolderService', 'localStorageService', 'ServerService'];

  function DashboardController($rootScope, $scope, FolderService, localStorageService, ServerService) {
    const vm = this;

    if (localStorageService.get('username') === null) {
      // TODO: logout
    }

    // Functions
    vm.clearFilter = clearFilter;
    vm.clickStat = clickStar;
    vm.selectFolder = selectFolder;
    vm.beginCreateFolder = beginCreateFolder;
    vm.clickOverlay = clickOverlay;

    // Objects
    vm.user = {};
    vm.user.name = localStorageService.get('username');
    vm.user.noFolderBookmarks = [];
    vm.user.folderHM = {};

    // UI Flag Inits
    vm.showOverlay = false;


    ServerService.sendPost({username: vm.user.name},
      ROUTE.GET_FOLDERS,
      ROUTE.GET_FOLDERS_SUCCESS,
      ROUTE.GET_FOLDERS_FAIL
    );



    // Function Implementation
    function clearFilter() {
      vm.filter = '';
      document.getElementById('filter').focus();
    }

    function clickStar(bookmark) {
      bookmark.starActive = !bookmark.starActive;
    }

    function selectFolder(folder) {
      if (folder.isActive) return;
      vm.user.activeFolder = vm.user.folders[folder.idx];
      for (var i = 0 ; i < vm.user.folders.length ; i++) {
        vm.user.folders[i].isActive = i === folder.idx;
      }
    }

    function beginCreateFolder() {
      vm.showOverlay = true;
    }

    function clickOverlay() {
      if (vm.showOverlay) {
        vm.showOverlay = false;
      }
    }

    // Watchers
    $scope.$on(ROUTE.GET_FOLDERS_SUCCESS, function(data) {
      var rows = data.rows;
      console.log('Retrieved ' + rows.length + ' folders for user');
      var allFolder = {
        name: 'all',
        isActive: false,
        bookmarks: []
      };
      for (var i = 0 ; i < rows.length ; i++) {
        var folder = {};
        folder.name = rows[i].name;
        folder.isActive = false;
        folder.bookmarks = [];
        vm.user.folderHM[folder.name] = folder;
        vm.user.folders.push(folder);
      }
      ServerService.sendPost({username: vm.user.name},
        ROUTE.GET_BOOKMARKS,
        ROUTE.GET_BOOKMARKS_SUCCESS,
        ROUTE.GET_BOOKMARKS_FAIL
      );
    });
    $scope.$on(ROUTE.GET_FOLDERS_FAIL, function() {
      // TODO: make this more robust, possibly log the user out
      console.log('Failed to retrieve folders');
    });

    $scope.$on(ROUTE.GET_BOOKMARKS_SUCCESS , function(data) {
      var rows = data.rows;
      for (var i = 0 ; i < rows.length ; i++) {
        var bookmark = rows[i];
        if (bookmark.folder === null) {
          vm.noFolderBookmarks.push(bookmark);
        } else {
          if (typeof vm.user.folderHM[bookmark.folder] === 'undefined') {
            // Something went wrong, this should never happen, look over the
            // workflow that exists to add bookmarks. For now just silently fail
            console.log('this should never happen');
          } else {
            var folder = vm.user.folderHM[bookmark.folder];
            folder.bookmarks.push(bookmark);
          }
        }
        vm.user.folderHM['all'].push(bookmark);
      }
    });

    $scope.$on(ROUTE.GET_BOOKMARKS_FAIL, function() {
      // TODO: make this more robust, possibly log the user out
      console.log('Failed to retrieve bookmarks');
    });

    $rootScope.$on('add-bookmark', function(obj) {
      var bookmark = obj.bookmark;
      var data = {
        bookmark: bookmark,
        username: vm.user.name
      };
      ServerService.sendPost(data,
        ROUTE.ADD_BOOKMARK,
        ROUTE.ADD_BOOKMARK_SUCCESS,
        ROUTE.ADD_BOOKMARK_FAIL
      );
    });

    $scope.$on(ROUTE.ADD_BOOKMARK_SUCCESS, function(bookmark) {
      if (bookmark.folder === null) {
        vm.user.noFolderBookmarks.push(bookmark);
      } else {
        if (typeof vm.user.folderHM[bookmark.folder] === 'undefined') {
          // This should never happen but silently fail
          console.log('this should never happen')
        } else {
          var folder = vm.user.folderHM[bookmark.folder];
          folder.bookmarks.push(bookmark);
        }
      }
      vm.user.folderHM['all'].push(bookmark);
      $rootScope.$broadcast('added-bookmark', {});
    })

  }
})();