(function (){
  'use strict';

  angular
    .module('app')
    .factory('FilterService', FilterService);

  function FilterService() {
    var self = this;

   // Sort: title, lastVisit, url, createdate

    function aToZTitle(bookmarks) {
      var titleToBookmarkHM = {};
      var titles = [];
      var sorted = [];
      var i;
      for (i = 0 ; i < bookmarks.length ; i++) {
        var bookmark = bookmarks[i];
        titleToBookmarkHM[bookmark.title] = bookmark;
        titles.push(bookmark.title);
      }
      titles.sort();
      for (i = 0 ; i < titles.length ; i++) {
        sorted.push(titleToBookmarkHM[titles[i]]);
      }

      return sorted;
    }

    function zToATitle(bookmarks) {
      var titleToBookmarkHM = {};
      var titles = [];
      var sorted = [];
      var i;
      for (i = 0 ; i < bookmarks.length ; i++) {
        var bookmark = bookmarks[i];
        titleToBookmarkHM[bookmark.title] = bookmark;
        titles.push(bookmark.title);
      }
      titles.sort();
      for (i = titles.length - 1 ; i >= 0 ; i--) {
        sorted.push(titleToBookmarkHM[titles[i]]);
      }

      return sorted;
    }

    function aToZUrl(bookmarks) {
      var urlToBookmarkHM = {};
      var urls = [];
      var sorted = [];
      var i;
      for (i = 0 ; i < bookmarks.length ; i++) {
        var bookmark = bookmarks[i];
        urlToBookmarkHM[bookmark.url] = bookmark;
        urls.push(bookmark.url);
      }
      urls.sort();
      for (i = 0 ; i < urls.length ; i++) {
        sorted.push(urlToBookmarkHM[urls[i]]);
      }

      return sorted
    }

    function aToZUrl(bookmarks) {
      var urlToBookmarkHM = {};
      var urls = [];
      var sorted = [];
      var i;
      for (i = 0 ; i < bookmarks.length ; i++) {
        var bookmark = bookmarks[i];
        urlToBookmarkHM[bookmark.url] = bookmark;
        urls.push(bookmark.url);
      }
      urls.sort();
      for (i = urls.length - 1 ; i >= 0 ; i--) {
        sorted.push(urlToBookmarkHM[urls[i]]);
      }

      return sorted
    }

  }

})();