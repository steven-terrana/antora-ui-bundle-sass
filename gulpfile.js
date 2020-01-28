const {src, dest, task, series, parallel, watch, done} = require('gulp');
const sass = require('gulp-sass');
const cssnano = require('cssnano'); 
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer')
const concat = require('gulp-concat');
const del = require('del'); 
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const { obj: map } = require('through2');
const fs = require('fs-extra')
const zip = require('gulp-vinyl-zip');
const sourcemaps = require('gulp-sourcemaps');

const srcDir = "./src"
const bundleName = 'ui'
const bundleDir = "./build"
const previewDir ="./public"
const previewSrcDir = 'preview-src'
const previewDestDir = 'public'
const destDir = `${previewDestDir}/_`

const lib = require('./gulp.d/tasks/build-preview-pages.js')

// clean up build dir and preview site
function clean(done){
    del.sync([ bundleDir, previewDir ]);
    done()
}

// compile scss into css
function css(done) {
    src(`${srcDir}/scss/**/*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: [ './node_modules' ]
        }).on('error', sass.logError)) 
        .pipe(postcss([ autoprefixer(), cssnano() ]))
        .pipe(concat('site.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(`${destDir}/css`))
        .pipe(browserSync.stream());
    
    done();
}

// minify JS 
function js(done) {
    src(`${srcDir}/js/**/*.js`)
        .pipe(sourcemaps.init())
        .pipe(concat('site.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(`${destDir}/js`))
    done()
}

function helpers(done){
    src(`${srcDir}/helpers/**/*.js`).pipe(dest(`${destDir}/helpers`))
    done(); 
}

function handlebars(done){
    src(`${srcDir}/{layouts,partials}/**/*.hbs`).pipe(dest(`${destDir}`))
    done();
}

function img(done) {
    src(`${srcDir}/img/**/*.{gif,ico,jpg,png,svg}`)
      .pipe(imagemin([
          imagemin.gifsicle(),
          imagemin.optipng(),
          imagemin.svgo({ plugins: [{ removeViewBox: false }] }),
      ].reduce((accum, it) => it ? accum.concat(it) : accum, [])))
      .pipe(dest(`${destDir}/img`));
    done(); 
}

function pack(done) {
    src(`${destDir}/**/*`)
    .pipe(zip.zip(`${bundleName}-bundle.zip`))
    .pipe(dest(`${bundleDir}`))
    done();
}

function buildPreviewPages() {
    return lib.build(srcDir, previewSrcDir, previewDestDir)
}

function previewBuild(done){
    exports.build();
    buildPreviewPages(); 
    if (typeof done === 'function') {
        done();
    }
}

function reload(){
    return browserSync.reload(); 
}

function serve(done) {
    browserSync.init({
        server: {
            baseDir: previewDestDir,
        },
        files: [ `${previewDestDir}/_/js/vendor/**/*.js` ],
        notify: false
    })
    watch(`${srcDir}/scss/**/*.scss`, css)
    watch(`${srcDir}/**/*.{hbs,js}`).on('change', series(previewBuild, reload))
    watch(`${previewSrcDir}/**/*`).on('change', series(previewBuild, reload))
    done();
}

exports.clean = clean; 
exports.build = series(js, css, img, helpers, handlebars); 
exports.bundle = series(clean, exports.build, pack);
exports.preview = series(clean, previewBuild, serve);  
exports.buildPreviewPages = buildPreviewPages; 