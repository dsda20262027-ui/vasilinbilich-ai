const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("vasilin",{
  request:(baseUrl,endpoint,payload)=>ipcRenderer.invoke("api-request",{baseUrl,endpoint,payload})
});
