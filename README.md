# Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)

## SFDX basic commands
```shell

sfdx force:auth:web:login --setalias prot01 --setdefaultusername

sfdx force:org:create -f config/project-scratch-def.json -s -a custom-path
-a, --setalias=setalias
-c, --noancestors
-d, --durationdays=durationdays
-f, --definitionfile=definitionfile
-i, --clientid=clientid
-n, --nonamespace
-s, --setdefaultusername
-t, --type=(scratch|sandbox)
-u, --targetusername=targetusername
-v, --targetdevhubusername=targetdevhubusername
-w, --wait=wait
--apiversion=apiversion
--json
--loglevel=(trace|debug|info|warn|error|fatal)

sfdx force:org:list --all

sfdx force:org:open

sfdx force:project:create -n|--projectname MyProject --manifest --template empty|standard
-d, --outputdir=outputdir
-n, --projectname=projectname
-p, --defaultpackagedir=defaultpackagedir
-s, --namespace=namespace
-t, --template=standard|empty|analytics
-x, --manifest
--json
--loglevel=(trace|debug|info|warn|error|fatal)

sfdx force:lightning:component:create -n restrictedPath -d force-app/main/default/lwc --type lwc

```
