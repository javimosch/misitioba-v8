

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var html = document.body.innerHTML;
html = html.toString().replaceAll('_ROOT','/');
document.body.innerHTML = html;