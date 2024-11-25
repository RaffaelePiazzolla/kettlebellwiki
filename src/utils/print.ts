import chalk from 'chalk';

function prefix(tag: string = '', color: boolean = true) {
  if (color) return chalk.magenta(`[app${tag && ':' + tag}]`);
  return `[app${tag && ':' + tag}]`;
}

export default function print(...params: any[]) {
  console.log(prefix(), ...params.map(param => {
    return chalk.magentaBright(param);
  }));
}

print.log = function (...params: any[]) {
  console.error(prefix('log'), ...params.map(param => {
    return chalk.greenBright(param);
  }));
}

print.error = function (...params: any[]) {
  console.error(prefix('error'), ...params.map(param => {
    return chalk.redBright(param);
  }));
}

print.errorTrace = function (...params: any[]) {
  console.trace(prefix('error'), ...params.map(param => {
    return chalk.redBright(param);
  }));
}

print.warn = function (...params: any[]) {
  console.warn(prefix('warn'), ...params.map(param => {
    return chalk.yellowBright(param);
  }));
}

print.loading = function (...params: any[]) {
  console.warn(prefix('loading'), ...params.map(param => {
    return chalk.cyanBright(param);
  }));
}

print.intro = function () {
  console.log(`\n--------- ${new Date()} ---------\n`);
}