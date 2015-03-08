var fs = require('fs'),
  path = require('path'),
  Replace;

Replace = function(fileName, staticRoot, pathRoot, map) {
  this.fileName = path.resolve(fileName);
  this.staticRoot = path.resolve(staticRoot);
  this.pathRoot = path.resolve(pathRoot);
  this.map = map;
};

Replace.prototype.run = function() {
  var fileName = this.fileName,
    staticRoot = this.staticRoot,
    pathRoot = this.pathRoot,
    map = this.map,
    data;

  if (fs.existsSync(fileName)) {
    data = fs.readFileSync(fileName).toString();
    if (data && staticRoot) {
      return data.replace(/url\s*\(\s*(['"]?)([^"'\)]*)\1\s*\)/gi, function(match, location) {
        var dirName = path.resolve(path.dirname(fileName)),
          url,
          index,
          urlPath;

        match = match.replace(/\s/g, '');
        url = match.slice(4, -1).replace(/"|'/g, '').replace(/\\/g, '/');
        if (/^\/|https:|http:|data:/i.test(url) === false && dirName.indexOf(pathRoot) > -1) {
          urlPath = path.resolve(dirName + '/' + url);
          if (urlPath.indexOf(pathRoot) > -1) {
            url = urlPath.substr(
              urlPath.indexOf(pathRoot) + pathRoot.length
            ).replace(/\\/g, '/');

            // ?号或#号后面其他内容
            index = url.indexOf('?');
            if (index === -1) {
              index = url.indexOf('#');
            }

            if (map) {
              if (index > -1) {
                urlPath = map[url.substr(0, index)];
              } else {
                urlPath = map[url];
              }

              if (urlPath) {
                if (index > -1) {
                  url = urlPath + url.substr(index);
                } else {
                  url = urlPath;
                }
              }
            }

            url = staticRoot + url;
            url = path.resolve(url);
          }
        }


        return 'url("' + url + '")';
      });
    }

    return data;
  }

  return '';
};

module.exports = Replace;
