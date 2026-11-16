import { lua, lauxlib, lualib, to_luastring, to_jsstring } from "fengari";

// Execute the shipped Lua scripts in a real Lua VM with an isolated Redis command
// surface. This tests atomic state transitions without connecting to any service.
export function fakeRedis(clock) {
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);
  function run(source) {
    lua.lua_settop(L, 0);
    if (lauxlib.luaL_dostring(L, to_luastring(source)) !== lua.LUA_OK) throw new Error(to_jsstring(lua.lua_tostring(L, -1)));
    function read(index) {
      switch (lua.lua_type(L, index)) {
        case lua.LUA_TNUMBER: return lua.lua_tonumber(L, index);
        case lua.LUA_TSTRING: return to_jsstring(lua.lua_tostring(L, index));
        case lua.LUA_TBOOLEAN: return lua.lua_toboolean(L, index);
        case lua.LUA_TTABLE: {
          const absolute = lua.lua_absindex(L, index);
          const result = [];
          for (let i = 1; i <= lua.lua_rawlen(L, absolute); i++) {
            lua.lua_rawgeti(L, absolute, i); result.push(read(-1)); lua.lua_pop(L, 1);
          }
          return result;
        }
        default: return null;
      }
    }
    return read(-1);
  }
  run(`
    data = {}; expiry = {}; redis = {}
    function redis.call(command, key, ...)
      local args = {...}
      if expiry[key] and expiry[key] <= NOW then data[key] = nil; expiry[key] = nil end
      if command == "GET" then return data[key] or false end
      if command == "EXISTS" then return data[key] and 1 or 0 end
      if command == "SET" then
        data[key] = args[1]; expiry[key] = nil
        if args[2] == "EX" then expiry[key] = NOW + tonumber(args[3]) * 1000 end
        return "OK"
      end
      if command == "INCR" then data[key] = tonumber(data[key] or 0) + 1; return data[key] end
      if command == "EXPIRE" then expiry[key] = NOW + tonumber(args[1]) * 1000; return 1 end
      if command == "HSET" then
        data[key] = data[key] or {}
        for i = 1, #args, 2 do data[key][args[i]] = tostring(args[i+1]) end
        return 1
      end
      if command == "HGET" then return data[key] and data[key][args[1]] or false end
      if command == "HINCRBY" then
        data[key][args[1]] = tonumber(data[key][args[1]] or 0) + tonumber(args[2])
        return data[key][args[1]]
      end
      error("Unexpected Redis command " .. command)
    end
  `);
  const encode = (items) => `{${items.map((v) => JSON.stringify(String(v))).join(",")}}`;
  return async (...command) => {
    const prefix = `NOW = ${clock()}; `;
    if (command[0] === "EVAL") {
      const [, script, count, ...args] = command;
      return run(`${prefix}KEYS = ${encode(args.slice(0, count))}; ARGV = ${encode(args.slice(count))}; ${script}`);
    }
    return run(`${prefix}return redis.call(${command.map((v) => JSON.stringify(String(v))).join(",")})`);
  };
}
