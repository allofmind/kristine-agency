define([
  "text!localData/server-messages.json"
], function (
  serverMessages
) {

  function Messager (messages) {
    this.messages = messages;
  };

  Messager.prototype.get = function (type, code) {
    try {
      return this.messages[type][code];
    }
    catch (error) {
      console.error(error);
    }
  }

  return new Messager(JSON.parse(serverMessages));
 
});