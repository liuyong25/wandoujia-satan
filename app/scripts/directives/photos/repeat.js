define([
        'angular'
    ], function(
        angular
    ) {
'use strict';
var ngRepeatDirective = {
    transclude: 'element',
    priority: 1000,
    terminal: true,
    compile: function(element, attr, linker) {
        return function(scope, iterStartElement, attr){
            var expression = attr.wdpRepeat;
            var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/),
                lhs, rhs, valueIdent, keyIdent;
            if (! match) {
                throw new Error('Expected ngRepeat in form of \'_item_ in _collection_\' but got \'' +
                    expression + '\'.');
            }
            lhs = match[1];
            rhs = match[2];
            match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
            if (!match) {
                throw new Error('\'item\' in \'item in collection\' should be identifier or (key, value) but got \'' +
                        lhs + '\'.');
            }
            valueIdent = match[3] || match[1];
            keyIdent = match[2];

            // Store a list of elements from previous run. This is a hash where key is the item from the
            // iterator, and the value is an array of objects with following properties.
            //   - scope: bound scope
            //   - element: previous element.
            //   - index: position
            // We need an array of these objects since the same object can be returned from the iterator.
            // We expect this to be a rare case.
            var lastOrder = new HashQueueMap();

            scope.$watch(rhs + '.length', function ngRepeatWatch(){
                var index, length,
                    collection = scope.$eval(rhs),
                    cursor = iterStartElement,     // current position of the node
                    // Same as lastOrder but it has the current state. It will become the
                    // lastOrder on the next iteration.
                    nextOrder = new HashQueueMap(),
                    arrayLength,
                    childScope,
                    key, value, // key/value of iteration
                    array,
                    last;       // last object information {scope, element, index}



                if (!angular.isArray(collection)) {
                    // if object, extract keys, sort them and use to determine order of iteration over obj props
                    array = [];
                    for(key in collection) {
                        if (collection.hasOwnProperty(key) && key.charAt(0) !== '$') {
                            array.push(key);
                        }
                    }
                    array.sort();
                } else {
                    array = collection || [];
                }

                arrayLength = array.length;

                // we are not using forEach for perf reasons (trying to avoid #call)
                for (index = 0, length = array.length; index < length; index += 1) {
                    key = (collection === array) ? index : array[index];
                    value = collection[key];

                    last = lastOrder.shift(value);

                    if (last) {
                        // if we have already seen this object, then we need to reuse the
                        // associated scope/element
                        childScope = last.scope;
                        nextOrder.push(value, last);

                        if (index === last.index) {
                            // do nothing
                            cursor = last.element;
                        } else {
                            // existing item which got moved
                            last.index = index;
                            // This may be a noop, if the element is next, but I don't know of a good way to
                            // figure this out,  since it would require extra DOM access, so let's just hope that
                            // the browsers realizes that it is noop, and treats it as such.

                            // In wdj-photos, we position each photo absolutely, then DOM order
                            // makes no sense. Comment it!
                            // cursor.after(last.element);
                            cursor = last.element;
                        }
                    } else {
                        // new item which we don't know about
                        childScope = scope.$new();
                    }

                    childScope[valueIdent] = value;
                    if (keyIdent) {
                        childScope[keyIdent] = key;
                    }
                    childScope.$index = index;

                    childScope.$first = (index === 0);
                    childScope.$last = (index === (arrayLength - 1));
                    childScope.$middle = !(childScope.$first || childScope.$last);

                    if (!last) {
                        linker(childScope, function(clone){
                            cursor.after(clone);
                            last = {
                                    scope: childScope,
                                    element: (cursor = clone),
                                    index: index
                                };
                            nextOrder.push(value, last);
                        });
                    }
                }

                //shrink children
                for (key in lastOrder) {
                    if (lastOrder.hasOwnProperty(key)) {
                        array = lastOrder[key];
                        while(array.length) {
                            value = array.pop();
                            value.scope.$destroy();
                            value.element.remove();
                        }
                    }
                }

                lastOrder = nextOrder;
            });
        };
    }
};


/**
 * Computes a hash of an 'obj'.
 * Hash of a:
 *  string is string
 *  number is number as string
 *  object is either result of calling $$hashKey function on the object or uniquely generated id,
 *         that is also assigned to the $$hashKey property of the object.
 *
 * @param obj
 * @returns {string} hash string such that the same input will have the same hash string.
 *         The resulting string key is in 'type:hashKey' format.
 */
var currentUid = 0;
function nextUid() {
    currentUid += 1;
    return currentUid;
}
function hashKey(obj) {
  var objType = typeof obj,
      key;

  if (objType === 'object' && obj !== null) {
    if (typeof (key = obj.$$hashKey) === 'function') {
      // must invoke on object to keep the right this
      key = obj.$$hashKey();
    } else if (key === undefined) {
      key = obj.$$hashKey = nextUid();
    }
  } else {
    key = obj;
  }

  return objType + ':' + key;
}

/**
 * A map where multiple values can be added to the same key such that they form a queue.
 * @returns {HashQueueMap}
 */
function HashQueueMap() {}
HashQueueMap.prototype = {
  /**
   * Same as array push, but using an array as the value for the hash
   */
  push: function(key, value) {
    var array = this[key = hashKey(key)];
    if (!array) {
      this[key] = [value];
    } else {
      array.push(value);
    }
  },

  /**
   * Same as array shift, but using an array as the value for the hash
   */
  shift: function(key) {
    var array = this[key = hashKey(key)];
    if (array) {
      if (array.length === 1) {
        delete this[key];
        return array[0];
      } else {
        return array.shift();
      }
    }
  },

  /**
   * return the first item without deleting it
   */
  peek: function(key) {
    var array = this[hashKey(key)];
    if (array) {
    return array[0];
    }
  }
};

return [function() {
    return ngRepeatDirective;
}];

});
