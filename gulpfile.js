const fs = require('fs');

const autoprefixer = require('gulp-autoprefixer');
const archiver     = require('archiver');
const bump         = require('gulp-bump');
const babelify     = require('babelify');
const browserify   = require('browserify');
const buffer       = require('vinyl-buffer');
const clean        = require('gulp-clean');
const concat       = require('gulp-concat');
const cssnano      = require('gulp-cssnano');
const fileinclude  = require('gulp-file-include');
const gulp         = require('gulp');
const notify       = require('gulp-notify');
const plumber      = require('gulp-plumber' );
const rename       = require('gulp-rename');
const runSequence  = require('run-sequence');
const shell        = require('gulp-shell');
const source       = require('vinyl-source-stream');
const uglify       = require('gulp-uglify');
const zip          = require('gulp-zip');
const html2js      = require('html2js-browserify');

const app          = './app/';
const dist         = './dist/';


// Error / Success Handling
let onError = function(err) {
    notify.onError({
        title: "Error: " + err.plugin,
        subtitle: "<%= file.relative %>",
        message: "<%= error.message %>",
        sound: "Beep",
        icon: app + "images/icons/icon48.png",
    })(err);
    console.log(err.toString());
    this.emit('end');
};

function onSuccess(msg) {
    return {
        message: msg + " Complete! ",
        //sound:     "Pop",
        icon: app + "images/icons/icon48.png",
        onLast: true
    }
}

function notifyFunc(msg) {
    return gulp.src('.', { read: false })
        .pipe(notify(onSuccess(msg)))
}


// HTML
let htmlFiles = app + 'layouts/*.html';

gulp.task('html', function(done) {
    return gulp.src(htmlFiles)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(gulp.dest(dist))
        .pipe(notify(onSuccess('HTML')))
});

// js: Browserify
let js_watchFolder = [app + 'scripts/**/*.{js,json,html}', app + 'partial/*.html'];
let js_srcFile = app + 'scripts/main.js';
let js_destFolder = dist + 'js/';
let js_destFile = 'urbitwallet-master.js';
let browseOpts = { debug: true }; // generates inline source maps - only in js-debug
let babelOpts = {
    presets: ['es2015'],
    compact: false,
    global: true
};

function bundle_js(bundler) {
    return bundler.bundle()
        .pipe(plumber({ errorHandler: onError }))
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(rename(js_destFile))
        .pipe(gulp.dest(js_destFolder))
        .pipe(notify(onSuccess('JS')))
}

function bundle_js_debug(bundler) {
    return bundler.bundle()
        .pipe(plumber({ errorHandler: onError }))
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(rename(js_destFile))
        .pipe(gulp.dest(js_destFolder))
        .pipe(notify(onSuccess('JS')))
}


gulp.task('js', function() {
    let bundler = browserify(js_srcFile).transform(babelify).transform(html2js);
    bundle_js(bundler)
});

gulp.task('js-production', function() {
    let bundler = browserify(js_srcFile).transform(babelify, babelOpts).transform(html2js);
    bundle_js(bundler)
});

gulp.task('js-debug', function() {
    let bundler = browserify(js_srcFile, browseOpts).transform(babelify, babelOpts).transform(html2js);
    bundle_js_debug(bundler)
});

// Rebuild Static JS
let js_srcFilesStatic = app + 'scripts/staticJS/to-compile-to-static/*.js';
let js_destFolderStatic = app + 'scripts/staticJS/';
let js_destFileStatic = 'urbitwallet-static.min.js';

gulp.task('staticJS', function() {
    return gulp.src(js_srcFilesStatic)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(concat(js_destFileStatic))
        .pipe(uglify())
        .pipe(gulp.dest(js_destFolderStatic))
        .pipe(notify(onSuccess('StaticJS')))
});


//// Copy CSS on update (we're not using less here)
//let cssSrcFolder = app + 'styles/*.css';
//
//gulp.task('copyCss', function() {
//    console.log('copy triggered');
//    gulp.src(cssSrcFolder)
//      .pipe(gulp.dest(dist + 'css'));
//});

// Copy all static
let imgSrcFolder = app + 'images/**/*';
let fontSrcFolder = app + 'fonts/*.*';
let jsonFile = app + '*.json';
let jQueryFile = app + 'scripts/staticJS/jquery-1.12.3.min.js';
let bin = app + '/bin/*';
let staticJSSrcFile = js_destFolderStatic + js_destFileStatic;
let readMe = './README.md';
let cssSrcFolder = app + 'styles/*.css';

