import { sprintf } from "https://deno.land/std@0.96.0/fmt/printf.ts";

export async function pop(args: unknown[], name: string, def: any) : Promise<unknown> {
  const pattern = new RegExp(sprintf('^-%s(=.*)?$', name));
  const i = index(args, pattern) as number;
  if (i == -1) {
    return def;
  }
  const value = args.splice(i, 1)[0] as string;
  return value.match(/^-[^=]+=/) ? value.split('=')[1] : true;
}

function index(args: unknown[], pattern: RegExp) : number {
  const a = args as string[];
  for (let i in a) {
    if (a[i].match(pattern)) {
      return parseInt(i);
    }
  }
  return -1;
}
