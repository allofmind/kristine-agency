define(function () {

  function User () {
    var storageUserInfo = localStorage.getItem("userInfo");
    if (storageUserInfo) {
      var userInfo = JSON.parse(storageUserInfo);
      $.ajaxSetup({
        headers: {
          "user-id": userInfo.id,
          "user-token": userInfo.token
        }
      });
      this.data = userInfo;
    }
  };

  User.prototype.login = function (userInfo) {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    this.data = userInfo;
    $.ajaxSetup({
      headers: {
        "user-id": userInfo.id,
        "user-token": userInfo.token
      }
    });
  };

  User.prototype.isLogin = function () {
    return this.data ? true : false;
  };

  User.prototype.logout = function () {
    localStorage.removeItem("userInfo");
    $.ajaxSetup({
      headers: {
        "user-id": "",
        "user-token": ""
      }
    });
    this.data = null;
  };

  return new User();

});