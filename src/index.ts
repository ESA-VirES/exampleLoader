import {
  JupyterFrontEnd, JupyterFrontEndPlugin, IRouter
} from '@jupyterlab/application';
import {ILauncher, LauncherModel} from '@jupyterlab/launcher';
//import {IFrame} from '@jupyterlab/apputils';
import {IDocumentManager} from '@jupyterlab/docmanager';
//import {ServerConnection} from '@jupyterlab/services';

/**
 * Initialization data for the exampleLoader extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'exampleLoader',
  autoStart: true,
  requires: [ILauncher, IDocumentManager, IRouter],
  activate: loadExamples
};

export default extension;

export function loadExamples(
  app: JupyterFrontEnd, launcher: ILauncher,
  docmanager: IDocumentManager, router: IRouter): Promise<void>{

    function onLauncherStateChanged(launcher: LauncherModel) {
        // TODO: This is really not the way this should be done but i can't find
        // any alternative to modify what is shown on the launcher so i register
        // to the change event of the launcher and modify once the items appear
        // that i would like to modify or remove

        let litems = (<any>launcher)._items;
        let index = -1;
        for(let jj=0; jj<litems.length; jj++){
            if(litems[jj].category === 'Console'){
                index = jj;
                console.log('Found console item');
                console.log(JSON.stringify(litems[jj]));
            }
        }
        if (index !== -1){
            //(<any>KNOWN_CATEGORIES) = ['Notebook', 'Other'];
            //(<any>launcher)._items.splice(index,1);
            //(<any>launcher)._items[index].category = 'Other';
            //(<any>launcher).stateChanged.emit(void 0);
        }
    }

    function loadExampleNotebooks(result: string){


        const respjson = JSON.parse(result);
        const notebooks = respjson.notebooks;
        for(let ii=0; ii<notebooks.length; ii++){
            appendLauncherCommand(notebooks[ii]);
        }

        (<any>launcher).stateChanged.connect(onLauncherStateChanged);

    }

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            loadExampleNotebooks(xmlHttp.responseText);
        }
    }
    xmlHttp.open(
        "GET",
        'https://raw.githubusercontent.com/Swarm-DISC/Swarm_notebooks/master/notebooks.json',
        true
    );
    xmlHttp.send(null);

    // create new commands and add them to app.commands
    function appendLauncherCommand(item: any) {
        // New command for base template creation
        let command = `vires:${item.path}`;
        let classDesc = 'default';
        if(item.hasOwnProperty('class')){
            classDesc = item.class
        }
        let path = `shared/Swarm_notebooks/${item.path}`;

        app.commands.addCommand(command, {
            label: item.name,
            iconClass: classDesc,
            execute: () => {
                docmanager.copy(path, '')
                    .then((result)=>{
                        docmanager.open(result.path);
                    });
            }
        });

        let rank = 0;
        if(item.hasOwnProperty('rank')){
            rank = item.rank;
        }
        launcher.add({
            category: item.group,
            command: command,
            rank: rank
        });
    }

    /*
    // create new commands and add them to app.commands
    function appendNewCommand(item: any) {
        let iframe: IFrame = null;
        let command = `vires:${item.name}`;
        app.commands.addCommand(command, {
            label: item.name,
            iconClass: item.iconClass,
            execute: () => {
                if (item.target == '_blank') {
                    let win = window.open(item.url, '_blank');
                    win.focus();
                } else if (item.target == 'widget') {
                    if (!iframe) {
                        iframe = new IFrame();
                        iframe.sandbox = ['allow-scripts'];
                        iframe.url = item.url;
                        iframe.id = item.name;
                        iframe.title.label = item.name;
                        iframe.title.closable = true;
                        iframe.node.style.overflowY = 'auto';
                    }

                    if (iframe == null || !iframe.isAttached) {
                        app.shell.add(iframe, 'main');
                        app.shell.activateById(iframe.id);
                    } else {
                        app.shell.activateById(iframe.id);
                    }
                }
            }
        });
    }

    appendNewCommand({
        name: 'Example Loader',
        target: 'widget',
        url: 'https://swarm-vre.readthedocs.io/en/staging/',
        iconClass: 'exampleLoaderIcon'
    });

    launcher.add({
        category: 'VirES',
        command: 'vires:Example Loader',
        rank: 0
    });
    */

    router.register({
        command: 'vires:copyRouter',
        pattern:  /(\?copy|\&copy)([^?]+)/
    });

    app.commands.addCommand('vires:copyRouter', {
        label: 'Router command for copy functionality',
        iconClass: 'templateIcon',
        execute: (args) => {
            const path = (args.search as string).replace('?copy', '');
            docmanager.copy(path, '')
                .then((result)=>{
                    docmanager.open(result.path);
                });
        }
    });



    return Promise.resolve(void 0);
}