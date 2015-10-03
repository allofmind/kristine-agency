define(function() {

  return function ModuleLoader (configurationMethods, mainConfiguration) {
    var moduleLoader = this;


    /**
      * 
      * Initialize UserInterface instance.
      * 
      */

    function UserInterface () { };

    var userInterface = new UserInterface();


    /**
      * 
      * Set core methods.
      * 
      */

    this.methods = configurationMethods;


    /**
      * 
      * Global helper methods.
      * 
      */

    var _helperMethods = { };


    /**
      *
      * Handler to work with the internal tabs.
      *
      *
      * Construction of the main functional and interface:
      *
      *   Group settings:
      *     - Object for selector of container;
      *     - Object for receive a container;
      *     - Object for receive a animation handlers;
      *     - Object for receive a animation order;
      *
      *   Loader setting:
      *     - Object for receive a loader element;
      *     - Object for receive a loader extreme time;
      *     - Object for receive a loader animations;
      *
      *   Modules settings:
      *     - Object for receive a path of module;
      *     - Object for receive a animation priority of module;
      *
      */

    var _handleConfiguration = function (groupConfiguration, handlerForGroup, handlerForModule, previousModuleReturned) {
      var groupIndex = 0,
          groupLength = groupConfiguration.length;
      for (; groupIndex < groupLength; groupIndex++) {
        var currentGroup = groupConfiguration[groupIndex];
        var groupReturned = handlerForGroup(currentGroup, previousModuleReturned);
        var groupModule = currentGroup.module;
        var moduleIndex = 0,
            moduleLength = groupModule.length;
        for (; moduleIndex < moduleLength; moduleIndex++) {
          var currentModule = groupModule[moduleIndex];
          var moduleReturned = handlerForModule(currentModule, groupReturned);
          var childrenGroup = currentModule.children;
          if (currentModule.children) _handleConfiguration(childrenGroup, handlerForGroup, handlerForModule, moduleReturned);
        }
      }
    };

    this.groupSelectors = { };
    this.receiveContainer = { };
    this.handlersAnimations = { };
    this.orderAnimations = { };

    this.receiveLoader = { };
    this.ifFasterCancelLoader = { };
    this.loaderAnimations = { };

    this.viewFullNamesList = [ ];
    this.modulePaths = { };
    this.moduleAnimationPriority = { };

    _handleConfiguration(mainConfiguration, function (currentGroup, parentModuleReturned) {
      var groupName = currentGroup.group;
      var parentGroupFullName = parentModuleReturned.parentGroupFullName;
      var currentGroupFullName = parentGroupFullName + ( parentGroupFullName ? "#" : "" ) + groupName;
      moduleLoader.groupSelectors[currentGroupFullName] = currentGroup.selector;
      moduleLoader.receiveContainer[currentGroupFullName] = currentGroup.getContainer;
      moduleLoader.handlersAnimations[currentGroupFullName] = currentGroup.animation.handler;
      moduleLoader.orderAnimations[currentGroupFullName] = currentGroup.animation.order;
      moduleLoader.receiveLoader[currentGroupFullName] = currentGroup.loaderConfiguration.getElement;
      moduleLoader.ifFasterCancelLoader[currentGroupFullName] = currentGroup.loaderConfiguration.canceledBeforeTime;
      moduleLoader.loaderAnimations[currentGroupFullName] = currentGroup.loaderConfiguration.animation;
      return {
        parentGroupFullName: currentGroupFullName,
        groupFullName: groupName,
        parentModuleFullName: parentModuleReturned.parentModuleFullName
      };
    }, function (currentModule, groupReturned) {
      var parentModuleFullName = groupReturned.parentModuleFullName;
      var groupFullName = groupReturned.groupFullName;
      var currentModuleName = currentModule.name;
      var fullModuleName = parentModuleFullName + ( parentModuleFullName ? "+" : "" ) + groupFullName + ":" + currentModuleName;
      moduleLoader.viewFullNamesList.push(fullModuleName);
      moduleLoader.modulePaths[fullModuleName] = currentModule.path;
      moduleLoader.moduleAnimationPriority[fullModuleName] = currentModule.priority;
      return {
        parentGroupFullName: groupReturned.parentGroupFullName,
        parentModuleFullName: fullModuleName
      };
    }, {
      parentGroupFullName: "",
      parentModuleFullName: ""
    });


    /* Core components */


    /**
      * 
      * Loader component.
      *
      */

    function Loader () {
      this.cache = { };
    };

    Loader.prototype.getModule = function (name, afterTakeCallback) {
      var loader = this;
      var cachedModule = this.cache[name];
      var modulePath = moduleLoader.modulePaths[name];
      if (cachedModule) afterTakeCallback(cachedModule);
      else {
        moduleLoader.methods.request(modulePath, function (module) {
          loader.cache[name] = module;
          afterTakeCallback(loader.cache[name]);
        });
      }
    };

    this.loader = new Loader();


    /**
      * 
      * Manager for Loader component.
      *
      * Statuses:
      *   0 - loading;
      *   1 - loaded.
      *
      */

    function LoaderManager () {
      this.callbacks = { };
      this.status = { };
    };

    LoaderManager.prototype.onReady = function (fullModuleName, afterLoadedCallback) {
      var loaderManager = this;
      this.status[fullModuleName] = 0;
      moduleLoader.loader.getModule(fullModuleName, function (module) {
        loaderManager.status[fullModuleName] = 1;
        var hasParent = /\+/.test(fullModuleName);
        if (hasParent) {
          var parentFullName = (fullModuleName).slice(0, fullModuleName.lastIndexOf("+"));
          loaderManager.addCallback(parentFullName, function () {
            afterLoadedCallback(module);
            loaderManager.runCallbacks(fullModuleName);
          });
          if (loaderManager.status[parentFullName] === 1) loaderManager.runCallbacks(parentFullName);
        }
        else {
          afterLoadedCallback(module);
          loaderManager.runCallbacks(fullModuleName);
        }
      });
    };

    LoaderManager.prototype.addCallback = function (name, callback) {
      var callbacks = this.callbacks[name];
      if (!callbacks) callbacks = this.callbacks[name] = [ ];
      callbacks.push(callback);
    };

    LoaderManager.prototype.runCallbacks = function (name) {
      var callbacks = this.callbacks[name];
      if (callbacks && callbacks.length > 0) {
        callbacks.forEach(function (callback) { callback(); });
        callbacks.length = 0;
      }
    };

    this.loaderManager = new LoaderManager();


    /**
      * 
      * Instancer component.
      *
      */

    var Instancer = function () {
      this.cacheViews = { };
    };

    Instancer.prototype.initialize = function (fullViewName, module, params) {
      var currentView = this.cacheViews[fullViewName] = moduleLoader.methods.initialization(module, params);
      return currentView;
    };

    Instancer.prototype.get = function (fullViewName) {
      return this.cacheViews[fullViewName];
    };

    this.instancer = new Instancer();


    /**
      * 
      * Inserter component.
      *
      */

    var Inserter = function () { };

    Inserter.prototype.append = function (groupFullName, instance) {
      var selector = moduleLoader.groupSelectors[groupFullName];
      moduleLoader.methods.moduleInsert(instance, selector);
    };

    this.inserter = new Inserter();

    /**
      *
      * Animation program object, for know of animation type:
      *   0 - full animation pack, witch start, first and priority handler animation;
      *   1 - full animation pack, witch start, first and simple handler animation;
      *   2 - normal animation pack, witch first and simple handler animation;
      *   3 - ease animation pack, only witch simple handler animation.
      *
      */

    this.animationProgram = { };

    (function () {
      var handlersAnimations = moduleLoader.handlersAnimations,
          animationGroupName = "",
          handlersAnimation;
      for (animationGroupName in handlersAnimations) {
        handlersAnimation = handlersAnimations[animationGroupName];
        if ("start" in handlersAnimation && "end" in handlersAnimation && "first" in handlersAnimation && "last" in handlersAnimation && "hightHorisontalPriority" in handlersAnimation && "lowHorisontalPriority" in handlersAnimation && "hightVerticalPriority" in handlersAnimation && "lowVerticalPriority" in handlersAnimation) {
          moduleLoader.animationProgram[animationGroupName] = 0;
        }
        else if ("start" in handlersAnimation && "end" in handlersAnimation && "first" in handlersAnimation && "last" in handlersAnimation && "simpleShow" in handlersAnimation && "simpleHide" in handlersAnimation) {
          moduleLoader.animationProgram[animationGroupName] = 1;
        }
        else if ("first" in handlersAnimation&& "last" in handlersAnimation&& "simpleShow" in handlersAnimation&& "simpleHide" in handlersAnimation) {
          moduleLoader.animationProgram[animationGroupName] = 2;
        }
        else if ("simpleShow" in handlersAnimation && "simpleHide" in handlersAnimation
        ) {
          moduleLoader.animationProgram[animationGroupName] = 3;
        }
      }
    })();


    /**
      * 
      * Manager for animation.
      *
      */

    function AnimationsManager () { };

    AnimationsManager.prototype.run = function (fullGroupName, status, view) {
      var currentAnimation = moduleLoader.handlersAnimations[fullGroupName];
      var animationProgram = moduleLoader.animationProgram[fullGroupName];
      switch (animationProgram) {
        case 3:
          switch (status) {
            case 0:
              currentAnimation.simpleShow(view, function () { "complete"; });
              break;
            case 1:
              currentAnimation.simpleShow(view, function () { "complete"; });
              break;
            case 2:
              currentAnimation.simpleHide(view, function () { "complete"; });
              break;
          }
          break;
      }
    };

    this.animationsManager = new AnimationsManager();


    /**
      * 
      * Generator of status component.
      *
      * Status list:
      *   0 - first case;
      *   1 - replacing;
      *   2 - replacable;
      *   10 - none;
      *
      */

    var StatusGenerator = function () {
      this.currentStatus = { };
      this.groupCurrentActive = { };
      this.lastActiveInGroup = { };
    };

    StatusGenerator.prototype.generate = function (isRequired, groupFullName, fullViewName, statusHandler) {
      var lastModuleStatus = this.currentStatus[fullViewName];
      var currentActiveInGroup = this.groupCurrentActive[groupFullName];
      if (isRequired) {
        if (typeof lastModuleStatus === "undefined") {
          if (!currentActiveInGroup) {
            var currentStatus = this.currentStatus[fullViewName] = 0;
            this.groupCurrentActive[groupFullName] = fullViewName;
            statusHandler(currentStatus);
          }
          else if (currentActiveInGroup && currentActiveInGroup !== fullViewName) {
            var currentStatus = this.currentStatus[fullViewName] = 1;
            this.lastActiveInGroup = currentActiveInGroup;
            this.groupCurrentActive[groupFullName] = fullViewName;
            statusHandler(currentStatus);
          }
        }
        else {
          switch (lastModuleStatus) {
            case 2:
              var currentStatus = this.currentStatus[fullViewName] = 1;
              this.groupCurrentActive[groupFullName] = fullViewName;
              statusHandler(currentStatus);
              break;
          }
        }
      }
      else {
        if (lastModuleStatus === 0 || lastModuleStatus === 1) {
          if (currentActiveInGroup) {
            var currentStatus = this.currentStatus[fullViewName] = 2;
            statusHandler(currentStatus);
          }
        }
      }
    };

    this.statusGenerator = new StatusGenerator();


    /**
      * 
      * Methods for working with the ModuleLoader interface.
      *
      */

    var _getGroupFullName = function (fullName) {
      var groups = fullName.split("+");
      var fullGroupName = "";
      groups.forEach(function (viewName) {
        var groupName = viewName.slice(0, viewName.indexOf(":"));
        fullGroupName += ( fullGroupName ? "#" : "" ) + groupName;
      });
      return fullGroupName;
    };

    var _checkRequiredView = function (viewFullName, reuiredObject) {
      var requiredKeys = Object.keys(reuiredObject);
      return requiredKeys.indexOf(viewFullName) === -1 ? false : true;
    };

    userInterface.downloadModule = function (requestModulesConfig) {
      moduleLoader.viewFullNamesList.forEach(function (viewFullName) {
        var isRequired = _checkRequiredView(viewFullName, requestModulesConfig);
        var groupFullName = _getGroupFullName(viewFullName);
        moduleLoader.statusGenerator.generate(isRequired, groupFullName, viewFullName, function (viewStatus) {
          switch (viewStatus) {
            case 0:
              moduleLoader.loaderManager.onReady(viewFullName, function (module) {
                var instance = moduleLoader.instancer.initialize(viewFullName, module, requestModulesConfig[viewFullName]);
                moduleLoader.animationsManager.run(groupFullName, viewStatus, instance);
                moduleLoader.inserter.append(groupFullName, instance);
              });
              break;
            case 1:
              moduleLoader.loaderManager.onReady(viewFullName, function (module) {
                var instance = moduleLoader.instancer.initialize(viewFullName, module, requestModulesConfig[viewFullName]);
                moduleLoader.animationsManager.run(groupFullName, viewStatus, instance);
                moduleLoader.inserter.append(groupFullName, instance);
              });
              break;
            case 2:
              var instance = moduleLoader.instancer.get(viewFullName);
              moduleLoader.animationsManager.run(groupFullName, viewStatus, instance);
              break;
          }
        });
      });
    };

    return userInterface;
  };

  // var AnimationsHandler,
  //     AnimationsManager,
  //     Listener,
  //     LoadManager,
  //     PriorityHandler,
  //     RouterCoordinator,
  //     _getParent,
  //     _getSelector,
  //     _getType;

  // _getParent = function(stateName) {
  //   var parentIndex;
  //   parentIndex = stateName.lastIndexOf(">");
  //   if (parentIndex !== -1) {
  //     return stateName.slice(0, parentIndex);
  //   }
  // };

  // _getType = function(argument) {
  //   return Object.prototype.toString.call(argument).slice(8, -1);
  // };

  // _getSelector = function(stateName) {
  //   var currentStateChainNames, currentStateSelector;
  //   currentStateChainNames = stateName.split(">");
  //   return currentStateSelector = currentStateChainNames[currentStateChainNames.length - 1].split(":")[0];
  // };


  // /**
  //  * Object of a state
  //  */

  // var State = function() {
  //   function State(stateConfig) {
  //     this.url = stateConfig.url;
  //     this.loadMethod = stateConfig.load;
  //     this.initialize = stateConfig.initialize;
  //     this.insert = stateConfig.insert;
  //     this.update = stateConfig.update;
  //     this.remove = stateConfig.remove;
  //     this.beforeInitialize = stateConfig.beforeInitialize;
  //     this.afterInitialize = stateConfig.afterInitialize;
  //     this.beforeHide = stateConfig.beforeHide;
  //     this.afterHide = stateConfig.afterHide;
  //     this.instance = null;
  //     this.view = null;
  //   }

  //   State.prototype.load = function(callback) {
  //     return this.loadMethod(this.url, (function(_this) {
  //       return function(instance) {
  //         return callback(_this.instance = instance);
  //       };
  //     })(this));
  //   };

  //   return State;

  // };


  // /*
  //   Объект для асинхронной загрузки видов
  //  */

  // Listener = (function() {
  //   function Listener() {
  //     this.callbacks = {};
  //   }

  //   Listener.prototype.add = function(type, handler) {
  //     var callbacks;
  //     callbacks = this.callbacks[type];
  //     if (!callbacks) {
  //       callbacks = this.callbacks[type] = [];
  //     }
  //     return callbacks.push(handler);
  //   };

  //   Listener.prototype.run = function(type) {
  //     var callback, callbacks, i, len;
  //     callbacks = this.callbacks[type];
  //     if (!callbacks) {
  //       return;
  //     }
  //     for (i = 0, len = callbacks.length; i < len; i++) {
  //       callback = callbacks[i];
  //       callback();
  //     }
  //     return callbacks.length = 0;
  //   };

  //   return Listener;

  // })();

  // LoadManager = (function() {
  //   function LoadManager(argument) {
  //     this.status = {};
  //     this.listeners = {};
  //     if (argument) {
  //       this.setListeners(argument);
  //     }
  //   }

  //   LoadManager.prototype.setListeners = function(argument) {
  //     var i, len, listenerName, listenersNames, results, type;
  //     type = _getType(argument);
  //     if (type === "String") {
  //       listenerName = argument;
  //       this.status[listenerName] = "unused";
  //       return this.listeners[listenerName] = new Listener;
  //     } else if (type === "Array") {
  //       listenersNames = argument;
  //       results = [];
  //       for (i = 0, len = listenersNames.length; i < len; i++) {
  //         listenerName = listenersNames[i];
  //         this.status[listenerName] = "unused";
  //         results.push(this.listeners[listenerName] = new Listener);
  //       }
  //       return results;
  //     }
  //   };

  //   LoadManager.prototype.complete = function(routeName, callback) {
  //     this.status[routeName] = "loaded";
  //     callback();
  //     return this.listeners[routeName].run("load");
  //   };

  //   LoadManager.prototype.onready = function(routeName, callback) {
  //     var parent;
  //     parent = _getParent(routeName);
  //     if (parent) {
  //       if (this.status[parent] === "loaded") {
  //         return this.complete(routeName, function() {
  //           return callback();
  //         });
  //       } else {
  //         return this.listeners[parent].add("load", (function(_this) {
  //           return function() {
  //             return _this.complete(routeName, function() {
  //               return callback();
  //             });
  //           };
  //         })(this));
  //       }
  //     } else {
  //       return this.complete(routeName, function() {
  //         return callback();
  //       });
  //     }
  //   };

  //   return LoadManager;

  // })();


  // /*
  //   Дает право выполнять внутрненние асинхронные операции в соответствии с порядком
  //  */

  // AnimationsManager = (function() {
  //   function AnimationsManager(configurationAnimations) {
  //     this.settings = {};
  //     this.listeners = {};
  //     this.ready = 0;
  //     this.queue = 0;
  //     this.handlers = [];
  //   }

  //   AnimationsManager.prototype.setSettings = function(stateName, animationsSettings) {
  //     this.settings[stateName] = animationsSettings;
  //     this.listeners[stateName] = new Listener;
  //     return this.queue = Object.keys(this.settings).length;
  //   };

  //   AnimationsManager.prototype.run = function() {
  //     var handlerToRun, i, len, ref;
  //     if (this.ready >= 0) {
  //       this.ready++;
  //     } else {
  //       this.ready = 1;
  //     }
  //     if (this.ready === this.queue) {
  //       ref = this.handlers;
  //       for (i = 0, len = ref.length; i < len; i++) {
  //         handlerToRun = ref[i];
  //         handlerToRun();
  //       }
  //       this.ready = 0;
  //       return this.handlers.length = 0;
  //     }
  //   };

  //   AnimationsManager.prototype.onready = function(action, name, managerCallbacks, animationCallback) {
  //     var afterEndHandler, afterStartHandler, currentListener, option, parent, parentIndex, parentListener;
  //     option = this.settings[name][action];
  //     currentListener = this.listeners[name];
  //     afterEndHandler = managerCallbacks.afterEnd;
  //     afterStartHandler = managerCallbacks.afterStart;
  //     parentIndex = name.lastIndexOf(">");
  //     if (parentIndex !== -1) {
  //       parent = name.slice(0, parentIndex);
  //       parentListener = this.listeners[parent];
  //       switch (option) {
  //         case "free":
  //           parentListener.add("afterStart", function() {
  //             animationCallback(function() {
  //               return afterEndHandler(function() {
  //                 return currentListener.run("afterEnd");
  //               });
  //             });
  //             return afterStartHandler(function() {
  //               return currentListener.run("afterStart");
  //             });
  //           });
  //           break;
  //         case "order":
  //           parentListener.add("afterEnd", (function(_this) {
  //             return function() {
  //               animationCallback(function() {
  //                 return afterEndHandler(function() {
  //                   return currentListener.run("afterEnd");
  //                 });
  //               });
  //               return afterStartHandler(function() {
  //                 return currentListener.run("afterStart");
  //               });
  //             };
  //           })(this));
  //           break;
  //         case "none":
  //           parentListener.add("afterStart", (function(_this) {
  //             return function() {
  //               afterStartHandler(function() {
  //                 return currentListener.run("afterStart");
  //               });
  //               return afterEndHandler(function() {
  //                 return currentListener.run("afterEnd");
  //               });
  //             };
  //           })(this));
  //       }
  //     } else {
  //       switch (option) {
  //         case "free":
  //           this.handlers.push(function() {
  //             animationCallback(function() {
  //               return afterEndHandler(function() {
  //                 return currentListener.run("afterEnd");
  //               });
  //             });
  //             return afterStartHandler(function() {
  //               return currentListener.run("afterStart");
  //             });
  //           });
  //           break;
  //         case "order":
  //           this.handlers.push(function() {
  //             animationCallback(function() {
  //               return afterEndHandler(function() {
  //                 return currentListener.run("afterEnd");
  //               });
  //             });
  //             return afterStartHandler(function() {
  //               return currentListener.run("afterStart");
  //             });
  //           });
  //           break;
  //         case "none":
  //           this.handlers.push(function() {
  //             afterStartHandler(function() {
  //               return currentListener.run("afterStart");
  //             });
  //             return afterEndHandler(function() {
  //               return currentListener.run("afterEnd");
  //             });
  //           });
  //       }
  //     }
  //     return this.run();
  //   };

  //   AnimationsManager.prototype.empty = function(name, managerCallbacks) {
  //     var afterEndHandler, afterStartHandler, currentListener, parent, parentIndex, parentListener;
  //     currentListener = this.listeners[name];
  //     afterStartHandler = managerCallbacks.afterStart;
  //     afterEndHandler = managerCallbacks.afterEnd;
  //     parentIndex = name.lastIndexOf(">");
  //     if (parentIndex !== -1) {
  //       parent = name.slice(0, parentIndex);
  //       if (!this.listeners[parent]) {
  //         this.listeners[parent] = new Listener;
  //       }
  //       parentListener = this.listeners[parent];
  //       parentListener.add("afterEnd", function() {
  //         afterStartHandler(function() {
  //           return currentListener.run("afterStart");
  //         });
  //         return afterEndHandler(function() {
  //           return currentListener.run("afterEnd");
  //         });
  //       });
  //     } else {
  //       this.handlers.push((function(_this) {
  //         return function() {
  //           afterStartHandler(function() {
  //             return currentListener.run("afterStart");
  //           });
  //           return afterEndHandler(function() {
  //             return currentListener.run("afterEnd");
  //           });
  //         };
  //       })(this));
  //     }
  //     return this.run();
  //   };

  //   return AnimationsManager;

  // })();

  // AnimationsHandler = (function() {
  //   function AnimationsHandler(animations) {
  //     this.animations = animations != null ? animations : {};
  //   }

  //   AnimationsHandler.prototype.addAnimation = function(stateName, stateAnimations) {
  //     return this.animations[stateName] = stateAnimations;
  //   };

  //   AnimationsHandler.prototype["do"] = function(routeName, animationName, view, callback) {
  //     var currentAnimation;
  //     try {
  //       currentAnimation = this.animations[routeName][animationName];
  //       return currentAnimation(view, function() {
  //         return callback();
  //       });
  //     } catch (_error) {
  //       return callback();
  //     }
  //   };

  //   return AnimationsHandler;

  // })();


  // /*
  //   Координирует запросы на обновление роутинга
  //  */

  // RouterCoordinator = (function() {
  //   var _isActive, _isNew, _isOld, _isUpdate;

  //   _isNew = function(states, checkedStateName) {
  //     var stateName, stateValue;
  //     for (stateName in states) {
  //       stateValue = states[stateName];
  //       if (checkedStateName.slice(0, checkedStateName.lastIndexOf(":")) === stateName.slice(0, stateName.lastIndexOf(":"))) {
  //         if (checkedStateName !== stateName) {
  //           if (stateValue === "first" || stateValue === "first cache" || stateValue === "update" || stateValue === "new" || stateValue === "new cache" || stateValue === "visible") {
  //             return true;
  //           }
  //         }
  //       }
  //     }
  //   };

  //   _isUpdate = (function() {
  //     var cache;
  //     cache = {};
  //     return function(stateName, stateParams) {
  //       var cacheName, cacheValue, result, stateParamsJSON;
  //       stateParamsJSON = JSON.stringify(stateParams);
  //       result = false;
  //       for (cacheName in cache) {
  //         cacheValue = cache[cacheName];
  //         if (cacheName === stateName && cacheValue !== stateParamsJSON) {
  //           result = true;
  //         }
  //       }
  //       cache[stateName] = stateParamsJSON;
  //       return result;
  //     };
  //   })();

  //   _isActive = function(states, checkedStateName) {
  //     var stateName, stateValue;
  //     for (stateName in states) {
  //       stateValue = states[stateName];
  //       if (checkedStateName === stateName) {
  //         return true;
  //       }
  //     }
  //   };

  //   _isOld = function(states, checkedStateName) {
  //     var checkedStateNameSelector, stateName, stateNameSelector, stateValue;
  //     checkedStateNameSelector = checkedStateName.slice(0, checkedStateName.lastIndexOf(":"));
  //     for (stateName in states) {
  //       stateValue = states[stateName];
  //       stateNameSelector = stateName.slice(0, stateName.lastIndexOf(":"));
  //       if (checkedStateNameSelector === stateNameSelector) {
  //         if (stateValue === "new" || stateValue === "new cache") {
  //           if (stateName !== checkedStateName) {
  //             return true;
  //           }
  //         }
  //       }
  //     }
  //   };

  //   function RouterCoordinator(config) {
  //     this.config = config != null ? config : {};
  //   }

  //   RouterCoordinator.prototype.setCoorginate = function(stateName) {
  //     return this.config[stateName] = "unused";
  //   };

  //   RouterCoordinator.prototype.update = function(requiredStates) {
  //     var configStateName, configStateValue, currentStateParam, isActive, isNew, isOld, isUpdate, ref, requiredStateName, requiredStateParams;
  //     for (requiredStateName in requiredStates) {
  //       requiredStateParams = requiredStates[requiredStateName];
  //       currentStateParam = this.config[requiredStateName];
  //       isNew = _isNew(this.config, requiredStateName);
  //       isUpdate = _isUpdate(requiredStateName, requiredStateParams);
  //       if (currentStateParam === "unused" && !isNew) {
  //         this.config[requiredStateName] = "first";
  //       } else if (!isNew && (currentStateParam === "last" || currentStateParam === "invisible")) {
  //         this.config[requiredStateName] = "first cache";
  //       } else if (isUpdate && (currentStateParam === "first" || currentStateParam === "first cache" || currentStateParam === "update" || currentStateParam === "new" || currentStateParam === "new cache" || currentStateParam === "visible")) {
  //         this.config[requiredStateName] = "update";
  //       } else if (isNew && currentStateParam === "unused") {
  //         this.config[requiredStateName] = "new";
  //       } else if (isNew && (currentStateParam === "old" || currentStateParam === "invisible")) {
  //         this.config[requiredStateName] = "new cache";
  //       } else if (currentStateParam === "first" || currentStateParam === "first cache" || currentStateParam === "update" || currentStateParam === "new" || currentStateParam === "new cache") {
  //         this.config[requiredStateName] = "visible";
  //       }
  //     }
  //     ref = this.config;
  //     for (configStateName in ref) {
  //       configStateValue = ref[configStateName];
  //       isActive = _isActive(requiredStates, configStateName);
  //       isOld = _isOld(this.config, configStateName);
  //       if (!isActive && !isOld && (configStateValue === "first" || configStateValue === "first cache" || configStateValue === "new" || configStateValue === "new cache" || configStateValue === "update" || configStateValue === "visible")) {
  //         this.config[configStateName] = "last";
  //       } else if (!isActive && isOld && (configStateValue === "first" || configStateValue === "first cache" || configStateValue === "new" || configStateValue === "new cache" || configStateValue === "update" || configStateValue === "visible")) {
  //         this.config[configStateName] = "old";
  //       } else if (configStateValue === "last" || configStateValue === "old") {
  //         this.config[configStateName] = "invisible";
  //       }
  //     }
  //     return this.config;
  //   };

  //   return RouterCoordinator;

  // })();


  // /*
  
  //   Обрабатывает параметры приоритетов видов
  //  */

  // var PriorityHandler = function (prioritiesMap) {
  //   this.prioritiesMap = prioritiesMap != null ? prioritiesMap : {};
  // }

  // PriorityHandler.prototype.findPair = function(routes, matchRouteName, type) {
  //   var matchString, routerName, routerValue;
  //   matchString = matchRouteName.slice(0, matchRouteName.lastIndexOf(":"));
  //   for (routerName in routes) {
  //     routerValue = routes[routerName];
  //     if (routerName.indexOf(matchString) !== -1) {
  //       if (routerName.slice(matchString.length).indexOf(">") === -1) {
  //         if (type === "old") {
  //           if (routerValue === "new cache" || routerValue === "new") {
  //             return routerName;
  //           }
  //         } else if (type === "new cache" || type === "new") {
  //           if (routerValue === "old") {
  //             return routerName;
  //           }
  //         }
  //       }
  //     }
  //   }
  // };

  // PriorityHandler.prototype.setPriority = function(stateName, statePriority) {
  //   return this.prioritiesMap[stateName] = statePriority ? statePriority : "00";
  // };

  // PriorityHandler.prototype.animationName = function(routes, routeName, routeParam) {
  //   var currentHorisontalPriority, currentVerticalPriority, pairRoute, previriousHorisontalPriority, previriousVerticalPriority;
  //   pairRoute = this.findPair(routes, routeName, routeParam);
  //   previriousVerticalPriority = this.prioritiesMap[routeName][0];
  //   previriousHorisontalPriority = this.prioritiesMap[routeName][1];
  //   currentVerticalPriority = this.prioritiesMap[pairRoute][0];
  //   currentHorisontalPriority = this.prioritiesMap[pairRoute][1];
  //   if (routeParam === "old") {
  //     if (previriousVerticalPriority > currentVerticalPriority) {
  //       return "centerBottom";
  //     } else if (previriousVerticalPriority < currentVerticalPriority) {
  //       return "centerTop";
  //     } else if (previriousVerticalPriority === currentVerticalPriority) {
  //       if (previriousHorisontalPriority > currentHorisontalPriority) {
  //         return "centerRight";
  //       } else if (previriousHorisontalPriority < currentHorisontalPriority) {
  //         return "centerLeft";
  //       } else if (previriousHorisontalPriority === currentHorisontalPriority) {
  //         return "last";
  //       }
  //     }
  //   } else if (routeParam === "new" || routeParam === "new cache") {
  //     if (previriousVerticalPriority > currentVerticalPriority) {
  //       return "bottomCenter";
  //     } else if (previriousVerticalPriority < currentVerticalPriority) {
  //       return "topCenter";
  //     } else if (previriousVerticalPriority === currentVerticalPriority) {
  //       if (previriousHorisontalPriority > currentHorisontalPriority) {
  //         return "rightCenter";
  //       } else if (previriousHorisontalPriority < currentHorisontalPriority) {
  //         return "leftCenter";
  //       } else if (previriousHorisontalPriority === currentHorisontalPriority) {
  //         return "first";
  //       }
  //     }
  //   }
  // };


  // /**
  //  * Object of a state
  //  */

  // var ModuleLoader = function (configurationMethods, moduleConfiguration, configurationAnimations) {

  //   this.statesMethods = {};
  //   this.states = {};

  //   this.loadManager = new LoadManager;
  //   this.animationsManager = new AnimationsManager;
  //   this.animationsHandler = new AnimationsHandler;
  //   this.routerCoordinator = new RouterCoordinator;
  //   this.priorityHandler = new PriorityHandler;

  //   this.addMethods(configurationMethods);
  //   this.addModules(moduleConfiguration);
  //   this.addAnimation(configurationAnimations);

  // };

  // ModuleLoader.prototype.addMethods = function(configurationMethods) {
  //   var methodName, methodHanlder;
  //   for (methodName in configurationMethods) {
  //     var methodHanlder = configurationMethods[methodName];
  //     this.statesMethods[methodName] = methodHanlder;
  //   }
  // };

  // ModuleLoader.prototype.addModules = function(moduleConfiguration) {
  //   var fn, viewName, viewSettings;
  //   fn = (function(_this) {
  //     return function(viewSettings) {
  //       _this.states[viewName] = new State({
  //         url: viewSettings.url,
  //         load: viewSettings.load ? viewSettings.load : _this.statesMethods.load ? _this.statesMethods.load : void 0,
  //         initialize: viewSettings.initialize ? viewSettings.initialize : _this.statesMethods.initialize ? _this.statesMethods.initialize : void 0,
  //         insert: viewSettings.insert ? viewSettings.insert : _this.statesMethods.insert ? _this.statesMethods.insert : void 0,
  //         update: viewSettings.update ? viewSettings.update : _this.statesMethods.update ? _this.statesMethods.update : void 0,
  //         remove: viewSettings.remove ? viewSettings.remove : _this.statesMethods.remove ? _this.statesMethods.remove : void 0,
  //         beforeInitialize: _this.statesMethods.beforeInitialize && viewSettings.beforeInitialize ? function() {
  //           _this.statesMethods.beforeInitialize();
  //           return viewSettings.beforeInitialize();
  //         } : _this.statesMethods.beforeInitialize ? function() {
  //           return _this.statesMethods.beforeInitialize();
  //         } : viewSettings.beforeInitialize ? function() {
  //           return viewSettings.beforeInitialize();
  //         } : void 0,
  //         afterInitialize: _this.statesMethods.afterInitialize && viewSettings.afterInitialize ? function() {
  //           _this.statesMethods.afterInitialize();
  //           return viewSettings.afterInitialize();
  //         } : _this.statesMethods.afterInitialize ? function() {
  //           return _this.statesMethods.afterInitialize();
  //         } : viewSettings.afterInitialize ? function() {
  //           return viewSettings.afterInitialize();
  //         } : void 0,
  //         beforeHide: _this.statesMethods.beforeHide && viewSettings.beforeHide ? function() {
  //           _this.statesMethods.beforeHide();
  //           return viewSettings.beforeHide();
  //         } : _this.statesMethods.beforeHide ? function() {
  //           return _this.statesMethods.beforeHide();
  //         } : viewSettings.beforeHide ? function() {
  //           return viewSettings.beforeHide();
  //         } : void 0,
  //         afterHide: _this.statesMethods.afterHide && viewSettings.afterHide ? function() {
  //           _this.statesMethods.afterHide();
  //           return viewSettings.afterHide();
  //         } : _this.statesMethods.afterHide ? function() {
  //           return _this.statesMethods.afterHide();
  //         } : viewSettings.afterHide ? function() {
  //           return viewSettings.afterHide();
  //         } : void 0
  //       });
  //       _this.loadManager.setListeners(viewName);
  //       _this.routerCoordinator.setCoorginate(viewName);
  //       return _this.priorityHandler.setPriority(viewName, viewSettings.priority);
  //     };
  //   })(this);
  //   for (viewName in moduleConfiguration) {
  //     viewSettings = moduleConfiguration[viewName];
  //     fn(viewSettings);
  //   }
  //   return this.stateNames = Object.keys(this.states);
  // };

  // ModuleLoader.prototype.addAnimation = function(configurationAnimations) {
  //   var animationConfig, i, len, results, stateName, statesList;
  //   for (i = 0, len = configurationAnimations.length; i < len; i++) {
  //     animationConfig = configurationAnimations[i];
  //     statesList = animationConfig.states;
  //     (function() {
  //       var j, len1;
  //       for (j = 0, len1 = statesList.length; j < len1; j++) {
  //         stateName = statesList[j];
  //         this.animationsHandler.addAnimation(stateName, animationConfig.animations);
  //         results1.push(this.animationsManager.setSettings(stateName, {
  //           show: animationConfig.show ? animationConfig.show : "free",
  //           swap: animationConfig.swap ? animationConfig.swap : "free",
  //           hide: animationConfig.hide ? animationConfig.hide : "free"
  //         }));
  //       }
  //     })();
  //   }
  // };

  // ModuleLoader.prototype.require = function(requiredStates) {
  //   var count, i, len, ref, results, routeName, stateCoordinates;
  //   stateCoordinates = this.routerCoordinator.update(requiredStates);
  //   ref = this.stateNames;
  //   results = [];
  //   for (count = i = 0, len = ref.length; i < len; count = ++i) {
  //     routeName = ref[count];
  //     results.push((function(_this) {
  //       return function(routeName, currentState, routeCoordinate) {
  //         var animationName, currentStateSelector;
  //         currentStateSelector = _getSelector(routeName);
  //         switch (routeCoordinate) {
  //           case "first":
  //             return currentState.load(function(instance) {
  //               return _this.loadManager.onready(routeName, function() {
  //                 currentState.view = currentState.initialize(instance, typeof params !== "undefined" && params !== null ? params[routeName] : void 0);
  //                 return (function(view) {
  //                   return _this.animationsManager.onready("show", routeName, {
  //                     afterStart: function(done) {
  //                       currentState.insert(currentStateSelector, view);
  //                       return done();
  //                     },
  //                     afterEnd: function(done) {
  //                       return done();
  //                     }
  //                   }, function(done) {
  //                     if (_getType(currentState.beforeInitialize) === "Function") {
  //                       currentState.beforeInitialize();
  //                     }
  //                     return _this.animationsHandler["do"](routeName, "first", view, function() {
  //                       if (_getType(currentState.afterInitialize) === "Function") {
  //                         currentState.afterInitialize();
  //                       }
  //                       return done();
  //                     });
  //                   });
  //                 })(currentState.view);
  //               });
  //             });
  //           case "first cache":
  //             return currentState.load(function(instance) {
  //               return _this.loadManager.onready(routeName, function() {
  //                 currentState.view = currentState.initialize(instance, typeof params !== "undefined" && params !== null ? params[routeName] : void 0);
  //                 return (function(view) {
  //                   return _this.animationsManager.onready("show", routeName, {
  //                     afterStart: function(done) {
  //                       currentState.insert(currentStateSelector, view);
  //                       return done();
  //                     },
  //                     afterEnd: function(done) {
  //                       return done();
  //                     }
  //                   }, function(done) {
  //                     if (_getType(currentState.beforeInitialize) === "Function") {
  //                       currentState.beforeInitialize();
  //                     }
  //                     return _this.animationsHandler["do"](routeName, "first", view, function() {
  //                       if (_getType(currentState.afterInitialize) === "Function") {
  //                         currentState.afterInitialize();
  //                       }
  //                       return done();
  //                     });
  //                   });
  //                 })(currentState.view);
  //               });
  //             });
  //           case "update":
  //             return _this.loadManager.onready(routeName, function() {
  //               return (function(view) {
  //                 return _this.animationsManager.onready("show", routeName, {
  //                   afterStart: function(done) {
  //                     currentState.update(currentState.view, typeof params !== "undefined" && params !== null ? params[routeName] : void 0);
  //                     return done();
  //                   },
  //                   afterEnd: function(done) {
  //                     return done();
  //                   }
  //                 }, function(done) {
  //                   return _this.animationsHandler["do"](routeName, "update", view, function() {
  //                     return done();
  //                   });
  //                 });
  //               })(currentState.view);
  //             });
  //           case "new":
  //             return currentState.load(function(instance) {
  //               var animationName;
  //               animationName = _this.priorityHandler.animationName(stateCoordinates, routeName, "new");
  //               return _this.loadManager.onready(routeName, function() {
  //                 currentState.view = currentState.initialize(instance, typeof params !== "undefined" && params !== null ? params[routeName] : void 0);
  //                 return (function(view) {
  //                   return _this.animationsManager.onready("swap", routeName, {
  //                     afterStart: function(done) {
  //                       currentState.insert(currentStateSelector, view);
  //                       return done();
  //                     },
  //                     afterEnd: function(done) {
  //                       return done();
  //                     }
  //                   }, function(done) {
  //                     if (_getType(currentState.beforeInitialize) === "Function") {
  //                       currentState.beforeInitialize();
  //                     }
  //                     return _this.animationsHandler["do"](routeName, animationName, view, function() {
  //                       if (_getType(currentState.afterInitialize) === "Function") {
  //                         currentState.afterInitialize();
  //                       }
  //                       return done();
  //                     });
  //                   });
  //                 })(currentState.view);
  //               });
  //             });
  //           case "new cache":
  //             return currentState.load(function(instance) {
  //               var animationName;
  //               animationName = _this.priorityHandler.animationName(stateCoordinates, routeName, "new");
  //               return _this.loadManager.onready(routeName, function() {
  //                 currentState.view = currentState.initialize(instance, typeof params !== "undefined" && params !== null ? params[routeName] : void 0);
  //                 return (function(view) {
  //                   return _this.animationsManager.onready("swap", routeName, {
  //                     afterStart: function(done) {
  //                       currentState.insert(currentStateSelector, view);
  //                       return done();
  //                     },
  //                     afterEnd: function(done) {
  //                       return done();
  //                     }
  //                   }, function(done) {
  //                     if (_getType(currentState.beforeInitialize) === "Function") {
  //                       currentState.beforeInitialize();
  //                     }
  //                     return _this.animationsHandler["do"](routeName, animationName, view, function() {
  //                       if (_getType(currentState.afterInitialize) === "Function") {
  //                         currentState.afterInitialize();
  //                       }
  //                       return done();
  //                     });
  //                   });
  //                 })(currentState.view);
  //               });
  //             });
  //           case "last":
  //             return _this.loadManager.onready(routeName, function() {
  //               return (function(view) {
  //                 return _this.animationsManager.onready("hide", routeName, {
  //                   afterStart: function(done) {
  //                     return done();
  //                   },
  //                   afterEnd: function(done) {
  //                     currentState.remove(view);
  //                     return done();
  //                   }
  //                 }, function(done) {
  //                   if (_getType(currentState.beforeHide) === "Function") {
  //                     currentState.beforeHide();
  //                   }
  //                   return _this.animationsHandler["do"](routeName, "last", view, function() {
  //                     if (_getType(currentState.afterHide) === "Function") {
  //                       currentState.afterHide();
  //                     }
  //                     return done();
  //                   });
  //                 });
  //               })(currentState.view);
  //             });
  //           case "old":
  //             animationName = _this.priorityHandler.animationName(stateCoordinates, routeName, "old");
  //             return _this.loadManager.onready(routeName, function() {
  //               return (function(view) {
  //                 return _this.animationsManager.onready("hide", routeName, {
  //                   afterStart: function(done) {
  //                     return done();
  //                   },
  //                   afterEnd: function(done) {
  //                     currentState.remove(view);
  //                     return done();
  //                   }
  //                 }, function(done) {
  //                   if (_getType(currentState.beforeHide) === "Function") {
  //                     currentState.beforeHide();
  //                   }
  //                   return _this.animationsHandler["do"](routeName, animationName, view, function() {
  //                     if (_getType(currentState.afterHide) === "Function") {
  //                       currentState.afterHide();
  //                     }
  //                     return done();
  //                   });
  //                 });
  //               })(currentState.view);
  //             });
  //           default:
  //             return _this.animationsManager.empty(routeName, {
  //               afterStart: function(done) {
  //                 return done();
  //               },
  //               afterEnd: function(done) {
  //                 return done();
  //               }
  //             });
  //         }
  //       };
  //     })(this)(routeName, this.states[routeName], stateCoordinates[routeName]));
  //   }
  // };

  // return ModuleLoader;

});