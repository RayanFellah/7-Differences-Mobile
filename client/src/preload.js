const { contextBridge, ipcRenderer } = require('electron');

console.log("Preload script is being executed.");
contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => {
        console.log(`Sending message via ${channel}`, data);
        ipcRenderer.send(channel, data);
    },
    receive: (channel, callback) => {
        console.log(`Receiving message via ${channel}`);
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
});