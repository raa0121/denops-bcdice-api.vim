import { Vim } from "../deps.ts"

export async function open(vim: Vim, bufname: string): Promise<number> {
  let bufnr = await vim.call("bufnr", bufname) as number;
  if (bufnr === -1) {
    await vim.cmd(`execute 'edit' fnameescape(bufname)`, { bufname });
    bufnr = await vim.call("bufnr", bufname) as number;
  }
  return bufnr;
}

export async function append(vim: Vim, bufnr: number, text: string|string[]) : Promise<void> {
  const buflines = await vim.call("getbufline", bufnr, 1, '$') as string[];
  let bufline = 0;
  if (buflines.length === 1 && buflines[0] !== "") {
    bufline = buflines.length
  }
  if (buflines.length !== 1) {
    bufline = buflines.length
  }
  await vim.call("setbufline", bufnr, bufline + 1, text);
}

export async function update(vim : Vim, bufnr: number) : Promise<void> {
  await Promise.all([
    vim.call("setbufvar", bufnr, "&buftype", "nofile"),
    vim.call("setbufvar", bufnr, "&bufhidden", "wipe"),
    vim.call("setbufvar", bufnr, "&swapfile", 0),
    vim.call("setbufvar", bufnr, "&backup", 0),
    vim.call("setbufvar", bufnr, "&foldenable", 0),
    vim.call("setbufvar", bufnr, "&filetype", "bcdice-api-result"),
  ]);
}