gulp.task('copy', ['staticJS'], function() {
    console.log('copy triggered');
    gulp.src(imgSrcFolder)
        .pipe(gulp.dest(dist + 'images'));

    gulp.src(fontSrcFolder)
        .pipe(gulp.dest(dist + 'fonts'));

    gulp.src(staticJSSrcFile)
        .pipe(gulp.dest(dist + 'js'));

    gulp.src(jQueryFile)
        .pipe(gulp.dest(dist + 'js'));

    gulp.src(jsonFile)
        .pipe(gulp.dest(dist));

    gulp.src(readMe)
        .pipe(gulp.dest(dist));

    gulp.src(bin)
        .pipe(gulp.dest(dist + 'bin'));

    return gulp.src(cssSrcFolder)
        .pipe(gulp.dest(dist + 'css'))
        .pipe(notify(onSuccess(' Copy ')))
});




// Clean files that get compiled but shouldn't
gulp.task('clean', function() {
    return gulp.src([
            dist + 'images/icons',
            dist + 'manifest.json'
        ], { read: false })
        .pipe(plumber({ errorHandler: onError }))
        .pipe(clean())
        .pipe(notify(onSuccess(' Clean ')))
});



// Bumps Version Number
function bumpFunc(t) {
  return gulp.src([app + '*.json'])
    .pipe( plumber   ({ errorHandler: onError   }))
    .pipe( bump      ({ type: t                 }))
    .pipe( gulp.dest  ( './app'                 ))
    .pipe( notify     ( onSuccess('Bump ' + t ) ))
}


// Get Version Number
let versionNum;
let versionMsg;
gulp.task('getVersion', function() {
    manifest = JSON.parse(fs.readFileSync(app + 'manifest.json'));
    versionNum = 'v' + manifest.version;
    versionMsg = 'Release: ' + versionNum
});


// zips dist folder
gulp.task('zip', ['getVersion'], function() {
    return gulp.src(dist + '**/**/*')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(rename(function (path) {
          path.dirname = './etherwallet-' + versionNum + '/' + path.dirname;
        }))
        .pipe(zip('./etherwallet-' + versionNum + '.zip'))
        .pipe(gulp.dest('./releases/'))
        .pipe(notify(onSuccess('Zip Dist ' + versionNum)));
});


function archive() {
  let outputZip = fs.createWriteStream(__dirname + '/example.zip');
  let archiveZip = archiver('zip', {
      gzip: true,
  });
  outputZip.on('close', function() {
    console.log(archiveZip.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });
  archiveZip.on('error', function(err) {
    throw err;
  });
  archiveZip.pipe(outputZip);
  archiveZip.directory(dist, 'test2');
  archiveZip.finalize();


  let outputTar = fs.createWriteStream(__dirname + '/example.tgz');
  let archiveTar = archiver('tar', {
      gzip: true,
  });
  outputTar.on('close', function() {
    return gulp.src(archiveTar).pipe(onSuccess('Archive Complete: Tar, /dist' ));
  });
  archiveTar.on('error', function(err) {
    throw err;
  });
  archiveTar.pipe(outputTar);
  archiveTar.directory(dist, 'test2');
  archiveTar.finalize();

}

gulp.task('watchJS',      function() { gulp.watch(js_watchFolder,   ['js']            ) })
gulp.task('watchJSDebug', function() { gulp.watch(js_watchFolder,   ['js-debug']      ) })
gulp.task('watchJSProd',  function() { gulp.watch(js_watchFolder,   ['js-production'] ) })
gulp.task('watchCss',    function() { gulp.watch(app + 'styles/*', ['copy'] )})
gulp.task('watchPAGES',   function() { gulp.watch(htmlFiles,        ['html']          ) }) 
gulp.task('bump',          function() { return bumpFunc( 'patch' ) });
gulp.task('bump-patch',    function() { return bumpFunc( 'patch' ) });
gulp.task('bump-minor',    function() { return bumpFunc( 'minor' ) });

gulp.task('archive',       function() { return archive() });

gulp.task('prep',   function(cb) { runSequence('js-production', 'html', 'copy', cb); });

gulp.task('bump',   function(cb) { runSequence('bump-patch', 'clean', 'zip', cb);              });

gulp.task('zipit',  function(cb) { runSequence('clean', 'zip', cb);                            });

//gulp.task('commit', function(cb) { runSequence('add', 'commitV', 'tag', cb);                   });

gulp.task('watch',     ['watchJS', 'watchPAGES', 'watchCss'])
gulp.task('watchProd', ['watchJSProd', 'watchPAGES', ])

gulp.task('build', ['js', 'html', 'copy' ]);
gulp.task('build-debug', ['js-debug', 'html', 'watchJSDebug', 'watchPAGES'])

gulp.task('default', ['build', 'watch']);
