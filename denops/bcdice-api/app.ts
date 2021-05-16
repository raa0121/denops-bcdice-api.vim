import { main, ensureString, ensureArray } from "./deps.ts"
import * as ky from "http://esm.sh/ky@0.28.0";
import * as apiTypes from "./types.ts"
import * as buffer from "./vim/buffer.ts"
import * as vimArgs from "./vim/args.ts"

main(async ({ vim }) => {
  // ここにプラグインの初期化処理を記載する
  const API_BASE: string = await vim.g.get("bcdice_api_entrypoint") ||
    "https://bcdice-api.raa0121.info/v2";
  const api = ky.default.create({ prefixUrl: API_BASE });
  const bufname = "bcdice-api://result";
  vim.register({
    async version(): Promise<void> {
      const result = await api.get("version").json<apiTypes.VersionRes>();
      const bufnr = await buffer.open(vim, bufname);
      await buffer.append(vim, bufnr, ["API: " + result.api, "BCDice: " + result.bcdice]);
      buffer.update(vim, bufnr);
    },
    async admin(): Promise<void> {
      const result = await api.get("admin").json<apiTypes.AdminRes>();
      const bufnr = await buffer.open(vim, bufname);
      await buffer.append(vim, bufnr, ["Owner: " + result.name, "Email: " + result.email]);
      buffer.update(vim, bufnr);
    },
    async game_system(): Promise<void> {
      const result = await api.get("game_system").json<apiTypes.GameSystemRes>();
      const bufnr = await buffer.open(vim, bufname);
      await buffer.append(vim, bufnr, result.game_system.map((v) => v.id + "\t" + v.name));
      buffer.update(vim, bufnr);
    },
    async game_system_info(text: unknown): Promise<void> {
      ensureString(text, "text");
      const id = await Promise.resolve(text);
      const result = await api.get(`game_system/${id}`).json<apiTypes.GameSystemInfoRes>();
      let lines = [result.name, ""];
      lines = lines.concat(result.help_message.split(/\n/));
      const bufnr = await buffer.open(vim, bufname);
      await buffer.append(vim, bufnr, lines);
      buffer.update(vim, bufnr);
    },
    async roll(...args: unknown[]): Promise<void> {
      ensureArray(args, 'args');
      const commands = await Promise.resolve(args) as string[];
      const system = await vimArgs.pop(commands, 'system', 'DiceBot');
      const systems = await api.get(`game_system`).json<apiTypes.GameSystemRes>();
      if (false === systems.game_system.some((v) => v.id == system)) {
        console.error(`${system} is not available.`);
        return;
      }
      const result = await api.get(`game_system/${system}/roll?command=${commands[0]}`).json<apiTypes.RollRes>();
      const bufnr = await buffer.open(vim, bufname);
      await buffer.append(vim, bufnr, result.text);
      buffer.update(vim, bufnr);
    },
  });
  await vim.execute(`
    command! BCDiceAPIVersion call denops#request('${vim.name}', 'version', [])
    command! BCDiceAPIAdmin call denops#request('${vim.name}', 'admin', [])
    command! BCDiceAPIGameSystem call denops#request('${vim.name}', 'game_system', [])
    command! -nargs=1 BCDiceAPIGameSystemInfo call denops#request('${vim.name}', 'game_system_info', [<q-args>])
    command! -nargs=+ BCDiceAPIRoll call denops#request('${vim.name}', 'roll', [<f-args>])
  `);
});
