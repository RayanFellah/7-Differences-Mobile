const { app, BrowserWindow, ipcMain, powerSaveBlocker } = require('electron');
const url = require('url');
const path = require('path');

let mainWindow;
let chatWindow;

function createWindow() {
    powerSaveBlocker.start('prevent-app-suspension');
    app.commandLine.appendSwitch('disable-backgrounding-occluded-windows', 'true');

    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        fullscreen: true,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/client/index.html`),
            protocol: 'file:',
            slashes: true,
        })
    );

    mainWindow.on('closed', function () {
        mainWindow = null;
        if (chatWindow) {
            chatWindow.close();
        }
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

ipcMain.on('open-channel-widget', (event) => {
    if (chatWindow) {
        chatWindow.focus(); 
        return;
    }
    chatWindow = new BrowserWindow({
        width: 1000,
        height: 1000,
        webPreferences: {
            //preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false,
            nodeIntegration: true,
        },
    });
    chatWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/client/index.html`),
            protocol: 'file:',
            slashes: true,
            hash: '/windowedChat',
        })
    );
    chatWindow.on('closed', () => {
        chatWindow = null;
        console.log('CLOSED');
        if (mainWindow) {
            mainWindow.webContents.send('chat-window-closed');
        }
    });
    ipcMain.on('requestInit', () => {
        if (mainWindow){
            mainWindow.webContents.send('requestInit');
        }
    });
    ipcMain.on('sendUsername', (event, data) => {
        console.log('Username:', data);
        if(chatWindow){
            chatWindow.webContents.send('username', data);
        }
    });
    ipcMain.on('sendTheme', (event, isThemeDark ) => {
        console.log('Theme:', isThemeDark);
        if(chatWindow){
            chatWindow.webContents.send('theme', isThemeDark);
        }
    });
});