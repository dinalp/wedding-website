// Exercise page event handlers and rendered output without a browser or providers.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);

export function pageHarness(file, dependencies) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useRef(initial) {
      return hooks.useState(() => ({ current: initial }))[0];
    },
    useCallback(callback, deps) {
      const index = cursor++;
      if (!slots[index] || deps.some((dep, i) => dep !== slots[index].deps[i])) slots[index] = { callback, deps };
      return slots[index].callback;
    },
    useEffect(effect, deps) {
      const index = cursor++;
      if (!slots[index] || deps.some((dep, i) => dep !== slots[index][i])) effects.push(effect);
      slots[index] = deps;
    },
  };
  const source = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const compiled = { exports: {} };
  const imports = { react: hooks, ...dependencies };
  new Function("require", "module", "exports", source)((name) => {
    if (Object.hasOwn(imports, name)) return imports[name];
    if (name === "react/jsx-runtime") return require(name);
    throw new Error(`Page test needs an explicit dependency: ${name}`);
  }, compiled, compiled.exports);
  return () => {
    cursor = 0;
    const tree = compiled.exports.default();
    const pending = effects;
    effects = [];
    pending.forEach((effect) => effect());
    return tree;
  };
}
