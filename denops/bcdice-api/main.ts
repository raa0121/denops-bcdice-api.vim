import { Denops, ensureArray, ensureString, execute, ky, vars } from "./deps.ts";
import * as apiTypes from "./types.ts";
import * as buffer from "./vim/buffer.ts";
import * as vimArgs from "./vim/args.ts";

export async function main(denops: Denops): Promise<void> {
  const API_BASE: string = await vars.g.get(denops, "bcdice_api_entrypoint") ||
    "https://bcdice-api.raa0121.info/v2";
  const api = ky.create({ prefixUrl: API_BASE });
  const bufname = "bcdice://result";
  denops.dispatcher = {
    async version(): Promise<void> {
      const result = await api.get("version").json<apiTypes.VersionRes>();
      const bufnr = await buffer.open(denops, bufname);
      await buffer.append(denops, bufnr, [
        "API: " + result.api,
        "BCDice: " + result.bcdice,
      ]);
      buffer.update(denops, bufnr);
    },
    async admin(): Promise<void> {
      const result = await api.get("admin").json<apiTypes.AdminRes>();
      const bufnr = await buffer.open(denops, bufname);
      await buffer.append(denops, bufnr, [
        "Owner: " + result.name,
        "Email: " + result.email,
      ]);
      buffer.update(denops, bufnr);
    },
    async game_system(): Promise<void> {
      const result = await api.get("game_system").json<
        apiTypes.GameSystemRes
      >();
      const bufnr = await buffer.open(denops, bufname);
      await buffer.append(
        denops,
        bufnr,
        result.game_system.map((v) => v.id + "\t" + v.name),
      );
      buffer.update(denops, bufnr);
    },
    async game_system_info(text: unknown): Promise<void> {
      ensureString(text);
      const id = await Promise.resolve(text);
      const systems = await api.get(`game_system`).json<
        apiTypes.GameSystemRes
      >();
      if (false === systems.game_system.some((v) => v.id == id)) {
        console.error(`${id} is not available.`);
        return;
      }
      const result = await api.get(`game_system/${id}`).json<apiTypes.GameSystemInfoRes>();
      let lines = [result.name, ""];
      lines = lines.concat(result.help_message.split(/\n/));
      const bufnr = await buffer.open(denops, bufname);
      await buffer.append(denops, bufnr, lines);
      buffer.update(denops, bufnr);
    },
    async roll(...args: unknown[]): Promise<void> {
      ensureArray(args);
      const commands = await Promise.resolve(args) as string[];
      const system = await vimArgs.pop(commands, "system", "DiceBot");
      const systems = await api.get(`game_system`).json<apiTypes.GameSystemRes>();
      if (false === systems.game_system.some((v) => v.id == system)) {
        console.error(`${system} is not available.`);
        return;
      }
      const result = await api.get(
        `game_system/${system}/roll?command=${commands[0]}`,
      ).json<apiTypes.RollRes>();
      const bufnr = await buffer.open(denops, bufname);
      await buffer.append(denops, bufnr, result.text);
      buffer.update(denops, bufnr);
    },
  };
  await execute(
    denops,
    `command! BCDiceAPIVersion call denops#request('${denops.name}', 'version', [])
     command! BCDiceAPIAdmin call denops#request('${denops.name}', 'admin', [])
     command! BCDiceAPIGameSystem call denops#request('${denops.name}', 'game_system', [])
     command! -nargs=1 BCDiceAPIGameSystemInfo call denops#request('${denops.name}', 'game_system_info', [<q-args>])
     command! -nargs=+ BCDiceAPIRoll call denops#request('${denops.name}', 'roll', [<f-args>])
    `,
  );
}
