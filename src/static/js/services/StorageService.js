(function () {
  'use strict';

  angular
    .module('app')
    .factory('StorageService', StorageService);

  StorageService.$inject = ['localStorageService'];

  function StorageService(localStorageService) {
    var self = this;

    self.getBookmarkHM = getBookmarkHM;
    self.setBookmarkHM = setBookmarkHM;
    self.getFolderHM = getFolderHM;
    self.setFolderHM = setFolderHM;
    self.getFolders = getFolders;
    self.setFolders = setFolders;
    self.addBookmark = addBookmark;
    self.deleteBookmark = deleteBookmark;
    self.updateBookmark = updateBookmark;

    function getBookmarkHM() {
      return localStorageService.get('bookmarkHM');
    }

    function setBookmarkHM(bookmarkHM) {
      var localBookmarkHM = self.getBookmarkHM();
      if (localBookmarkHM) localStorageService.remove('bookmarkHM');
      localStorageService.set('bookmarkHM', bookmarkHM);
    }

    function getFolderHM() {
      return localStorageService.get('folderHM');
    }

    function setFolderHM(folderHM) {
      var localFolderHM = self.getFolderHM();
      if (localFolderHM) localStorageService.remove('folderHM');
      localStorageService.set('folderHM', folderHM);
    }

    function getFolders() {
      return localStorageService.get('folders');
    }

    function setFolders(folders) {
      var localFolders = self.getFolders();
      if (localFolders) localStorageService.remove('folders');
      localStorageService.set('folders', folders);

    }

    function updateBookmark(bookmark) {
      // If local storage is not supported return
      if (!localStorageService.isSupported) return;

      var bookmarkHM = self.getBookmarkHM();
      var folderHM = self.getFolderHM();
      var folders = self.getFolders();

      // Get the old bookmark
      var oldBookmark = bookmarkHM[bookmark.title];

      var changedFolders = (!oldBookmark || !oldBookmark.folder)
        ? false
        : (oldBookmark.folder === bookmark.folder);

      if (changedFolders) {
        // delete the bookmark from the old folder
        self.deleteBookmark(oldBookmark);
        // add the bookmark to the new folder
        self.addBookmark(bookmark);
      } else {
        if (validFolder(bookmark.folder)) {
          // Replace the bookmark in its folder in the folderHM
          var folder = folderHM[bookmark.folder];
          for (var i = 0 ; i < folder.bookmarks.length ; i++) {
            var focus = folder.bookmarks[i];
            if (focus.title === bookmark.title) {
              folder.bookmarks.splice(i, 1);
              folder.bookmarks.push(bookmark);
            }
          }

          // Replace the bookmark in its folder in folders
          for (var i = 0 ; i < folders.length ; i++) {
            if (folder.name === bookmark.folder) {
              folder = folders[i];
              break;
            }
          }
          for (var i = 0 ; i < folder.bookmarks.length ; i++) {
            var focus = folder.bookmarks[i];
            if (focus.title === bookmark.title) {
              folder.bookmarks.splice(i, 1);
              folder.bookmarks.push(bookmark);
            }
          }
        }
      }

      // Update the bookmarkHM
      bookmarkHM[bookmark.title] = bookmark;

      self.setBookmarkHM(bookmarkHM);
      self.setFolderHM(folderHM);
      self.setFolders(folders);
    }

    function addBookmark(bookmark) {
      // If local storage is not supported return
      if (!localStorageService.isSupported) return;

      var bookmarkHM = self.getBookmarkHM();
      var folderHM = self.getFolderHM();
      var folders = self.getFolders();

      // Set bookmark hm
      bookmarkHM[bookmark.title] = bookmark;

      // If there was a valid folder assigned, put that bookmark in the folder
      if (validFolder(bookmark.folder)){
        var folder = folderHM[bookmark.folder];
        folder.bookmarks.push(bookmark);
      }

      // Push the bookmark in the all folder
      var folderAll = folderHM['all'];
      folderAll.bookmarks.push(bookmark);

      // Update the bookmarkHM
      bookmarkHM[bookmark.title] = bookmark;

      self.setBookmarkHM(bookmarkHM);
      self.setFolderHM(folderHM);
      self.setFolders(folders);
    }

    function deleteBookmark(bookmark) {
      // If local storage is not supported return
      if (!localStorageService.isSupported) return;

      var bookmarkHM = self.getBookmarkHM();
      var folderHM = self.getFolderHM();
      var folders = self.getFolders();

      // Remove bookmark from the bookmarkHM
      bookmarkHM[bookmark.title] = null;

      // If there is a valid folder, remove it from the folder
      if (validFolder(bookmark.folder)) {

        // Remove from the folderHM
        var folder = folderHM[bookmark.folder];
        for (var i = 0 ; i < folder.bookmarks.length ; i++) {
          var focus = folder.bookmarks[i];
          if (focus.title === bookmark.title) {
            folder.bookmarks.splice(i, 1);
            break;
          }
        }

        // Remove from folders
        for (var i = 0 ; i < folders.length ; i++) {
          if (folders.name === bookmark.folder) {
            folder = folders[i];
            break;
          }
        }
        for (var i = 0 ; i < folder.bookmarks.length ; i++) {
          var focus = folder.bookmarks[i];
          if (focus.title === bookmark.title) {
            folder.bookmarks.splice(i, 1);
            break;
          }
        }
      }

      // Remove the bookmark from the all folder in the folderHM
      var allFolder = folderHM['all'];
      for (var i = 0 ; i < allFolder.bookmarks.length ; i++) {
        var focus = allFolder.bookmarks[i];
        if (focus.title === bookmark.title) {
          allFolder.bookmarks.splice(i, 1);
          break;
        }
      }

      var focusFolder;
      // Remove the bookmark from the all folder in folders
      for (var i = 0 ; i < folders.length ; i++) {
        if (folders[i].name === 'all') {
          focusFolder = folders[i];
          break;
        }
      }
      for (var i = 0 ; i < focusFolder.bookmarks.length ; i++) {
        var focus = focusFolder.bookmarks[i];
        if (focus.title === bookmark.title) {
          focusFolder.bookmarks.splice(i, 1);
          break;
        }
      }

      self.setBookmarkHM(bookmarkHM);
      self.setFolderHM(folderHM);
      self.setFolders(folders);
    }

    function getServiceWorkerQueue() {
      if (!localStorageService.isSupported) return;
      return localStorageService.get('ServiceWorkerQueue');
    }

    function setServiceWorkerQueue(serviceWorkerQueue) {
      if (!localStorageService.isSupported) return;
      var serviceWorkerQueue = localStorageService.get('ServiceWorkerQueue');
      if (serviceWorkerQueue) localStorageService.remove('ServiceWorkerQueue');
      localStorageService.set('ServiceWorkerQueue', serviceWorkerQueue);
    }

    function validFolder(folder) {
      return (folder != '' && folder != 'all' && folder != 'No Move');
    }

    return self;
  }


})();