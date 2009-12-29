/*
 * Utility implementation of node.sourceIndex()
 *
 * Returns the node's source-order position within the document.
 */
if(typeof document.documentElement.sourceIndex == "undefined") {
  HTMLElement.prototype.__defineGetter__("sourceIndex", (function(indexOf) {
    return function sourceIndex(){
      return indexOf.call(this.ownerDocument.getElementsByTagName("*"), this);
    };
  })(Array.prototype.indexOf));
}

/**
 * Simple string/position tuple.  Extracted strings need to retain
 * information about their place in the document for when we group
 * them later.
 */
function StringNode(string, position) {
  this.string = string;
  this.position = position;
};
StringNode.prototype = new Object();

StringNode.prototype.toString = function() {
  return "<" + this.string + "(" + this.position + ")>";
}

/**
 * This is similar to a jQuery list of HTML Nodes.  I need to be able to
 * call methods on it, and each contained String needs an associated position.
 */
function StringNodeList() {};
StringNodeList.prototype = new Array();

StringNodeList.prototype.toString = function() {
  var buffer = "[";
  for(var i = 0; i < this.length; i++){
    if(i > 0) buffer += ", ";
    buffer += this[i].toString();
  }
  return buffer + "]";
}

/**
 * Trims and replaces arbitrary whitespace with single spaces.
 */
StringNodeList.prototype.normalizeText = function() {
  $.each(this, function() {
    this.string = this.string.replace(/\s+/g, ' ').replace(/^\s+/m, '').replace(/\s+$/m, '');
  });  
  return this;
}

/**
 * The core function is used to convert jQuery objects to 
 * StringNodeLists.
 * 
 * Example
 */
jQuery.fn.extract = function(func) {
  if(!func){
    func = function(node) {
      return $(node).text();
    };
  }

  if (func instanceof RegExp) {
    var re = func;
    func = function(node) {
      var text = $(node).text();
      return re.exec(text)[0];
    }
  }
  
  var list = new StringNodeList();
  this.each(function(){
    list.push(new StringNode(func(this), this.sourceIndex));
  });
  return list;
}