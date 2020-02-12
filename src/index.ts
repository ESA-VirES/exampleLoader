import {
  JupyterFrontEnd, JupyterFrontEndPlugin, IRouter
} from '@jupyterlab/application';
import {ILauncher} from '@jupyterlab/launcher';
import {IFrame} from '@jupyterlab/apputils';
import {IDocumentManager} from '@jupyterlab/docmanager';

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

    router.register({
        command: 'vires:copyRouter',
        pattern:  /(\?copy|\&copy)([^?]+)/
    });

    /*appendNewCommand({
        name: 'Example Loader',
        target: 'widget',
        url: 'https://edc-dev-nbviewer.hub.eox.at/localfile',
        iconClass: 'exampleLoaderIcon'
    });*/

    appendNewCommand({
        name: 'Example Loader',
        target: 'widget',
        url: 'https://swarm-vre.readthedocs.io/en/staging/',
        iconClass: 'exampleLoaderIcon'
    });


    // New command for base template creation
    app.commands.addCommand('vires:loadBaseTemplate', {
        label: 'Load basic VirES python template',
        iconClass: 'templateIcon',
        execute: () => {
            docmanager.copy('VirES/data/templateTest.ipynb', '')
                .then((result)=>{
                    docmanager.open(result.path);
                });
        }
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

    console.log(docmanager);

    launcher.add({
        category: 'VirES',
        command: 'vires:Example Loader',
        rank: 0
    });

    launcher.add({
        category: 'VirES',
        command: 'vires:loadBaseTemplate',
        rank: 1
    });

    return Promise.resolve(void 0);
}