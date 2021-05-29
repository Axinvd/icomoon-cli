# icomoon-cli

icomoon-cli is a cross platform command line tool which help you upload your new icons into an existed icomoon set.

Since icomoon do not provide any public API to use, you may found it's hard to integrate icomoon into your current workflow. icomoon-cli was made to solve this.

## cli usage

If you like to use icomoon-cli as a cli, simply installed it via npm and use with following commands

```shell
Install: npm i -g icomoon-cli

Usage: icomoon-cli [command]
Commands:
  --version        output the version number
  -h, --help       output usage information
  -i, --icons      paths to icons need to be imported, separated by comma
  -s, --selection  path to icomoon selection file
  -r, --repository folder where icons are maintained, additions and deletions.
  -n, --names      rename icons, separated by comma, matched by index
  -o, --output     output directory
  -f, --force      force override current icon when icon name duplicated
  -v, --visible    run a GUI chrome instead of headless mode

Example Usage: icomoon-cli -i test-assets/1.svg,test-assets/2.svg -s test-assets/selection.json -n newname1,newname2 -o output
```
