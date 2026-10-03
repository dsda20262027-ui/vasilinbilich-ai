const {app,BrowserWindow,ipcMain}=require("electron");
const path=require("path");
let mainWindow;
function createWindow(){
  mainWindow=new BrowserWindow({
    width:1120,height:760,minWidth:820,minHeight:620,
    backgroundColor:"#0b1020",
    webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false},
    autoHideMenuBar:true
  });
  mainWindow.loadFile(path.join(__dirname,"index.html"));
}
ipcMain.handle("api-request",async(_event,{baseUrl,endpoint,payload})=>{
  const url=new URL(endpoint,baseUrl.endsWith("/")?baseUrl:baseUrl+"/").toString();
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),120000);
  try{
    const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload||{}),signal:controller.signal});
    const raw=await response.text();
    let data; try{data=JSON.parse(raw)}catch{data={error:raw||"Некорректный ответ сервера."}}
    if(!response.ok) throw new Error(data.error||("HTTP "+response.status));
    return data;
  }finally{clearTimeout(timeout)}
});
app.whenReady().then(createWindow);
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});
