(function (){
  'use strict';

  angular
    .module('app')
    .factory('FilterService', FilterService);

  function FilterService() {
    var self = this;

   // Sort: title, lastVisit, url, createdate

    self.aToZTitle = aToZTitle;
    self.zToATitle = zToATitle;
    self.aToZUrl = aToZUrl;
    self.zToAUrl = zToAUrl;
    self.zeroToNineSortCreationDate = zeroToNineSortCreationDate;
    self.nineToZeroSortCreationDate = nineToZeroSortCreationDate;
    self.zeroToNineSortCounter = zeroToNineSortCounter;
    self.nineToZeroSortCounter = nineToZeroSortCounter;
    self.zeroToNineSortLastVisit = zeroToNineSortLastVisit;
    self.nineToZeroSortLastVisit = nineToZeroSortLastVisit;

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
        urlToBookmarkHM[bookmark.url + bookmark.title] = bookmark;
        urls.push(bookmark.url + bookmark.title);
      }
      urls.sort();
      for (i = 0 ; i < urls.length ; i++) {
        sorted.push(urlToBookmarkHM[urls[i]]);
      }

      return sorted
    }

    function zToAUrl(bookmarks) {
      var urlToBookmarkHM = {};
      var urls = [];
      var sorted = [];
      var i;
      for (i = 0 ; i < bookmarks.length ; i++) {
        var bookmark = bookmarks[i];
        urlToBookmarkHM[bookmark.url + bookmark.title] = bookmark;
        urls.push(bookmark.url + bookmark.title);
      }
      urls.sort();
      for (i = urls.length - 1 ; i >= 0 ; i--) {
        sorted.push(urlToBookmarkHM[urls[i]]);
      }

      return sorted
    }

    return self;
  }

  function zeroToNineSortLastVisit(bookmarks) {
    var lastVisitToBookmarkHM = {};
    var lastVisits = [];
    var sorted = [];
    var i;
    for (i = 0 ; i < bookmarks.length ; i++) {
      var bookmark = bookmarks[i];
      lastVisitToBookmarkHM[bookmark.lastVisit + bookmark.title] = bookmark;
      lastVisits.push(bookmark.lastVisit + bookmark.title);
    }
    lastVisits.sort();
    for (i = 0 ; i < lastVisits.length ; i++) {
      sorted.push(lastVisitToBookmarkHM[lastVisits[i]]);
    }

    return sorted
  }

  function nineToZeroSortLastVisit(bookmarks) {
    var lastVisitToBookmarkHM = {};
    var lastVisits = [];
    var sorted = [];
    var i;
    for (i = 0 ; i < bookmarks.length ; i++) {
      var bookmark = bookmarks[i];
      lastVisitToBookmarkHM[bookmark.lastVisit + bookmark.title] = bookmark;
      lastVisits.push(bookmark.lastVisit + bookmark.title);
    }
    lastVisits.sort();
    for (i = lastVisits.length - 1 ; i >= 0 ; i--) {
      sorted.push(lastVisitToBookmarkHM[lastVisits[i]]);
    }

    return sorted
  }

  function zeroToNineSortCreationDate(bookmarks) {
    var creationDateToBookmarkHM = {};
    var creationDates = [];
    var sorted = [];
    var i;
    for (i = 0 ; i < bookmarks.length ; i++) {
      var bookmark = bookmarks[i];
      creationDateToBookmarkHM[bookmark.creationDate + bookmark.title] = bookmark;
      creationDates.push(bookmark.creationDate + bookmark.title);
    }
    creationDates.sort();
    for (i = 0 ; i < creationDates.length ; i++) {
      sorted.push(creationDateToBookmarkHM[creationDates[i]]);
    }
    return sorted
  }

  function nineToZeroSortCreationDate(bookmarks) {
    var creationDateToBookmarkHM = {};
    var creationDates = [];
    var sorted = [];
    var i;
    for (i = 0 ; i < bookmarks.length ; i++) {
      var bookmark = bookmarks[i];
      creationDateToBookmarkHM[bookmark.creationDate + bookmark.title] = bookmark;
      creationDates.push(bookmark.creationDate + bookmark.title);
    }
    creationDates.sort();
    for (i = creationDates.length - 1 ; i >= 0 ; i--) {
      sorted.push(creationDateToBookmarkHM[creationDates[i]]);
    }
    return sorted
  }

  function zeroToNineSortCounter(bookmarks) {
    var counterToBookmarkHM = {};
    var counters = [];
    var sorted = [];
    var i;
    for (i = 0 ; i < bookmarks.length ; i++) {
      var bookmark = bookmarks[i];
      counterToBookmarkHM[bookmark.counter + bookmark.title] = bookmark;
      counters.push(bookmark.counter + bookmark.title);
    }
    counters.sort();
    for (i = 0 ; i < counters.length ; i++) {
      sorted.push(counterToBookmarkHM[counters[i]]);
    }
    return sorted
  }

  function nineToZeroSortCounter(bookmarks) {
    var counterToBookmarkHM = {};
    var counters = [];
    var sorted = [];
    var i;
    for (i = 0 ; i < bookmarks.length ; i++) {
      var bookmark = bookmarks[i];
      counterToBookmarkHM[bookmark.counter + bookmark.title] = bookmark;
      counters.push(bookmark.counter + bookmark.title);
    }
    counters.sort();
    for (i = counters.length - 1 ; i >= 0 ; i--) {
      sorted.push(counterToBookmarkHM[counters[i]]);
    }
    return sorted
  }

})();