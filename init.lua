local function initLuarocksPath()
  --[[
    Add luarocks paths to package path. 
    TODO: some sources online say that this should be done with luarocks.loader,
      but that did now work while this did.
  ]]
  local luarocksPath = io.popen('luarocks path --lr-path'):read('*a');
  local luarocksCPath = io.popen('luarocks path --lr-cpath'):read('*a');

  package.path = luarocksPath..';'..package.path;
  package.cpath = luarocksCPath..';'..package.cpath;
end

initLuarocksPath();

local lfs = require 'lfs';

local projectDir = 'src';
local pathSep = package.config:sub(1,1);

local function walkDir(path, walkCb)
  local dirs = { path }
  --[[
    special case, the first path needs to call dirCb
      directly and calculate the file attributes, because we aren't
      recursing into the root
  --]]
  walkCb(path, lfs.attributes(path))
  while #dirs > 0 do
    local nextDirs = {};
    for _, currDir in pairs(dirs) do
      for file in lfs.dir(currDir) do
        if file ~= '.' and file ~= '..' then
          local filePath = currDir..pathSep..file;
          local fAttr, err = lfs.attributes(filePath);
          if fAttr == nil then
            print(err);
          else
            if fAttr['mode'] == 'directory' then
              table.insert(nextDirs, filePath);
            end
            walkCb(filePath, fAttr);
          end
        end
      end
    end
    dirs = nextDirs;
  end
end
--[[
  Set up project paths recursively relative to projectDir
]]
local function initRelativeProjectPaths ()
  local walkPath = lfs.currentdir()..pathSep..projectDir;
  local packagePaths = {
    '.',
  };

  walkDir(walkPath, function (dirPath, fileAttrs)
    if(fileAttrs['mode'] == 'directory') then
      table.insert(packagePaths, dirPath);
    end
  end);

  for _, pkgDir in pairs(packagePaths) do
    package.path = pkgDir..'/'..'?.lua;'..package.path;
  end
end;

initRelativeProjectPaths();

require('./src/main')
