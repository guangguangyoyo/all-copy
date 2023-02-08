var fs   = require('fs')
var path = require('path')

var SourcePath = process.argv[2];
var TargetPath = process.argv[3];
var IgnorePath = process.argv[4];


/**
* copy files 
* @param {String} srcPath source directory
* @param {String} tarPath target directory
* @param {Function} cb callback function 
* @return {Null} 
**/
var copyFile = function(srcPath, tarPath, cb) {
  var rs = fs.createReadStream(srcPath)
  rs.on('error', function(err) {
    if (err) {
      console.log('read error', srcPath)
    }
    cb && cb(err)
  })

  var ws = fs.createWriteStream(tarPath)
  ws.on('error', function(err) {
    if (err) {
      console.log('write error', tarPath)
    }
    cb && cb(err)
  })
  ws.on('close', function(ex) {
    cb && cb(ex)
  })

  rs.pipe(ws)
}

// Copy the directory and subdirectories
var copyFolder = function(srcDir, tarDir, ignore, cb) {
  fs.readdir(srcDir, function(err, files) {
    var count = 0
    var checkEnd = function() {
      ++count == files.length && cb && cb()
    }

    if (err) {
      checkEnd()
      return
    }

    files.forEach(function(file) {
      if (ignore && new RegExp(String(ignore)).test(file)) {
        return;
      }
      var srcPath = path.join(srcDir, file)
      var tarPath = path.join(tarDir, file)

      fs.stat(srcPath, function(err, stats) {
        if (stats.isDirectory()) {
          // source path is directory
          console.log('mkdir', tarPath)
          fs.mkdir(tarPath, function(err) {
            if (err) {
              console.log(err)
              return
            }

            copyFolder(srcPath, tarPath, ignore, checkEnd)
          })
        } else {
          copyFile(srcPath, tarPath, checkEnd)
        }
      })
    })

    // 
    files.length === 0 && cb && cb()
  })
}

// input parameter 
copyFolder(SourcePath, TargetPath, IgnorePath, function(err) {
  if (err) {
    console.error(err);
    return;
  }
})