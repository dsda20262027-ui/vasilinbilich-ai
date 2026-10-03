require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json({limit:"2mb"}));

const port = Number(process.env.PORT || 8787);
const textModel = process.env.OPENAI_TEXT_MODEL || "gpt-6-luna";
const imageModel = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

if (!process.env.OPENAI_API_KEY) console.warn("OPENAI_API_KEY is not configured.");
const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});

const buckets = new Map();
const WINDOW_MS = 60000;
const MAX_REQUESTS = 30;

function rateLimit(req,res,next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b || now-b.started > WINDOW_MS) {
    b={started:now,count:1}; buckets.set(ip,b); return next();
  }
  b.count++;
  if (b.count > MAX_REQUESTS) return res.status(429).json({error:"Слишком много запросов. Попробуйте позже."});
  next();
}
app.use(rateLimit);

app.get("/health",(_req,res)=>res.json({ok:true,service:"vasilinbilich-ai"}));

app.post("/chat",async(req,res)=>{
  try {
    const message=String(req.body?.message||"").trim();
    const history=Array.isArray(req.body?.history)?req.body.history:[];
    if(!message) return res.status(400).json({error:"Пустое сообщение."});
    const input=[
      ...history.filter(m=>m&&(m.role==="user"||m.role==="assistant")).slice(-20)
        .map(m=>({role:m.role,content:String(m.content||"")})),
      {role:"user",content:message}
    ];
    const response=await client.responses.create({model:textModel,input});
    res.json({text:response.output_text||"Не удалось получить ответ."});
  } catch(e) {
    console.error(e);
    res.status(500).json({error:"Ошибка AI-сервера."});
  }
});

app.post("/image",async(req,res)=>{
  try {
    const prompt=String(req.body?.prompt||"").trim();
    if(!prompt) return res.status(400).json({error:"Пустое описание изображения."});
    const result=await client.images.generate({model:imageModel,prompt,size:"1024x1024"});
    const item=result?.data?.[0];
    if(!item?.b64_json) return res.status(502).json({error:"Сервер не вернул картинку."});
    res.json({mimeType:"image/png",data:item.b64_json});
  } catch(e) {
    console.error(e);
    res.status(500).json({error:"Ошибка генерации изображения."});
  }
});

app.listen(port,"0.0.0.0",()=>console.log("ВасилинБилич AI server listening on :"+port));
