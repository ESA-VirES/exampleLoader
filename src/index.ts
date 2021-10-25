// Author: Daniel Santillan
// Copyright (c) EOX IT Services
// Distributed under the terms of the MIT License.

import {
  JupyterFrontEnd, JupyterFrontEndPlugin, IRouter
} from '@jupyterlab/application';
import {IMainMenu} from '@jupyterlab/mainmenu'
import {ILauncher, LauncherModel} from '@jupyterlab/launcher';
import {IFrame} from '@jupyterlab/apputils';
import {IDocumentManager} from '@jupyterlab/docmanager';
import {Menu} from '@lumino/widgets'

/**
 * Initialization data for the exampleLoader extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'exampleLoader',
  autoStart: true,
  requires: [IMainMenu, ILauncher, IDocumentManager, IRouter],
  activate: loadExamples
};

export default extension;

export const MenuItems = [
    {
        name: 'VirES for Aeolus',
        url: 'https://aeolus.services',
        description: 'VirES for Aeolus',
        target: '_blank'
    },
    {
        name: 'Manage Access Tokens',
        url: 'https://aeolus.services/accounts/tokens/',
        description: 'VirES Access Tokens',
        target: '_blank'
    },
    {
        name: 'VirES Account',
        url: 'https://aeolus.services/oauth',
        description: 'VirES Account',
        target: '_blank'
    },
    {
        name: 'VRE Documentation',
        url: 'https://notebooks.aeolus.services/',
        description: 'VRE Documentation',
        target: '_blank'
    },
    {
        name: 'VirES FAQ',
        url: 'https://aeolus.services/faq',
        description: 'VirES Aeolus Frequenty asked Questions',
        target: '_blank'
    },
    {
        name: 'VirES Privacy Notice',
        url: 'https://aeolus.services/privacy_notice',
        description: 'VirES Aeolus Frequenty asked Questions',
        target: '_blank'
    },
    {
        name: 'VirES Service Terms',
        url: 'https://aeolus.services/service_terms',
        description: 'VirES Service Terms',
        target: '_blank'
    },
    {
        name: 'ESA Data Terms',
        url: 'https://aeolus.services/eoxs_static/other/T%26C_for_ESA_Dataset-v1.pdf',
        description: 'ESA Data Terms',
        target: '_blank'
    }
];


export function loadExamples(
  app: JupyterFrontEnd, mainMenu: IMainMenu, launcher: ILauncher,
  docmanager: IDocumentManager, router: IRouter): Promise<void>{

    function onLauncherStateChanged(launcher: LauncherModel) {
        /*
        let litems = (<any>launcher)._items;
        (<any>launcher)._items.splice(index,1);
        (<any>launcher)._items[index].category = 'Other';
        (<any>launcher).stateChanged.emit(void 0);
        */
    }

    function loadExampleNotebooks(result: string){


        const respjson = JSON.parse(result);
        const notebooks = respjson.notebooks;
        for(let ii=0; ii<notebooks.length; ii++){
            appendLauncherCommand(notebooks[ii]);
        }

        (<any>launcher).stateChanged.connect(onLauncherStateChanged);

    }
    docmanager.services.contents.get('shared/Aeolus-notebooks/notebooks.json')
        .then((doc)=>{
            loadExampleNotebooks(doc.content);
        });

    // create new commands and add them to app.commands
    function appendLauncherCommand(item: any) {
        // New command for base template creation
        let command = `vires:${item.path}`;
        let classDesc = 'default';
        if(item.hasOwnProperty('class')){
            classDesc = item.class
        }
        let path = `shared/Aeolus-notebooks/${item.path}`;

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

    // create new commands and add them to app.commands
    function appendNewCommand(item: any) {
        let iframe: IFrame = null;
        let command = `VirES-VRE-${item.name}:show`;
        app.commands.addCommand(command, {
            label: item.name,
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

    MenuItems.forEach(item => appendNewCommand(item));

    // add to mainMenu
    let menu = Private.createMenu(app);
    mainMenu.addMenu(menu, {rank: 1000});
   

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

    console.log(launcher);
    launcher.add({
        category: 'Other',
        command: 'console:create',
        rank: 0,
        args: {
            isLauncher: true,
            kernelPreference: {name: "python3"}
        }
    });

    return Promise.resolve(void 0);
}

/**
 * A namespace for help plugin private functions.
 */

namespace Private {
    /**
     * Creates a menu for the help plugin.
     */
    export function createMenu(app: JupyterFrontEnd): Menu {

        const {commands} = app;
        let menu:Menu = new Menu({commands});
        menu.title.label = 'VirES-VRE';
        MenuItems.forEach(item => menu.addItem({command: `VirES-VRE-${item.name}:show`}));

        return menu;
    }
}