
# To update our forks electron version. 

## Electron 4.1.x

### Prepare electron source 
Get source and update it with commands
```
set DEPOT_TOOLS_WIN_TOOLCHAIN=0
set DEPOT_TOOLS_UPDATE=0
gclient config  --name "src/electron" --unmanaged  https://github.com/stream-labs/electron
gclient sync --with_branch_heads --with_tags
cd src\electron 
git remote add upstream https://github.com/electron/electron.git
git checkout sl_4-1-x 

cd ..\..\
gclient sync --with_branch_heads --with_tags
```

Change version name to not get mixed in caches with original version files. from `4.1.4` to `4.1.x-streamlabs`

In files 
```
atom/browser/resources/mac/info.plist
atom/browser/resources/win/atom.rc
atom/common/atom_version.h 
package.json
VERSION
```

### Build release package 
Build new release package with commands: 
```
cd src 
set CHROMIUM_BUILDTOOLS_PATH=%cd%\buildtools
"C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\VC\Auxiliary\Build\vcvars64.bat"

gn gen out/Release --args="import(\"//electron/build/args/release.gn\")"
gn gen out/Release --ide=vs2017
ninja -C out/Release electron
ninja -C out/Release electron_dist_zip

cd electron 
node scripts\prepare_fork_build.js
```

First commands from official build instruction `https://github.com/electron/electron/blob/2-1-x/docs/development/build-instructions-windows.md`

Last command print in log paths to tar.gz zip and sha256 files what need to be uploaded to github as relase 

Do not commit changes in files where you change version numbers if you do not want manualy merge next time. 

### Upload files to github 
* Go to `https://github.com/stream-labs/electron/releases`
* Create new release with save version as set in `package.json` - `4.1.4-streamlabs`
* upload tgz package file 
* upload relese zip file 
* upload SHASUMS256 file 
* publish release 
* get url of uploaded package file 

### Update version in slobs 
* go to slobs source 
* checkout branch with electron fork `electron_fork_browserviews`
* in `package.json` replace electron prev version with url of tgz package from github 

## Electron 2.x.x

### Prepare electron source 
Get source and update it with commands
```
set DEPOT_TOOLS_WIN_TOOLCHAIN=0
set DEPOT_TOOLS_UPDATE=0
git clone https://github.com/stream-labs/electron.git
cd electron 
git checkout sl_2-0-x
git remote add upstream https://github.com/electron/electron.git
git fetch upstream
git merge upstream/2-0-x
git push origin
```

Change version name to not get mixed in caches with original version files. from `2.0.16` to `2.0.16-streamlabs`

In package.json line with `"version":`

in electron.gyp line with `'version%'`

### Build release package 
Build new release package with commands: 
```
python script\bootstrap.py -v
python script\build.py
python script\create-dist.py
node script\prepare_fork_build.js
```

First 3 command from official build instruction `https://github.com/electron/electron/blob/2-0-x/docs/development/build-instructions-windows.md`

Last command print in log paths to tar.gz zip and sha256 files what need to be uploaded to github as relase 

Do not commit changes in electron.gyp and package.json if you do not want manualy merge next time. 

### Upload files to github 
* Go to `https://github.com/stream-labs/electron/releases`
* Create new release with save version as set in `package.json` - `2.0.16-streamlabs`
* upload tgz package file 
* upload relese zip file 
* upload SHASUMS256 file 
* publish release 
* get url of uploaded package file 

### Update version in slobs 
* go to slobs source 
* checkout branch with electron fork `electron_fork_browserviews`
* in `package.json` replace electron prev version with url of tgz package from github 
