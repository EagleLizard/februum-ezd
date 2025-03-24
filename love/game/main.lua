
local lick = require "lick"
-- lick.reset = true
local printf = require "util.printf"

local ctx = {
  dt = nil,
  sw = nil,
  sh = nil,
  frameCount = nil,
  world = nil,
}

local Obj = (function()
  ---@class februum.Obj
  ---@field id integer
  local Obj = {}
  Obj.__index = Obj
  local objIdCounter = 0
  local function getObjId()
    local id = objIdCounter
    objIdCounter = objIdCounter + 1
    return id
  end
  function Obj.new()
    local self = setmetatable({}, Obj)
    self.id = getObjId()
    return self
  end
  --[[ overrides ]]
  function Obj:draw()
    printf("draw(), obj.id: %d\n", self.id)
  end
  ---pass ref to work object. TODO: there's probably a better way to provide context to entities...
  ---@param world any
  function Obj:update(world)end
  return Obj
end)()

local Point = (function ()
  ---@class februum.geom.Point
  ---@field x number
  ---@field y number
  local Point = {}
  Point.__index = Point
  function Point.new(x, y)
    local self = setmetatable({}, Point)
    self.x = x
    self.y = y
    return self
  end
  return Point
end)()

local CircleObj = (function ()
  ---@class februum.CircleObj: februum.Obj
  ---@field r number
  ---@field pos februum.geom.Point
  local CircleObj = {}
  CircleObj.__index = CircleObj
  setmetatable(CircleObj, { __index = Obj })

  function CircleObj.new(x, y, r)
    local self = setmetatable(Obj.new(), CircleObj)
    self.r = r
    self.pos = Point.new(x, y)
    return self
  end
  function CircleObj:draw()
    love.graphics.circle("line", self.pos.x, self.pos.y, self.r)
  end
  return CircleObj
end)()

local MouseFollower = (function ()
  ---@class februum.MouseFollower: februum.Obj
  ---@field r number
  ---@field pos februum.geom.Point
  local MouseFollower = {}
  MouseFollower.__index = MouseFollower
  setmetatable(MouseFollower, { __index = Obj })

  function MouseFollower.new(x, y, r)
    local self = setmetatable(Obj.new(), MouseFollower)
    self.pos = Point.new(x, y)
    self.r = r or 15
    return self
  end
  function MouseFollower:draw()
    love.graphics.circle("line", self.pos.x, self.pos.y, self.r)
  end
  ---comment
  ---@param world februum.World
  function MouseFollower:update(world)
    if world.worldState.mouseFollow then
      --[[ update position ]]
      local mx, my = love.mouse.getPosition()
      local dx = mx - self.pos.x
      local dy = my - self.pos.y
      -- printf("dx,dy: (%s, %s)\n", dx, dy)
      if dx ~= 0 then
        if dx < 1 then
          --[[ move right ]]
          self.pos.x = self.pos.x - 1
        else
          --[[ move left ]]
          self.pos.x = self.pos.x + 1
        end
      end
      if dy ~= 0 then
        if dy < 1 then
          --[[ move up ]]
          self.pos.y = self.pos.y - 1
        else
          --[[ move down ]]
          self.pos.y = self.pos.y + 1
        end
      end
    end
  end
  return MouseFollower
end)()

local world_modes = {
  default = "default",
  add = "add",
  modify = "modify",
}
local add_mode = {
  circle = "circle",
}
local modify_mode = {
  follow = "follow",
}
---@alias februum.WorldState { mouseFollow: boolean }

