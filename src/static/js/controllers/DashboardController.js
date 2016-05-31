(function() {
  'use strict';

  angular
    .module('app')
    .controller('DashboardController', DashboardController);


  DashboardController.$inject = ['$rootScope', '$scope', '$state', '$interval', 'localStorageService',
                                 'ServerService', 'FilterService', 'StorageService', 'ServiceWorker'];

  function DashboardController($rootScope, $scope, $state, $interval, localStorageService, ServerService,
                               FilterService, StorageService, ServiceWorker) {
    var vm = this;

    // Functions
    vm.clearSearch = clearSearch;
    vm.clickStar = clickStar;
    vm.selectFolder = selectFolder;
    vm.beginCreateFolder = beginCreateFolder;
    vm.clickOverlay = clickOverlay;
    vm.addFolder = addFolder;
    vm.deleteFolder = deleteFolder;
    vm.deleteBookmark = deleteBookmark;
    vm.goToBookmark = goToBookmark;
    vm.exportFolder = exportFolder;
    vm.exportBookmark = exportBookmark;
    vm.editBookmark = editBookmark;
    vm.saveChanges = saveChanges;
    vm.sortTitle = sortTitle;
    vm.sortUrl = sortUrl;
    vm.sortLastVisit = sortLastVisit;
    vm.sortCreationDate = sortCreationDate;
    vm.sortCounter = sortCounter;
    vm.onInputChosen = onInputChosen;
    vm.onInputBookmarkChosen = onInputBookmarkChosen;

    // Warn user if cookies are not enabled
    vm.warnCookies = !localStorageService.cookie.isSupported;

    // Set local storage and cookie prefix
    localStorageService.set('cse136team10');
    
    

    // Objects
    vm.user = {};
    vm.user.name = localStorageService.cookie.get('username');
    vm.user.noFolderBookmarks = [];
    vm.user.activeFolder = null;
    vm.user.folders = [];
    vm.user.folderHM = {};
    vm.folder = {};
    vm.folder.name = '';
    vm.session = {};
    vm.session.bookmarkHM = {};
    vm.bookmarkEdit = {};
    vm.bookmarkEditOriginal = {};
    vm.showRealFolderInput = false;
    vm.showRealBookmarkInput = false;

    // true = a->z ; false = z->a
    vm.user.lastTitleSort = false;
    // true = a->z ; false = z->a
    vm.user.lastUrlSort = false;
    // true = 0->9 ; false = 9->0
    vm.user.lastSortLastVisit = false;
    // true = 0->9 ; false = 9->0
    vm.user.lastSortCreationDate = false;
    // true = 0->9 ; false = 9->0
    vm.user.lastSortCounter = false;

    // UI flag initialization
    vm.showOverlay = false;
    vm.editBookmarkMode = false;

    // Show nav
    $rootScope.$broadcast('show-nav');
    var tryUsername = null;
    if (localStorageService.isSupported) {
      tryUsername = localStorageService.get('username');
    }
    if (localStorageService.cookie.isSupported) {
      tryUsername = localStorageService.cookie.get('username');
    }
    if (!tryUsername) {
      humane.log('You have been logged out, log back in', {addCls: 'humane-flatty-error'});
      $state.go('login');
      return;
    }

    // Get folders from local service if you can
    if (localStorageService.isSupported) {
      var localFolderHM = localStorageService.get('folderHM');
      var localFolders = localStorageService.get('folders');
      if (localFolderHM) vm.user.folderHM = localFolderHM;
      if (localFolders) vm.user.folders = localFolders;
    }
    // Query for folders
    ServerService.sendPost({username: vm.user.name},
      ROUTE.GET_FOLDERS,
      ROUTE.GET_FOLDERS_SUCCESS,
      ROUTE.GET_FOLDERS_FAIL
    );

    // Function Implementation
    function clearSearch() {
      vm.search = '';
      document.getElementById('filter').focus();
    }

    function clickStar(bookmark) {
      var data = {
        bookmark: bookmark,
        username: vm.cookies.username
      };

      ServerService.sendPost(data,
        ROUTE.STAR_BOOKMARK,
        ROUTE.STAR_BOOKMARK_SUCCESS,
        ROUTE.STAR_BOOKMARK_FAIL
      );
    }

    function selectFolder(folder) {
      console.log('selected folder');
      console.log(folder);
      if (folder.isActive) return;
      if (vm.user.activeFolder != null) {
        vm.user.activeFolder.isActive = false;
      }
      vm.user.activeFolder = vm.user.folderHM[folder.name];
      vm.user.activeFolder.isActive = true;
      console.log('in selectFolder');
      console.log('vm.user.folders');
      console.log(vm.user.folders);
    }

    function beginCreateFolder() {
      vm.showOverlay = true;
    }


    function clickOverlay() {
      if (vm.showOverlay) {
        vm.showOverlay = false;
      }
      if (vm.editBookmarkMode) {
        var diffKeys = diffKeysBookmark(vm.bookmarkEdit, vm.bookmarkEditOriginal);
        console.log('difKeys');
        console.log(diffKeys);
        for (var i = 0 ; i < diffKeys.length ; i++){
          var key = diffKeys[i];
          vm.bookmarkEdit[key] = vm.bookmarkEditOriginal[key];
        }
        vm.editBookmarkMode = false;
      }
    }

    function addFolder(name) {
      if (!name || name.trim('').length === 0) {
        humane.log('You need some content for your name', {addCls:'humane-flatty-error'});
        console.log('needs to have content');
        return;
      }

      vm.folder.name = '';

      var data = {};
      if (localStorageService.isSupported) {
        data.username = localStorageService.get('username');
      } else {
        data.username = localStorageService.cookie.get('username');
      }
      data.name = name;
      data.bookmarks = [];
      if (!data.username) {
        humane.log('Something went wrong, log in again', {addCls: 'humane-flatty-error'});
        $state.go('login');
      }
      ServerService.sendPost(data,
        ROUTE.ADD_FOLDER,
        ROUTE.ADD_FOLDER_SUCCESS,
        ROUTE.ADD_FOLDER_FAIL
      );
    }

    function deleteFolder() {
      if (vm.user.activeFolder.name === 'all') {
        humane.log("You can't delete all", {addCls: 'humane-flatty-error'});
        // Can't delete all
        return;
      }
      var data = {
        name: vm.user.activeFolder.name
      };
      if (localStorageService.isSupported) {
        data.username = localStorageService.get('username');
      } else {
        data.username = localStorageService.cookie.get('username');
      }
      ServerService.sendPost(data,
        ROUTE.DELETE_FOLDER,
        ROUTE.DELETE_FOLDER_SUCCESS,
        ROUTE.DELETE_FOLDER_FAIL
      );
    }

    function deleteBookmark(bookmark) {
      var data = {
        bookmark: bookmark
      };
      if (localStorageService.isSupported) {
        data.username = localStorageService.get('username');
      } else {
        data.username = localStorageService.cookie.get('username');
      }

      ServerService.sendPost(data,
        ROUTE.DELETE_BOOKMARK,
        ROUTE.DELETE_BOOKMARK_SUCCESS,
        ROUTE.DELETE_BOOKMARK_FAIL
      );
    }

    function prettyDate(date) {
      console.log('about to make this date pretty');
      console.log(date);
      console.log('here is the pretty one');
      console.log(date.split('T')[0]);
      return date.split('T')[0];
    }

    function goToBookmark(bookmark) {
      console.log('goToBookmark');
      var data = {
        bookmark: bookmark
      };
      ServerService.sendPost(data,
        ROUTE.USED_BOOKMARK,
        ROUTE.USED_BOOKMARK_SUCCESS,
        ROUTE.USED_BOOKMARK_FAIL
      );
      var url = bookmark.url;
      window.location.href = url;
    }

    function exportFolder() {
      if (vm.user.activeFolder.name === 'all') {
        humane.log('You cannot export all', {addCls: 'humane-flatty-error'});
        return;
      }
      var data = {
        name: vm.user.activeFolder.name
      };
      ServerService.sendPost(data,
        ROUTE.EXPORT_FOLDER,
        ROUTE.EXPORT_FOLDER_SUCCESS,
        ROUTE.EXPORT_BOOKMARK_FAIL
      );
    }

    function exportBookmark(bookmark) {
      var data = {
        title: bookmark.title,
      };
      ServerService.sendPost(data,
        ROUTE.EXPORT_BOOKMARK,
        ROUTE.EXPORT_BOOKMARK_SUCCESS,
        ROUTE.EXPORT_FOLDER_FAIL
      );
    }


    function editBookmark(bookmark) {
      vm.showOverlay = true;
      vm.editBookmarkMode = true;
      if (!bookmark.description || bookmark.description.trim().length === 0) {
        bookmark.description = '';
      }
      if (!isValidTag(bookmark.tag1)) {
        bookmark.tag1 = '';
      }
      if (!isValidTag(bookmark.tag2)) {
        bookmark.tag2 = '';
      }
      if (!isValidTag(bookmark.tag3)) {
        bookmark.tag3 = '';
      }
      if (!isValidTag(bookmark.tag4)) {
        bookmark.tag4 = '';
      }
      vm.bookmarkEditOriginal = JSON.parse(JSON.stringify(bookmark));
      vm.bookmarkEdit = bookmark;
      vm.bookmarkEdit.oldTitle = bookmark.title;
    }

    function diffKeysBookmark(b1, b2) {
      var diffVals = [];
      if (b1.title != b2.title) diffVals.push('title');
      if (b1.url!= b2.url) diffVals.push('url');
      if (b1.description!= b2.description) diffVals.push('description');
      if (b1.tag1 != b2.tag1) diffVals.push('tag1');
      if (b1.tag2 != b2.tag2) diffVals.push('tag2');
      if (b1.tag3 != b2.tag3) diffVals.push('tag3');
      if (b1.tag4 != b2.tag4) diffVals.push('tag4');
      if (b1.folder != b2.folder) diffVals.push('folder');
      return diffVals;
    }

    function saveChanges() {
      console.log('saveChanges');
      var bookmark = vm.bookmarkEdit;
      console.log('using this bookmark');
      console.log(bookmark);
      var data = {bookmark: bookmark};
      vm.editBookmarkMode = false;
      ServerService.sendPost(data,
        ROUTE.UPDATE_BOOKMARK,
        ROUTE.UPDATE_BOOKMARK_SUCCESS,
        ROUTE.UPDATE_BOOKMARK_FAIL
      )
    }

    //$interval(function() {
    //  var data = {username: vm.cookies.username}
    //  ServerService.sendPost(data,
    //    ROUTE.CHECK_SESSION,
    //    ROUTE.CHECK_SESSION_SUCCESS,
    //    ROUTE.CHECK_SESSION_FAIL
    //  );
    //
    //}, 10000);

    function isValidTag(tag) {
      return !(!tag || tag.trim('').length === 0 || tag === 'null' || tag === 'NULL'
      || tag === null);

    }

    function sortTitle() {
      // Last sort was a->z
      if (vm.user.lastTitleSort) {
        vm.user.lastTitleSort = false;
        vm.user.activeFolder.bookmarks = FilterService.aToZTitle(vm.user.activeFolder.bookmarks);
      } else {
        vm.user.lastTitleSort = true;
        vm.user.activeFolder.bookmarks = FilterService.zToATitle(vm.user.activeFolder.bookmarks);
      }
    }

    function sortUrl() {
      // Last sort was a->z
      if (vm.user.lastUrlSort) {
        vm.user.lastUrlSort= false;
        vm.user.activeFolder.bookmarks = FilterService.aToZUrl(vm.user.activeFolder.bookmarks);
      } else {
        vm.user.lastUrlSort= true;
        vm.user.activeFolder.bookmarks = FilterService.zToAUrl(vm.user.activeFolder.bookmarks);
      }
    }

    function sortLastVisit() {
      // Last sort was 0->9
      if (vm.user.lastSortLastVisit) {
        vm.user.lastSortLastVisit = false;
        vm.user.activeFolder.bookmarks = FilterService.zeroToNineLSortLastVisit(vm.user.activeFolder.bookmarks);
      } else {
        vm.user.lastSortLastVisit = true;
        vm.user.activeFolder.bookmarks = FilterService.nineToZeroLSortLastVisit(vm.user.activeFolder.bookmarks);
      }
    }

    function sortCreationDate() {
      if (vm.user.lastSortCreationDate) {
        vm.user.lastSortCreationDate = false;
        vm.user.activeFolder.bookmarks = FilterService.zeroToNineSortCreationDate(vm.user.activeFolder.bookmarks);
      } else {
        vm.user.lastSortCreationDate = true;
        vm.user.activeFolder.bookmarks = FilterService.nineToZeroSortCreationDate(vm.user.activeFolder.bookmarks);
      }
    }

    function sortCounter() {
      if (vm.user.lastSortCounter) {
        vm.user.lastSortCounter = false;
        vm.user.activeFolder.bookmarks = FilterService.zeroToNineSortCounter(vm.user.activeFolder.bookmarks);

      } else {
        vm.user.lastSortCounter = true;
        vm.user.activeFolder.bookmarks = FilterService.nineToZeroSortCounter(vm.user.activeFolder.bookmarks);
      }
    }

    function onInputChosen() {
      vm.showRealFolderInput = true;

    }

    function onInputBookmarkChosen() {
      vm.showRealBookmarkInput = true;
    }




    // Watchers
    $scope.$on(ROUTE.GET_FOLDERS_SUCCESS, function(event, data) {
      if (!data || data.error || !data.rows) {
        console.log('data');
        console.log(data);
        humane.log('Server error try again later', {addCls: 'humane-flatty-error'});
        $state.go('login');
        return;
      }
      var rows = data.rows;

      // If local storage has not already set the all folder make it an set it
      if (localStorageService.isSupported && !StorageService.getFolders()) {
        var allFolder = {
          name: 'all',
          isActive: true,
          bookmarks: []
        };
        vm.user.activeFolder = allFolder;
        vm.user.folders.push(allFolder);
        vm.user.folderHM['all'] = allFolder;
        for (var i = 0 ; i < rows.length ; i++) {
          var folder = {};
          folder.name = rows[i].name;
          folder.isActive = false;
          folder.bookmarks = [];
          vm.user.folderHM[folder.name] = folder;
          vm.user.folders.push(folder);
        }
      }


      ServerService.sendPost({username: vm.user.name},
        ROUTE.GET_BOOKMARKS,
        ROUTE.GET_BOOKMARKS_SUCCESS,
        ROUTE.GET_BOOKMARKS_FAIL
      );
    });

    $scope.$on(ROUTE.GET_FOLDERS_FAIL, function() {
      humane.log('Failed to retrieve folders, try to log in again', {addCls: 'humane-flatty-error'});
      $state.go('login');
    });

    $scope.$on(ROUTE.GET_BOOKMARKS_SUCCESS , function(event, data) {
      if (data.error) {
        humane.log('Server error try again later', {addCls: 'humane-flatty-error'})
        $state.go('login');
        return;
      }
      var rows = data.rows;
      vm.user.bookmarkHM = {};

      for (var i = 0 ; i < rows.length ; i++) {
        var bookmark = rows[i];

        // Create a bookmark hashmap
        vm.user.bookmarkHM[bookmark.title] = bookmark;

        // Create tags member array
        bookmark.tags = [];
        if (bookmark.tag1 !=  'null' && bookmark.tag1.trim('').length != 0) {
          bookmark.tags.push(bookmark.tag1);
        }
        if (bookmark.tag2 !=  'null' && bookmark.tag2.trim('').length != 0) {
          bookmark.tags.push(bookmark.tag2);
        }
        if (bookmark.tag3 !=  'null' && bookmark.tag3.trim('').length != 0) {
          bookmark.tags.push(bookmark.tag3);
        }
        if (bookmark.tag4 !=  'null' && bookmark.tag4.trim('').length != 0) {
          bookmark.tags.push(bookmark.tag4);
        }

        // Make sure star is a string
        var star = parseInt(bookmark.star) + '';
        bookmark.star = star;

        // Create a string for searching
        var searchstring = bookmark.title;
        for (var x = 0 ; x < bookmark.tags.length ; x++) {
          searchstring += (' ' + bookmark.tags[x] + ' ');
        }
        bookmark.searchstring = searchstring;

        // Make the dates pretty
        bookmark.creationDate = bookmark.creationDate.split('T')[0];
        bookmark.lastVisit = bookmark.lastVisit.split('T')[0];

        // Add the bookmark to it's respective folders
        if (bookmark.folder === null) {
          vm.noFolderBookmarks.push(bookmark);
        } else {
          if (typeof vm.user.folderHM[bookmark.folder] === 'undefined'
              || vm.user.folderHM[bookmark.folder] === null) {
          } else {
            var folder = vm.user.folderHM[bookmark.folder];
            folder.bookmarks.push(bookmark);
          }
        }
        vm.user.folderHM['all'].bookmarks.push(bookmark);
      }

      // Add to local storage
      StorageService.setFolders(vm.user.folders);
      StorageService.setFolderHM(vm.user.folderHM);
      StorageService.setBookmarkHM(vm.user.bookmarkHM);

      // Send a packet containing the new folders to the NavController
      var packet = {folders: vm.user.folders};
      $rootScope.$broadcast('update-folders', packet);
    });

    $scope.$on(ROUTE.GET_BOOKMARKS_FAIL, function(event, data) {
      humane.log('Failed to retrieve bookmarks, please log in again', {addCls: 'humane-flatty-error'});
      $state.go('login');
    });

    $rootScope.$on('add-bookmark', function(event, obj) {
      var bookmark = obj.bookmark;
      console.log(bookmark);

      if ((bookmark.url[0] === 'w') && (bookmark.url[1] === 'w') && (bookmark.url[2] === 'w')) {
        bookmark.url = 'http://' + bookmark.url;
      }

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

    $scope.$on(ROUTE.ADD_BOOKMARK_SUCCESS, function(event, data) {
      if (data.error) {
        humane.log('Server error try again later', {addCls: 'humane-flatty-error'})
        $state.go('login');
        return;
      }
      var bookmark = data.bookmark;
      if (!bookmark) {
        humane.log('This title has been already used, try another', {addCls: 'humane-flatty-error'});
        console.log('title taken');
        return;
      }
      bookmark.tags = [];
      if (bookmark.tag1 !=  'null' && bookmark.tag1 != null) {
        bookmark.tags.push(bookmark.tag1);
      }
      if (bookmark.tag2 !=  'null' && bookmark.tag2 != null) {
        bookmark.tags.push(bookmark.tag2);
      }
      if (bookmark.tag3 !=  'null' && bookmark.tag3 != null) {
        bookmark.tags.push(bookmark.tag3);
      }
      if (bookmark.tag4 !=  'null' && bookmark.tag4 != null) {
        bookmark.tags.push(bookmark.tag4);
      }

      // Make sure star is a string
      var star = parseInt(bookmark.star) + '';
      bookmark.star = star;

      // Create a string for searching
      var searchstring = bookmark.title;
      for (var i = 0 ; i < bookmark.tags.length ; i++) {
        searchstring += (' ' + bookmark.tags[i] + ' ');
      }
      bookmark.searchstring = searchstring;

      // Make the dates pretty
      var date = new Date();
      var prettyDateString = '' + (date.getYear() + 1900) + '-' + date.getMonth() + '-' +
        date.getDate();
      if (!bookmark.creationDate) {
        bookmark.creationDate = prettyDateString;
      } else {
        bookmark.creationDate = bookmark.creationDate.split('T')[0];
      }
      if (!bookmark.lastVisit) {
        bookmark.lastVisit = prettyDateString;
      } else {
        bookmark.lastVisit = bookmark.lastVisit.split('T')[0];
      }
      if (bookmark.folder.trim().length === '' || bookmark.folder === 'null' || !bookmark.folder) {
        vm.user.noFolderBookmarks.push(bookmark);
      } else {
        if (!vm.user.folderHM[bookmark.folder]) {
          // This should never happen but silently fail
          console.log('this should never happen');
          console.log('with folder name: ' + bookmark.folder);
          console.log('with vm.user.folderHM');
          console.log(vm.user.folderHM);
        } else {
          var folder = vm.user.folderHM[bookmark.folder];
          folder.bookmarks.push(bookmark);
        }
      }
      vm.user.folderHM['all'].bookmarks.push(bookmark);

      // Add to local storage
      StorageService.addBookmark(bookmark);

      $rootScope.$broadcast('added-bookmark', {});
    });

    $scope.$on(ROUTE.ADD_FOLDER_SUCCESS, function(event, data) {
      if (data.error) {
        humane.log('Server error try again later', {addCls: 'humane-flatty-error'})
        return;
      }
      var folder = data.folder;
      vm.user.folderHM[folder.name] = folder;
      vm.user.folders.push(folder);
      vm.clickOverlay();

      // Add to local storage
      StorageService.setFolders(vm.user.folders);
      StorageService.setFolderHM(vm.user.folderHM);

      var packet = {folders: vm.user.folders};
      $rootScope.$broadcast('update-folders', packet);
    });

    $scope.$on(ROUTE.DELETE_FOLDER_SUCCESS, function(event, data) {
      if (data.error) {
        humane.log('Server error try again later', {addCls: 'humane-flatty-error'})
        $state.go('login');
        return;
      }
      console.log('in DELETE_FOLDER_SUCC');
      console.log('data');
      console.log(data);
      var folder = data.folder;
      vm.user.folderHM[folder.name] = null;
      for (var i = 0 ; i < vm.user.folders.length ; i++) {
        var focus = vm.user.folders[i];
        if (focus.name === folder.name) {
          vm.user.folders.splice(i, 1);
          break;
        }
      }
      var allFolder = vm.user.folderHM['all'];
      for (var i = 0 ; i < allFolder.bookmarks.length ; i++) {
        var focus = allFolder.bookmarks[i];
        if (focus.folder === folder.name) {
          allFolder.bookmarks.splice(i, 1);
        }
      }

      for (var i = 0 ; i < folder.bookmarks.length ; i++) {
        var focus = folder.bookmarks[i];
        StorageService.deleteBookmark(focus);
      }

      var packet = {folders: vm.user.folders};
      $rootScope.$broadcast('update-folders', packet);
      vm.user.activeFolder = vm.user.folderHM['all'];
      vm.user.activeFolder.isActive = true;
    });

    $scope.$on(ROUTE.DELETE_FOLDER_FAIL, function(event, data) {
    });

    $scope.$on(ROUTE.DELETE_BOOKMARK_SUCCESS, function(event, data) {
      if (data.error) {
        humane.log('Server error try again later', {addCls: 'humane-flatty-error'})
        $state.go('login');
        return;
      }
      var bookmark = data.bookmark;


      var allFolder = vm.user.folderHM['all'];
      for (var i = 0 ; i < allFolder.bookmarks.length ; i++) {
        var focus = allFolder.bookmarks[i];
        if (focus.title === bookmark.title) {
          allFolder.bookmarks.splice(i, 1);
          break;
        }
      }
      var folderName = bookmark.folder;
      if (!folderName || folderName === 'null' || folderName === 'NULL'
          || folderName === null || folderName === '') {
        // Do nothing
      }  else {
        var focusFolder = vm.user.folderHM[folderName];
        console.log('focusFolder');
        console.log(focusFolder);
        if (focusFolder) {
          for ( var i = 0 ; i < focusFolder.bookmarks.length ; i++) {
            var focus = focusFolder.bookmarks[i];
            if (focus.title === bookmark.title) {
              focusFolder.bookmarks.splice(i, 1);
              break;
            }
          }
        }
      }

      // Delete in local storage
      StorageService.deleteBookmark(bookmark);

    });
    $scope.$on(ROUTE.DELETE_BOOKMARK_FAIL, function(event, data) {
    });

    $scope.$on(ROUTE.STAR_BOOKMARK_SUCCESS, function(event, data) {
      if (data.error) {
        humane.log('Server error try again later', {addCls: 'humane-flatty-error'})
        $state.go('login');
        return;
      }
      var bookmark = data.bookmark;

      var allFolder = vm.user.folderHM['all'];
      if (allFolder) {
        for (var i = 0 ; i < allFolder.bookmarks.length ; i++) {
          if (bookmark.title === allFolder.bookmarks[i].title) {
            console.log('the boomark used to be');
            console.log(allFolder.bookmarks[i]);
            allFolder.bookmarks[i].star = (bookmark.star === '0') ? '1' : '0';
            break;
          }
        }
      }

      // Update in local storage
      StorageService.updateBookmark(bookmark);

    });

    $scope.$on(ROUTE.STAR_BOOKMARK_FAIL, function(event, data) {
    });

    $scope.$on(ROUTE.USED_BOOKMARK_SUCCESS, function(event, data) {
      var bookmark = data.bookmark;
      var focusFolder = bookmark.folder;
      if (!focusFolder) {
        var allFolder = vm.user.folderHM['all'];
        for (var i = 0 ; i < allFolder.bookmarks.lengh ; i++) {
          var curBookmark = allFolder.bookmarks[i];
          if (bookmark.title === curBookmark.title) {
            curBookmark.counter = bookmark.counter;
            curBookmark.lastVisit = bookmark.lastVisit;
            break;
          }
        }
      } else {
        var folder = vm.user.folderHM[focusFolder];
        for (var i = 0 ; i < folder.bookmarks.length ; i++) {
          var curBookmark = folder.bookmarks[i];
          if (bookmark.title === curBookmark.title) {
            curBookmark.counter = bookmark.counter;
            curBookmark.lastVisit = bookmark.lastVisit;
            break;
          }
        }
      }
      // Update in local storage
      StorageService.updateBookmark(bookmark);
    });



    $scope.$on(ROUTE.UPDATE_BOOKMARK_SUCCESS, function(event, data) {
      console.log('in update_bookmark_success');
      if (!data) {
        humane.log('That title is invalid or has already been used, try another one', {addCls:'humane-flatty-error'});
        vm.clickOverlay(false)
        console.log('vm.bookmarkEdit');
        console.log(vm.bookmarkEdit);
      } else {
        var bookmark = data.bookmark;

        console.log('vm.bE.f');
        console.log(vm.bookmarkEdit.folder);
        console.log('vm.bEO.f');
        console.log(vm.bookmarkEditOriginal.folder);
        var sameFolder = (vm.bookmarkEdit.folder === vm.bookmarkEditOriginal.folder);
        if (!sameFolder) {
          var oldFolder = vm.user.folderHM[vm.bookmarkEditOriginal.folder];
          var newFolder = vm.user.folderHM[vm.bookmarkEdit.folder];
          if (oldFolder && oldFolder != 'all' && oldFolder != '') {
            for (var i = 0; i < oldFolder.bookmarks.length; i++) {
              var focusBM = oldFolder.bookmarks[i];
              if (focusBM.title === bookmark.title) {
                oldFolder.bookmarks.splice(i, 1);
                break;
              }
            }
          }
          if (newFolder && newFolder.name != 'all' && newFolder != ''){
            newFolder.bookmarks.push(bookmark);
          }
        }
        console.log('newFolder');
        console.log(newFolder);
        console.log('oldFolder');
        console.log(oldFolder);


        bookmark.tags = [];
        if (bookmark.tag1 !=  'null' && bookmark.tag1.trim('').length != 0) {
          bookmark.tags.push(bookmark.tag1);
        }
        if (bookmark.tag2 !=  'null' && bookmark.tag2.trim('').length != 0) {
          bookmark.tags.push(bookmark.tag2);
        }
        if (bookmark.tag3 !=  'null' && bookmark.tag3.trim('').length != 0) {
          bookmark.tags.push(bookmark.tag3);
        }
        if (bookmark.tag4 !=  'null' && bookmark.tag4.trim('').length != 0) {
          bookmark.tags.push(bookmark.tag4);
        }
        var searchString = '';
        searchString += bookmark.title;
        searchString += ' ';
        for (var i = 0 ; i < bookmark.tags.length ; i++) {
          searchString += (bookmark.tags[i] + ' ');
        }
        bookmark.searchstring = searchString;
        vm.clickOverlay(true)
      }

      // Update in local storage
      StorageService.updateBookmark(bookmark);

    });

    $scope.$on(ROUTE.UPDATE_BOOKMARK_FAIL, function(event, data) {
    })

  }
})();