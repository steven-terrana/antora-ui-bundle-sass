const {src, dest, task, series, parallel, watch, cb} = require('gulp');
const sass = require('gulp-sass');
const cssnano = require('cssnano'); 
var postcss = require('gulp-postcss');
var concat = require('gulp-concat');
const del = require('del'); 
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const zip = require('gulp-vinyl-zip');

const srcDir = "./src"
const bundleName = 'ui'
const bundleDir = "./build"
const previewDir ="./public"
const previewSrcDir = 'preview-src'
const previewDestDir = 'public'
const destDir = `${previewDestDir}/_`

const lib = require('./gulp.d/tasks/build-preview-pages.js')

const { reload: livereload } = process.env.LIVERELOAD === 'true' ? require('gulp-connect') : {}
const serverConfig = { host: '0.0.0.0', port: 5252, livereload }
const glob = {
  all: [srcDir, previewSrcDir],
  css: `${srcDir}/css/**/*.css`,
  js: ['gulpfile.js', 'gulp.d/**/*.js', `${srcDir}/{helpers,js}/**/*.js`],
}

// clean up build dir and preview site
function clean(cb){
    console.log("cleaning!")
    del.sync([ bundleDir, previewDir ]);

    cb()
}

// compile scss into css
function css(cb) {
    console.log("compiling scss!")
    const plugins = [ cssnano() ]
    src(`${srcDir}/scss/**/*.scss`)  // fetch all scss files
        /* TODO: find a linter for scss files */
        .pipe(sass().on('error', sass.logError)) // convert to css
        .pipe(postcss(plugins))                  // post process css (minify)
        .pipe(concat('site.css'))                // dump into single file 
        .pipe(dest(`${destDir}/css`))      // place in build dir 
        .pipe(browserSync.stream());             // update browser for preview 
    
    cb();
}

// minify JS 
function js(cb) {
    console.log("compiling javascript!")
    
    src(`${srcDir}/js/*.js`)
        .pipe(uglify())
        .pipe(concat('site.js'))
        .pipe(dest(`${destDir}/js`))

    src(`${srcDir}/js/vendor/*.js`)
    .pipe(uglify())
    .pipe(dest(`${destDir}/js/vendor`))

    cb()
}

function helpers(cb){
    console.log("moving helpers")
    src(`${srcDir}/helpers/**/*.js`).pipe(dest(`${destDir}/helpers`))
    cb(); 
}

function handlebars(cb){
    console.log("moving handlebars")
    src(`${srcDir}/{layouts,partials}/**/*.hbs`).pipe(dest(`${destDir}`))
    
    cb();
}

function img(cb) {
    console.log("minifying images")
    src(`${srcDir}/img/**/*.{gif,ico,jpg,png,svg}`)
      .pipe(imagemin([
          imagemin.gifsicle(),
          imagemin.optipng(),
          imagemin.svgo({ plugins: [{ removeViewBox: false }] }),
      ].reduce((accum, it) => it ? accum.concat(it) : accum, [])))
      .pipe(dest(`${destDir}/img`));

    cb(); 
}

function pack(cb) {
    src(`${destDir}/**/*`)
    .pipe(zip.zip(`${bundleName}-bundle.zip`))
    .pipe(dest(`${bundleDir}`))

    cb();
}

function buildPreviewPages() {
    console.log("building preview pages")

    return lib.build(srcDir, previewSrcDir, previewDestDir)

}

function previewBuild(cb){
    exports.build();
    buildPreviewPages(); 
    if (typeof cb === 'function') {
        cb();
    }
}

function reload(){
    return browserSync.reload(); 
}

function serve(cb) {
    browserSync.init({
        server: {
            baseDir: previewDestDir
        }
    })
    watch(`${srcDir}/scss/**/*.scss`, css)
    watch(`${srcDir}/**/*.{hbs,js}`).on('change', series(previewBuild, reload))
    cb();
}

exports.clean = clean; 
exports.build = series(js, css, img, helpers, handlebars); 
exports.bundle = series(clean, exports.build, pack);
exports.preview = series(clean, previewBuild, serve);  
exports.buildPreviewPages = buildPreviewPages; 