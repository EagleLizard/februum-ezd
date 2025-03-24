
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
  ---@class februum.Entity
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
  ---@class februum.CircleObj
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
    printf("(%s, %s) r: %s\n", self.pos.x, self.pos.y, self.r)
  end
  return CircleObj
end)()

local MouseCircle = (function ()
  ---@class februum.MouseCircle
  ---@field r number
  ---@field pos februum.geom.Point
  local MouseCircle = {}
  MouseCircle.__index = MouseCircle
  setmetatable(MouseCircle, { __index = Obj })

  function MouseCircle.new(x, y, r)
    local self = setmetatable(Obj.new(), MouseCircle)
    self.pos = Point.new(x, y)
    self.r = r or 10
    return self
  end
  function MouseCircle:draw()
    love.graphics.circle("line", self.pos.x, self.pos.y, self.r)
  end
  ---comment
  ---@param world februum.World
  function MouseCircle:update(world)
    if world.mode then
      
    end
  end
  return MouseCircle
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
local World = (function ()
  ---@class februum.World
  ---@field mode string
  ---@field modeState {subMode: string}
  local World = {}
  World.__index = World
  local function initModeState()
    return { subMode = nil }
  end
  function World.new()
    local self = setmetatable({}, World)
    self.mode = world_modes.default
    self.modeState = initModeState()
    return self
  end
  function World:keypressed(key, scancode, isrepeat)
    printf("world.keypressed: %s, %s, %s\n", key, scancode, isrepeat)
    if key == "escape" then
      self.mode = world_modes.default
      self.modeState = initModeState()
    end
    if self.mode == world_modes.add then
      if key == "c" then
        self.modeState.subMode = add_mode.circle
      end
    elseif self.mode == world_modes.modify then
      if key == "f" then
        if not self.modeState[modify_mode.follow] then
          self.modeState[modify_mode.follow] = true
        else
          self.modeState[modify_mode.follow] = false
        end
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
    printf("world.mousepressed: %s, %s, %s, %s, %s", x, y, button, istouch, presses)
    printf("mode: %s\n", self.mode)
    if self.mode == world_modes.add then
      printf("subMode: %s\n", self.modeState.subMode)
      if self.modeState.subMode == add_mode.circle then
        printf("add circle at (%s, %s)\n", x, y)
        self.modeState = initModeState()
      end
    end
  end
  return World
end)()

-- function love.load()
--   ctx.frameCount = 0
-- end

function love.keypressed(key, scancode, isrepeat)
  ctx.world:keypressed(key, scancode, isrepeat)
end
function love.mousepressed(x, y, button, istouch, presses)
  -- printf("mousepressed: %s, %s, %s, %s, %s\n", x, y, button, istouch, presses)
  ctx.world:mousepressed(x, y, button, istouch, presses)
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
    ctx.world = World.new()
  end
end

function love.draw()
  local dtStr = string.format("%f", ctx.dt);
  local screenStr = string.format("w: %d, h: %d", ctx.sw, ctx.sh)
  local lines = {}
  table.insert(lines, "hello ~ "..dtStr)
  table.insert(lines, screenStr)
  table.insert(lines, string.format("frame: %s", ctx.frameCount))
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
  local lpsx = math.floor(ctx.sw / 2)
  local lpsy = math.floor(ctx.sh / 2)
  local lpex, lpey = love.mouse.getPosition()
  -- love.graphics.line(lpsx, lpsy, lpex, lpey)
  -- love.graphics.circle("line", lpsx, lpsy, 10)
  -- love.graphics.circle("line", lpex, lpey, 10)
  -- love.graphics.line(lpsx, lpsy, lpsx, lpey)
  -- love.graphics.line(lpsx, lpey, lpex, lpey)
end