local World = (function ()
  ---@class februum.World
  ---@field mode string
  ---@field modeState {subMode: string}
  ---@field worldState februum.WorldState
  ---@field objs februum.Obj[]
  local World = {}
  World.__index = World
  local function initModeState()
    return { subMode = nil }
  end
  function World.new()
    local self = setmetatable({}, World)
    self.mode = world_modes.default
    self.modeState = initModeState()
    self.worldState = {
      mouseFollow = true,
    }
    self.objs = {}
    return self
  end
  function World:draw()
    for _, o in ipairs(self.objs) do
      o:draw()
    end
  end
  function World:update()
    for _, o in ipairs(self.objs) do
      o:update(self)
    end
  end
  ---add Obj (entity) to the world
  ---@param o februum.Obj
  function World:addObj(o)
    --[[ 
      TODO: make sure Objs with the same ID aren't added (no supes)
        Every entity in the world should be unique(?)
    ]]
    table.insert(self.objs, o)
  end
  function World:keypressed(key, scancode, isrepeat)
    printf("world.keypressed: %s, %s, %s\n", key, scancode, isrepeat)
    if key == "escape" then
      self.mode = world_modes.default
      self:resetModeState()
    end
    if self.mode == world_modes.add then
      if key == "c" then
        self.modeState.subMode = add_mode.circle
      end
    elseif self.mode == world_modes.modify then
      if key == "f" then
        self.worldState.mouseFollow = not self.worldState.mouseFollow
      end
    else
      if key == "a" then
        self.mode = world_modes.add
      elseif key == "m" then
        self.mode = world_modes.modify
      end
    end
  end
  function World:mousepressed(x, y, button, istouch, presses)
    printf("world.mousepressed: %s, %s, %s, %s, %s\n", x, y, button, istouch, presses)
    printf("mode: %s\n", self.mode)
    if self.mode == world_modes.add then
      printf("subMode: %s\n", self.modeState.subMode)
      if self.modeState.subMode == add_mode.circle then
        printf("add circle at (%s, %s)\n", x, y)
        local co = CircleObj.new(x, y, 10)
        self:addObj(co)
        --[[ reset state ]]
        self:resetModeState()
      end
    end
  end

  function World:resetModeState()
    self.modeState = initModeState();
  end

  return World
end)()

local function debugInfo()
  local dtStr = string.format("%f", ctx.dt);
  local screenStr = string.format("w: %d, h: %d", ctx.sw, ctx.sh)
  local lines = {}
  table.insert(lines, "hello ~ "..dtStr)
  table.insert(lines, screenStr)
  table.insert(lines, string.format("frame: %s", ctx.frameCount))
  --[[ world statistics ]]
  table.insert(lines, string.format("objs: %s", #ctx.world.objs))
  --[[ world state ]]
  table.insert(lines, "world.worldState:")
  for k,v in pairs(ctx.world.worldState) do
    table.insert(lines, string.format("  %s: %s", k, v))
  end
  --[[ input mode info ]]
  local modeStr = ctx.world.mode..":"..(ctx.world.modeState.subMode or "")
  table.insert(lines, string.format("mode: %s", modeStr))
  if ctx.world.mode ~= world_modes.default then
    local modeStateLines = {}
    for k,v in pairs(ctx.world.modeState) do
      local currStr = string.format("%s: %s", k, v)
      table.insert(modeStateLines, currStr)
    end
    for _, modeStateLine in ipairs(modeStateLines) do
      --[[ indent a bit ]]
      local nextLine = string.format("  %s\n", modeStateLine)
      table.insert(lines, nextLine)
    end
  end

  local printStr = ""
  for _, line in ipairs(lines) do
    printStr = printStr..line.."\n"
  end
  -- print(printStr)
  -- love.graphics.print("hello ~ "..dtStr.."\n"..screenStr, 20, 20)
  love.graphics.print(printStr, 20, 20)
end

function love.keypressed(key, scancode, isrepeat)
  ctx.world:keypressed(key, scancode, isrepeat)
end

function love.mousepressed(x, y, button, istouch, presses)
  -- printf("mousepressed: %s, %s, %s, %s, %s\n", x, y, button, istouch, presses)
  ctx.world:mousepressed(x, y, button, istouch, presses)
end

local function initWorld()
  ctx.world = World.new()
  local mfw = MouseFollower.new(ctx.sw/2, ctx.sh/2)
  ctx.world:addObj(mfw)
end

function love.update(dt)
  -- print(dt)
  ctx.dt = dt
  ctx.sw = love.graphics.getWidth()
  ctx.sh = love.graphics.getHeight()
  if ctx.frameCount == nil then
    ctx.frameCount = 0
  else
    ctx.frameCount = ctx.frameCount + 1
  end
  if ctx.world == nil then
    initWorld()
  end
  ctx.world:update()
end

function love.draw()
  debugInfo()
  local lpsx = math.floor(ctx.sw / 2)
  local lpsy = math.floor(ctx.sh / 2)
  local lpex, lpey = love.mouse.getPosition()
  -- love.graphics.line(lpsx, lpsy, lpex, lpey)
  -- love.graphics.circle("line", lpsx, lpsy, 10)
  -- love.graphics.circle("line", lpex, lpey, 10)
  -- love.graphics.line(lpsx, lpsy, lpsx, lpey)
  -- love.graphics.line(lpsx, lpey, lpex, lpey)
  ctx.world:draw()
end
