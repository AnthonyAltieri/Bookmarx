(function() {
  'use strict';

  angular
    .module('app')
    .controller('DashboardController', DashboardController);


  DashboardController.$inject = ['$rootScope', '$scope', '$state', '$interval', 'localStorageService',
                                 'ServerService'];

  function DashboardController($rootScope, $scope, $state, $interval, localStorageService, ServerService) {
    var vm = this;

    if (localStorageService.cookie.get('username') === null) {
      humane.log('Please log in again', {addCls: 'humane-flatty-error'});
      $state.go('login');
    }

    $rootScope.$broadcast('show-nav');

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

    // Objects
    vm.user = {};
    vm.user.name = localStorageService.cookie.get('username');
    vm.user.noFolderBookmarks = [];
    vm.user.activeFolder = null;
    vm.user.folders = [];
    vm.user.folderHM = {};
    vm.bookmarkEdit = {};

    console.log('user');
    console.log(vm.user);

    // UI Flag Inits
    vm.showOverlay = false;
    vm.editBookmarkMode = false;


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
        username: localStorageService.cookie.get('username')
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

    function clickOverlay(changedTitle) {
      if (vm.showOverlay) {
        vm.showOverlay = false;
      }
      if (vm.editBookmarkMode) {
        if (changedTitle) {
          vm.editBookmarkMode = false;
        } else {
          vm.bookmarkEdit.title = vm.bookmarkEdit.oldTitle;
        }
      }
    }

    function addFolder(name) {
      if (!name || name.trim('').length === 0) {
        humane.log('You need some content for your name', {addCls:'humane-flatty-error'});
        console.log('needs to have content');
        return;
      }
      var data = {};
      data.username = localStorageService.cookie.get('username');
      data.name = name;
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
      var username = localStorageService.cookie.get('username');
      var data = {
        name: vm.user.activeFolder.name,
        username: username
      };
      ServerService.sendPost(data,
        ROUTE.DELETE_FOLDER,
        ROUTE.DELETE_FOLDER_SUCCESS,
        ROUTE.DELETE_FOLDER_FAIL
      );
    }

    function deleteBookmark(bookmark) {
      var data = {
        bookmark: bookmark,
        username: localStorageService.cookie.get('username')
      };

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

    function importBookmark(file) {
      console.log(file);
      //ServerService.sendPost({},
      //  ROUTE.IMPORT_BOOKMARK,
      //  ROUTE.IMPORT_BOOKMARK_SUCCESS,
      //  ROUTE.IMPORT_BOOKMARK_FAIL
      //);
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
      vm.bookmarkEdit = bookmark;
      vm.bookmarkEdit.oldTitle = bookmark.title;
    }

    function saveChanges() {
      console.log('saveChanges');
      var bookmark = vm.bookmarkEdit;
      console.log('using this bookmark');
      console.log(bookmark);
      var data = {bookmark: bookmark};
      ServerService.sendPost(data,
        ROUTE.UPDATE_BOOKMARK,
        ROUTE.UPDATE_BOOKMARK_SUCCESS,
        ROUTE.UPDATE_BOOKMARK_FAIL
      )
    }

    function isValidTag(tag) {
      return !(!tag || tag.trim('').length === 0 || tag === 'null' || tag === 'NULL'
      || tag === null);

    }



    // Watchers
    $scope.$on(ROUTE.GET_FOLDERS_SUCCESS, function(event, data) {
      if (data.error) {
        humane.log('Server error try again later', {addCls: 'humane-flatty-error'})
        $state.go('login');
        return;
      }
      console.log('data');
      console.log(data);
      var rows = data.rows;
      console.log('Retrieved ' + rows.length + ' folders for user');
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
      console.log('in get_bookmark_success')
      console.log('data');
      console.log(data);
      console.log('vm.user.folders');
      console.log(vm.user.folders);
      var rows = data.rows;
      var i;
      for (i = 0 ; i < rows.length ; i++) {
        var bookmark = rows[i];
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
        for (i = 0 ; i < bookmark.tags.length ; i++) {
          searchstring += (' ' + bookmark.tags[i] + ' ');
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
      console.log('in add_bookmark_success');
      console.log('vm.user.folders');
      console.log(vm.user.folders);
      console.log('bookmark');
      console.log(bookmark);
      console.log('this is bookmark: ' + bookmark);
      console.log('this is event');
      console.log(event);
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
        date.getDay();
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
      if (bookmark.folder === 'null') {
        vm.user.noFolderBookmarks.push(bookmark);
      } else {
        if (typeof vm.user.folderHM[bookmark.folder] === 'undefined'
            || vm.user.folderHM[bookmark.name] === null) {
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
      console.log('in DELETE_BOOKMARK_SUCC');
      console.log('data');
      console.log(data);
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
    });
    $scope.$on(ROUTE.DELETE_BOOKMARK_FAIL, function(event, data) {
    });

    $scope.$on(ROUTE.STAR_BOOKMARK_SUCCESS, function(event, data) {
      if (data.error) {
        humane.log('Server error try again later', {addCls: 'humane-flatty-error'})
        $state.go('login');
        return;
      }
      console.log('in star bookmark success');
      var bookmark = data.bookmark;
      console.log('bookmark');
      console.log(bookmark);
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
    });
    $scope.$on(ROUTE.USED_BOOKMARK_FAIL, function(event, data) {
    });

    $scope.$on(ROUTE.CHECK_SESSION_SUCCESS, function(event, data) {
      if (data.error) {
        humane.log('Session interrupted, please log back on', {addCls: 'humane-flatty-error'});
        $state.go('login');
      }
    });
    $scope.$on(ROUTE.CHECK_SESSION_FAIL, function(event, data) {
    })

    $scope.$on(ROUTE.UPDATE_BOOKMARK_SUCCESS, function(event, data) {
      console.log('in update_bookmark_success');
      if (!data) {
        humane.log('That title is invalid or has already been used, try another one', {addCls:'humane-flatty-error'});
        vm.clickOverlay(false)
        console.log('vm.bookmarkEdit');
        console.log(vm.bookmarkEdit);
      } else {
        var bookmark = data.bookmark;
        var focusFolder = bookmark.folder;
        if (!focusFolder) {
          var allFolder = vm.user.folderHM['all'];
          for (var i = 0 ; i < allFolder.bookmarks.lengh ; i++) {
            var curBookmark = allFolder.bookmarks[i];
            if (bookmark.title === curBookmark.title) {
              curBookmark = bookmark;
              break;
            }
          }
        } else {
          var folder = vm.user.folderHM[focusFolder];
          for (var i = 0 ; i < folder.bookmarks.length ; i++) {
            var curBookmark = folder.bookmarks[i];
            if (bookmark.title === curBookmark.title) {
              curBookmark = bookmark;
              break;
            }
          }
        }
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
    });

    $scope.$on(ROUTE.UPDATE_BOOKMARK_FAIL, function(event, data) {
    })

  }
})();