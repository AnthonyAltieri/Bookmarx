(function() {
  'use strict';

  angular
    .module('app')
    .factory('ServiceWorker', ServiceWorker);

  ServiceWorker.$inject = ['$rootScope', '$interval', 'ServerService', 'localStorageService'];

  function ServiceWorker($rootScope, $interval, ServerService, localStorageService) {
    var self = this;

    // For UIDs
    self._id = 0;

    self.QUERY_CYCLE_TIME = 5000;
    self._activationPromise;

    self.init = init;
    self.add = add;
    self.size = size;
    self.clear = clear;
    self.activate = activate;
    self.deactivate = deactivate;

    // Add and event to the service worker
    function add(event) {
      event.uid = self._id;
      incrementId();
      self.queue(event);
    }

    // Returns the size of the queue
    function size() {
      return self._queue.size();
    }

    // Clear the queue
    function clear() {
      self._queue.clear();
    }

    // Reset uids
    function init() {
      self._id = 0;
    }

    function loadFromLocal() {
      if (!localStorageService.isSupported) return;
      var serviceWorkerQueue = localStorageService.get('ServiceWorkerQueue');
    }

    function saveToLocal() {
      if (!localStorageService.isSupported) return;
      localStorageService.set('ServiceWorkerQueue', _queue.array);
    }

    function activate() {
      // If the ServiceWorker has already been activated return
      if (self._activationPromise) return;

      self._activationPromise = $interval(function activate() {
        // Return if there are no events to deal with
        if (self.size() === 0) return;
        var event = self._queue.top();
        var url = event.url;
        var data = event.data;
        var success = event.successBroadcast;
        var fail = event.failBroadcast;
        ServerService.sendPost(data, url, success, fail);

      }, self.QUERY_CYCLE_TIME);

    }

    function deactivate() {
      if (self._activationPromise) {
        $interval.cancel(self._activationPromise);
        self._activationPromise = null;
      }
    }

    function incrementId() {
      if (self._id < Number.MAX_VALUE - 1) {
        self._id++;
      } else {
        self._id = 0;
      }
    }

    // Underlying Queue
    var _queue = {};
    _queue.array = [];
    _queue.queue = queue;
    _queue.front = front;
    _queue.pop = pop;
    _queue.clear = clearArray;
    _queue.size = queueSize;
    _queue.loadQueue = loadQueue;

    function queue(event) {
      _queue.array.push(event);
    }

    function front() {
      if (_queue.array.length === 0) return;
      return _queue.array[0];
    }

    function pop() {
      if (_queue.array.length === 0) return;
      _queue.array.splice(0, 1);
    }

    function clearArray() {
      _queue.array = [];
    }

    function queueSize() {
      return _queue.array.length;
    }

    // Sets the queue equal to queue and then returns the last uid that was assigned.
    function loadQueue(eventArray) {
      _queue.array = eventArray;
      return (_queue.size() === 0) ? 0 : _queue.array[_queue.array.length - 1]._id;
    }

    self._queue = _queue;


    return self;
  }




})();