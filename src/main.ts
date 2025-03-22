
// type CommandKeys = 'md' | 'md0' | never;
type FebruumCommand = 'markdown' | 'markdown0' | never;
const cmd_map = {
  md: 'markdown',
  md0: 'markdown0',
} as const;
type FebruumArgs = {
  cmd: FebruumCommand;
} & {};

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
    throw e;
  }
})();

async function main() {
  procName();
  let fArgs = parseArgs();
  console.log('hi ~');
  switch(fArgs?.cmd){
    case 'markdown':
      await (await import('./lib/md/md-main')).mdMain();
      break;
    case 'markdown0':
      await (await import('./lib/md/md')).md();
      break;
    case undefined:
      printCmds();
  }
}

function printCmds() {
  console.log('commands:');
  for(const cmdKey in cmd_map) {
    console.log(`${cmdKey}`);
  }
}

function parseArgs(): FebruumArgs | undefined {
  let args = process.argv.slice(2);
  let cmd: FebruumCommand;
  /* simple string matching is fine for now */
  let firstArg = args[0];
  if(firstArg === undefined) {
    return;
  }
  switch(firstArg) {
    case 'md':
      cmd = cmd_map.md;
      break;
    case 'md0':
      cmd = cmd_map.md0;
      break;
    default:
      throw new Error(`invalid command: ${firstArg}`);
  }
  return {
    cmd,
  };
}

function procName() {
  process.title = 'februum-ezd';
}
