import { Denops } from "../deps.ts"

export async function open(denops: Denops, bufname: string): Promise<number> {
  let bufnr = await denops.call("bufnr", bufname) as number;
  if (bufnr === -1) {
    await denops.cmd(`execute 'edit' fnameescape(bufname)`, { bufname });
    bufnr = await denops.call("bufnr", bufname) as number;
  }
  return bufnr;
}

export async function append(denops: Denops, bufnr: number, text: string|string[]) : Promise<void> {
  const buflines = await denops.call("getbufline", bufnr, 1, '$') as string[];
  let bufline = 0;
  if (buflines.length === 1 && buflines[0] !== "") {
    bufline = buflines.length
  }
  if (buflines.length !== 1) {
    bufline = buflines.length
  }
  await denops.call("setbufline", bufnr, bufline + 1, text);
}

export async function update(denops : Denops, bufnr: number) : Promise<void> {
  await Promise.all([
    denops.call("setbufvar", bufnr, "&buftype", "nofile"),
    denops.call("setbufvar", bufnr, "&bufhidden", "wipe"),
    denops.call("setbufvar", bufnr, "&swapfile", 0),
    denops.call("setbufvar", bufnr, "&backup", 0),
    denops.call("setbufvar", bufnr, "&foldenable", 0),
    denops.call("setbufvar", bufnr, "&filetype", "bcdice-api-result"),
  ]);
}
