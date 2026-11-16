// Used only by local checks. No provider request may leave this process.
import { syncBuiltinESMExports } from "node:module";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";
import dns from "node:dns";
const blocked = () => { throw new Error("Network disabled for offline checks"); };
globalThis.fetch = async () => { throw new Error("Network disabled for offline checks"); };
for (const api of [http, https]) {
  api.request = blocked;
  api.get = blocked;
}
net.Socket.prototype.connect = blocked;
tls.connect = blocked;
for (const name of ["lookup", "resolve", "resolve4", "resolve6"]) {
  dns[name] = blocked;
  dns.promises[name] = async () => blocked();
}
syncBuiltinESMExports();
