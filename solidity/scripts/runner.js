require('dotenv').config({ path: `${process.cwd()}/.env` });
const { exec } = require('child_process');
const isWin = process.platform === 'win32';
const runner = isWin ? 'cmd.exe' : 'sh';
const fileToRun = process.argv.slice(2)[0];
const paramsForScript = process.argv.slice(3);

const child = exec(
  `${runner} ${fileToRun} ${paramsForScript.join(' ')}`,
  {
    env: process.env,
  },
  (error, stdout, stderr) => {
    console.log(stderr);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  },
);

child.stdout.setEncoding('utf8');
child.stdout.on('data', console.log);
