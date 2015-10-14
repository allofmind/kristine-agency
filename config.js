Object.defineProperty(global, "__stack", {
  get: function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
        return stack;
    };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, "__line", {
  get: function() {
    return __stack[1].getLineNumber();
  }
});

Object.defineProperty(global, "__function", {
  get: function() {
    return __stack[1].getFunctionName();
  }
});

module.exports = {
  DATABASE_URL: "postgres://ippgkvtmbtfchu:BAJF5pzi4LSlv0grXKyOz33hHM@ec2-54-163-228-109.compute-1.amazonaws.com:5432/dee8e77384ipme?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"
};