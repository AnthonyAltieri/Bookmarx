(function() {
  'use strict';

  angular
    .module('app')
    .factory('FolderService', FolderService);

  FolderService.$inject = [];

  function FolderService() {
    const self = this;

    self.init = initTest;

    function initTest() {
      // Here is where you would query the server
      var DEFAULT_GENERAL_BOOKMARKS = [
        {
          name: 'Google',
          url: 'https://google.com',
          tags: ['search'],
          starActive: false
        },
        {
          name: 'Yahoo',
          url: 'https://yahoo.com',
          tags: ['search'],
          starActive: false
        },
        {
          name: 'FaceBook',
          url: 'https://facebook.com',
          tags: ['social media'],
          starActive: false
        },
        {
          name: 'TechCrunch',
          url: 'https://techcrunch.com',
          tags: ['news', 'technology'],
          starActive: false
        },
        {
          name: 'Bloomberg',
          url: 'https://bloomberg.com',
          tags: ['news', 'finance'],
          starActive: false
        }
      ];

      var DEFAULT_NEWS_BOOKMARKS = [
        {
          name: 'Bloomberg',
          url: 'https://bloomberg.com',
          tags: ['news', 'finance'],
          starActive: false
        },
        {
          name: 'CNN',
          url: 'https://cnn.com',
          tags: ['news'],
          starActive: false
        },
        {
          name: 'BBC News',
          url: 'https://bbc.com/news',
          tags: ['news'],
          starActive: false
        }

      ];

      return [{
        idx: 0,
        name: 'General',
        bookmarks: DEFAULT_GENERAL_BOOKMARKS,
        isActive: true
      }, {
        idx: 1,
        name: 'News',
        bookmarks: DEFAULT_NEWS_BOOKMARKS,
        isActive: false
      }];
    }

    return self;
  }
})();
