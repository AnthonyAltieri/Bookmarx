var SERVER_ADDRESS = 'http://localhost:6209';

var ROUTE = {
  LOGIN: (SERVER_ADDRESS + '/login'),
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',

  CHANGE_PW: (SERVER_ADDRESS + '/changePassword'),
  CHANGE_PW_SUCCESS: 'CHANGE_PW_SUCCESS',
  CHANGE_PW_FAIL: 'CHANGE_PW_FAIL',

  RESET_SUCCESS: 'RESET_SUCCESS',
  RESET_FAIL: 'RESET_FAIL',

  FORGOT: (SERVER_ADDRESS + '/forgot'),
  FORGOT_SUCCESS: 'FORGOT_SUCCESS',
  FORGOT_FAIL: 'FORGOT_FAIL',

  SIGNUP: (SERVER_ADDRESS + '/signup'),
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  SIGNUP_FAIL: 'SIGNUP_FAIL',

  GET_FOLDERS: (SERVER_ADDRESS + '/folder/get'),
  GET_FOLDERS_SUCCESS: 'GET_FOLDERS_SUCCESS',
  GET_FOLDERS_FAIL: 'GET_FOLDERS_FAIL',

  GET_BOOKMARKS: (SERVER_ADDRESS + '/user/bookmarks/get'),
  GET_BOOKMARKS_SUCCESS: 'GET_BOOKMARKS_SUCCESS',
  GET_BOOKMARKS_FAIL: 'GET_BOOKMARKS_FAIL',

  ADD_BOOKMARK: (SERVER_ADDRESS + '/user/bookmarks/add'),
  ADD_BOOKMARK_SUCCESS: 'ADD_BOOKMARK_SUCCESS',
  ADD_BOOKMARK_FAIL: 'ADD_BOOKMARK_FAIL',

  ADD_FOLDER: (SERVER_ADDRESS + '/folder/add'),
  ADD_FOLDER_SUCCESS: 'ADD_FOLDER_SUCCESS',
  ADD_FOLDER_FAIL: 'ADD_FOLDER_FAIL',

  DELETE_FOLDER: (SERVER_ADDRESS + '/folder/delete'),
  DELETE_FOLDER_SUCCESS: 'DELETE_FOLDER_SUCCESS',
  DELETE_FOLDER_FAIL: 'DELETE_FOLDER_FAIL',

  DELETE_BOOKMARK: (SERVER_ADDRESS + '/bookmark/delete'),
  DELETE_BOOKMARK_SUCCESS: 'DELETE_BOOKMARK_SUCCESS',
  DELETE_BOOKMARK_FAIL: 'DELETE_BOOKMARK_FAIL',

  STAR_BOOKMARK: (SERVER_ADDRESS + '/bookmark/star'),
  STAR_BOOKMARK_SUCCESS: 'STAR_BOOKMARK_SUCCESS',
  STAR_BOOKMARK_FAIL: 'STAR_BOOKMARK_FAIL',

  ENABLE_COOKIE_PAGE: (SERVER_ADDRESS + '/cookie/enableit'),
  ENABLE_COOKIE_PAGE_SUCCESS: 'ENABLE_COOKIE_PAGE_SUCCESS',
  ENABLE_COOKIE_PAGE_FAIL : 'ENABLE_COOKIE_PAGE_FAIL',

  USED_BOOKMARK: (SERVER_ADDRESS + '/bookmark/use'),
  USED_BOOKMARK_SUCCESS: 'USED_BOOKMARK_SUCCESS',
  USED_BOOKMARK_FAIL: 'USED_BOOKMARK_FAIL',

  EXPORT_FOLDER: (SERVER_ADDRESS + '/folder/export'),
  EXPORT_FOLDER_SUCCESS: 'EXPORT_FOLDER_SUCCESS',
  EXPORT_FOLDER_FAIL: 'EXPORT_FOLDER_FAIL',

  IMPORT_FOLDER: (SERVER_ADDRESS + '/folder/import'),
  IMPORT_FOLDER_SUCCESS: 'IMPORT_FOLDER_SUCCESS',
  IMPORT_FOLDER_FAIL: 'IMPORT_FOLDER_FAIL',

  EXPORT_BOOKMARK: (SERVER_ADDRESS + '/bookmark/export'),
  EXPORT_BOOKMARK_SUCCESS: 'EXPORT_BOOKMARK_SUCCESS',
  EXPORT_BOOKMARK_FAIL: 'EXPORT_BOOKMARK_FAIL',

  IMPORT_BOOKMARK: (SERVER_ADDRESS + '/bookmark/import'),
  IMPORT_BOOKMARK_SUCCESS: 'IMPORT_BOOKMARK_SUCCESS',
  IMPORT_BOOKMARK_FAIL: 'IMPORT_BOOKMARK_FAIL',

  CHECK_SESSION: (SERVER_ADDRESS + '/session/check'),
  CHECK_SESSION_SUCCESS: 'CHECK_SESSION_SUCCESS',
  CHECK_SESSION_FAIL: 'CHECK_SESSION_FAIL',

  UPDATE_BOOKMARK: (SERVER_ADDRESS + '/bookmark/update'),
  UPDATE_BOOKMARK_SUCCESS: 'UPDATE_BOOKMARK_SUCCESS',
  UPDATE_BOOKMARK_FAIL: 'UPDATE_BOOKMARK_FAIL',
};