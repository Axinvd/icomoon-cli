# icomoon-cli

icomoon-cli is a cross-platform command line tool which help you upload your new icons.
Since icomoon do not provide any public API to use, you may found it's hard to integrate icomoon into your current workflow. icomoon-cli was made to solve this.

## cli usage

If you like to use icomoon-cli as a cli, simply installed it via npm and use with following commands

```shell
Install: npm i -g @axinvd/icomoon-cli

Usage: icomoon-cli [command]
Commands:
  -V, --version                 output the version number
  -s, --selection [string]      path to icomoon selection file (default: "./icomoon.json")
  -i, --icons <sting...>        path to icons need to be imported
  -f, --outputFont [string...]  output font path with type, separated by coma
  -l, --lock [string]           path to lock file (default: "./icomoon-lock.json")
  -o, --output [string]         all icomoon generated files path (default: "tempDir/icomoon-cli")
  -n, --outputNames [string]    path to icons const
  -v, --visible                 run a GUI chrome instead of headless mode (default: false)
  -m, --mode [string]           mode 'add' or 'repository' (default: "add")
  -h, --help                    display help for command

Example Usages:
 icomoon-cli -i test/*.svg -f ./test,ttf -s test/myfont -m repository
 icomoon-cli -i test/add.svg test/alert.svg -o ./test
 icomoon-cli -i test/*.svg -s ./test -f ./test,ttf -n test/iconNames.ts -l test/icomoon-lock.json
```
