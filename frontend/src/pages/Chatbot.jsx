import { useState,useRef,useEffect } from "react";
import { Send } from "lucide-react";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import TypingDots from "../components/TypingDots";
import ChatSidebar from "../components/ChatSidebar";


const toTitleCase = n => n?.toLowerCase().split(" ")
  .map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");


export default function Chatbot(){

  // USER =====================================================================================
  const [USER_NAME,setUSER_NAME] = useState("Pengguna");
  const [USER_ID,setUSER_ID]       = useState(null);

  useEffect(()=>{
    const token = localStorage.getItem("accessToken");
    if(!token) return;
    const d=JSON.parse(atob(token.split(".")[1]));
    setUSER_NAME(toTitleCase(d.full_name));
    setUSER_ID(d.id);
  },[]);


  // CHAT ======================================================================================
  const [sessionId,setSessionId]  = useState(null);
  const [messages,setMessages]    = useState([]);
  const [input,setInput]          = useState("");
  const [loading,setLoading]      = useState(false);

  const bottomRef = useRef(null);
  useEffect(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),[messages,loading]);


  // AUTO CREATE SESSION
  const createSession = async()=>{
    const token = localStorage.getItem("accessToken");
    const res = await fetch("http://localhost:5000/api/chat/session",{
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body:JSON.stringify({ userId:USER_ID })
    });
    const data = await res.json();
    setSessionId(data.id);
    return data.id;
  };


  // LOAD HISTORY
  const loadMessages = async(id)=>{
    const token = localStorage.getItem("accessToken");
    const r = await fetch(`http://localhost:5000/api/chat/messages/${id}`,{
      headers:{ Authorization:`Bearer ${token}` }
    });
    const data = await r.json();
    setSessionId(id);
    setMessages(data.map(m=>({
      id:m.id,text:m.content,isBot:m.sender==="bot"
    })));
  };


  // SEND MESSAGE (Markdown only)
  const sendMessage = async(text)=>{
    if(!text.trim()) return;
    let sid=sessionId;
    if(!sid) sid=await createSession();

    setMessages(p=>[...p,{id:Date.now(),text,isBot:false}]);
    setInput(""); setLoading(true);

    try{
      const token=localStorage.getItem("accessToken");
      const r=await fetch("http://localhost:5000/api/chat/message",{
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body:JSON.stringify({ session_id:sid,message:text,userId:USER_ID })
      });

      const d=await r.json();
      setMessages(p=>[...p,{id:Date.now(),text:d.reply,isBot:true}]);
    }
    catch{
      setMessages(p=>[...p,{id:Date.now(),text:"⚠ Error server",isBot:true}]);
    }

    setLoading(false);
  };


  // UI =======================================================================================
  const SUGGEST = [
    "Apa itu Predictive Maintenance?",
    "Sensor apa yang umum digunakan?",
    "Predictive vs Preventive Maintenance?",
    "Tanda mesin mulai rusak?",
    "Contoh penerapan PdM industri?"
  ];

  const showWelcome = !sessionId && messages.length===0;


  return(
  <div className="w-full h-[100vh] flex bg-[#f5f6fa]">

    <ChatSidebar username={USER_NAME} onSelectChat={loadMessages}/>

    <div className="flex-1 flex flex-col bg-white">

      {showWelcome && (
        <div className="flex flex-col justify-center items-center h-full gap-6">
          <h1 className="text-4xl font-bold">Hai, {USER_NAME} 👋</h1>
          <p className="text-gray-600 text-lg">Bertanya apa hari ini?</p>

          <div className="grid grid-cols-2 gap-4 w-[60%]">
            {SUGGEST.map(q=>(
              <button key={q} onClick={()=>sendMessage(q)}
                className="p-3 rounded-xl border hover:bg-gray-100">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {sessionId && (
        <div className="flex-1 overflow-y-auto px-[15%] py-10 space-y-6">
          
          {messages.map(m=>(
            <div key={m.id} className={`flex ${m.isBot?"justify-start":"justify-end"}`}>
              <div className={`
                p-4 rounded-2xl shadow max-w-[75%] prose leading-relaxed
                ${m.isBot?"bg-gray-100 text-gray-900":"bg-indigo-600 text-white"}
              `}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && <TypingDots/>}
          <div ref={bottomRef}/>
        </div>
      )}

      <form onSubmit={e=>{e.preventDefault();sendMessage(input);}}
        className="p-5 border-t flex gap-3">

        <input
          value={input} onChange={e=>setInput(e.target.value)}
          placeholder="Ketik pesan…"
          className="flex-1 p-3 border rounded-full bg-gray-50 px-6"
        />
        <button className="p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
          <Send size={20}/>
        </button>
      </form>

    </div>
  </div>
  );
}
