// https://gist.github.com/revolunet/1908355#file-indexof-min-js
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(b){var a=this.length>>>0;var c=Number(arguments[1])||0;c=(c<0)?Math.ceil(c):Math.floor(c);if(c<0){c+=a}for(;c<a;c++){if(c in this&&this[c]===b){return c}}return -1}};
