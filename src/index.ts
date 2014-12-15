///<reference path="../typings/gruntjs/gruntjs.d.ts" />
///<reference path="../typings/node/node.d.ts" />
///<reference path="../typings/q/Q.d.ts" />
///<reference path="../typings/typescript/tsc.d.ts" />

///<reference path="./option.ts" />
///<reference path="./host.ts" />
///<reference path="./task.ts" />
///<reference path="./io.ts" />

declare var module: any;

module.exports = function(grunt: IGrunt){

    var _path = require("path"),
        _vm = require('vm'),
        _os = require('os'),
        Q = require('q');

    function getTsBinPathWithLoad(): string{

        var typeScriptBinPath = _path.dirname(require.resolve("typescript")),
            typeScriptPath = _path.resolve(typeScriptBinPath, "tsc.js"),
            code: string;

        if (!typeScriptBinPath) {
            grunt.fail.warn("tsc.js not found. please 'npm install typescript'.");
            return "";

        code = grunt.file.read(typeScriptPath).toString();

        //末尾にあるコマンドラインの実行行を削除 "ts.executeCommandLine(sys.args);"
        code = code.substr(0, code.trim().length - 32);
        _vm.runInThisContext(code, typeScriptPath);

        return typeScriptBinPath;
    }

    grunt.registerMultiTask("typescript", "Compile typescript to javascript.", function () {

        var self: grunt.task.IMultiTask<{src: string;}> = this,
            done = self.async(),
            promises: Q.Promise<any>[],
            binPath = getTsBinPathWithLoad();

        promises = self.files.map(function(gruntFile: grunt.file.IFileMap){
            var io = GruntTs.createIO(grunt, binPath),
                opt = GruntTs.createGruntOptions(self.options({}), grunt, gruntFile, io),
                host = GruntTs.createCompilerHost(opt, io);
            return GruntTs.execute(grunt, opt, host);
        });
        Q.all(promises).then(function(){
            done();
        }, function(){
            done(false);
        });
    });

};
