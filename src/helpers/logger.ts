import chalk from 'chalk'

export const getLogString = (message: string): string => {
  return '[icomoon-cli] ' + message
}

const log = (message: string): void => {
  process.stdout.write(getLogString(message) + '\n')
}

export const logger = {
  error: (message: string): void => log(chalk.red(message)),
  warn: (message: string): void => log(chalk.yellow(message)),
  log,
}
