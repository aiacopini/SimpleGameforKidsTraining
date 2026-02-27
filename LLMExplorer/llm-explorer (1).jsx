import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════

const PALETTE = [
  "#22d3ee","#f43f5e","#eab308","#a855f7","#22c55e",
  "#f97316","#c084fc","#06b6d4","#ef4444","#84cc16",
  "#f59e0b","#6366f1","#ec4899","#2dd4bf","#fb923c"
];
const STAGE_ICONS = ["01","02","03","04","05","06","07"];
const FLAGS = { en:"🇬🇧", it:"🇮🇹", fr:"🇫🇷", es:"🇪🇸" };

// ═══════════════════════════════════════════════
// i18n (serious tone, accurate for 14-16)
// ═══════════════════════════════════════════════

const i18n = {
  en: {
    title:"LLM Explorer",
    subtitle:"An interactive walkthrough of Large Language Model inference",
    inputLabel:"Enter a prompt to trace through the model:",
    inputPlaceholder:"e.g. What is the tallest mountain on Earth?",
    explore:"Run Inference",
    next:"Next Stage",
    back:"Previous",
    restart:"New Input",
    compare:"Compare",
    compareLabel:"Second prompt:",
    comparePlaceholder:"Enter a second prompt to compare side-by-side...",
    quiz:"Knowledge Check",
    checkAnswer:"Submit",
    correct:"Correct.",
    wrong:"Incorrect — review the explanation above.",
    loading:"Running inference pipeline...",
    tryExample:"Example prompts:",
    sound:"Audio",
    yourPrompt:"Your prompt",
    inputA:"Prompt A", inputB:"Prompt B",
    funFact:"Technical Note",
    hoverHint:"Hover over elements to inspect",
    clickHint:"Click elements for details",
    stageNames:["Tokenization","Embedding","Self-Attention","Feed-Forward Layers","Output Distribution","Tool Use / Agents","Token Generation"],
    stageSubtitles:["Subword segmentation","Vector representation","Contextual weighting","Non-linear transformation","Probability distribution over vocabulary","External function calling","Autoregressive decoding"],
    stageExplanations:[
      "The model cannot process raw text. A **tokenizer** (typically Byte-Pair Encoding) splits your input into subword units. Common words remain whole; rare or long words are decomposed into smaller pieces. Each token maps to an integer ID from a fixed vocabulary (e.g., ~100K tokens for GPT-4). This is a deterministic, pre-processing step — no neural network is involved yet.",
      "Each token ID is mapped to a dense vector (typically 1536–12288 dimensions) via a learned **embedding matrix**. Positional encodings are added so the model knows token order. In this high-dimensional space, semantically similar words cluster together: the vectors for \"king\" and \"queen\" are closer than \"king\" and \"bicycle\". These vectors are the actual input to the Transformer layers.",
      "**Self-attention** is the core mechanism of Transformers. For each token, the model computes Query, Key, and Value vectors. The attention score between two tokens is the dot product of Q and K, normalized by √d. High scores mean \"this token is relevant to me.\" The output is a weighted sum of Value vectors. Multi-head attention runs this in parallel across 32–128 heads, each learning different relationship types (syntax, semantics, coreference, etc.).",
      "After attention, each token's representation passes through a **feed-forward network** (FFN) — typically two linear layers with a non-linearity (GeLU/SiLU). This is where factual knowledge is primarily stored. Modern LLMs stack 32–120+ of these Attention+FFN blocks (\"layers\"). Each layer refines the representation. Layer normalization and residual connections prevent gradient issues during training.",
      "The final hidden state is projected through the **unembedding matrix** (vocabulary size × hidden dim) to produce logits for every token in the vocabulary. A softmax converts these to probabilities. The model then samples from this distribution (with temperature, top-k, or top-p to control randomness). A temperature of 0 always picks the highest-probability token (greedy decoding).",
      "Modern LLMs can invoke **external tools** via function calling. The model outputs a structured JSON request (tool name + arguments) instead of natural text. An orchestrator executes the call (web search, calculator, API, database) and feeds the result back into the model's context. This is how **AI agents** work — they chain multiple tool calls with reasoning steps (ReAct pattern).",
      "Response generation is **autoregressive**: the model produces one token at a time, appending each to the context before predicting the next. This means generating N tokens requires N forward passes. KV-caching optimizes this by storing intermediate attention computations. The process continues until an end-of-sequence token is generated or a length limit is reached."
    ]
  },
  it: {
    title:"LLM Explorer",
    subtitle:"Percorso interattivo attraverso l'inferenza di un Large Language Model",
    inputLabel:"Inserisci un prompt da tracciare nel modello:",
    inputPlaceholder:"es. Qual è la montagna più alta della Terra?",
    explore:"Avvia Inferenza",
    next:"Fase Successiva",
    back:"Precedente",
    restart:"Nuovo Input",
    compare:"Confronta",
    compareLabel:"Secondo prompt:",
    comparePlaceholder:"Inserisci un secondo prompt per confronto...",
    quiz:"Verifica",
    checkAnswer:"Invia",
    correct:"Corretto.",
    wrong:"Errato — rileggi la spiegazione sopra.",
    loading:"Pipeline di inferenza in esecuzione...",
    tryExample:"Prompt di esempio:",
    sound:"Audio",
    yourPrompt:"Il tuo prompt",
    inputA:"Prompt A", inputB:"Prompt B",
    funFact:"Nota Tecnica",
    hoverHint:"Passa il mouse sugli elementi per ispezionarli",
    clickHint:"Clicca gli elementi per i dettagli",
    stageNames:["Tokenizzazione","Embedding","Self-Attention","Strati Feed-Forward","Distribuzione Output","Tool Use / Agenti","Generazione Token"],
    stageSubtitles:["Segmentazione in subword","Rappresentazione vettoriale","Pesatura contestuale","Trasformazione non-lineare","Distribuzione di probabilità sul vocabolario","Chiamate a funzioni esterne","Decodifica autoregressiva"],
    stageExplanations:[
      "Il modello non può elaborare testo grezzo. Un **tokenizer** (tipicamente Byte-Pair Encoding) divide l'input in unità subword. Le parole comuni restano intere; quelle rare o lunghe vengono scomposte in pezzi più piccoli. Ogni token corrisponde a un ID intero da un vocabolario fisso (~100K token per GPT-4). Questo è un passo deterministico di pre-processing — nessuna rete neurale è coinvolta.",
      "Ogni ID token viene mappato a un vettore denso (tipicamente 1536–12288 dimensioni) tramite una **matrice di embedding** appresa. Si aggiungono codifiche posizionali per preservare l'ordine. In questo spazio ad alta dimensionalità, parole semanticamente simili si raggruppano: i vettori di \"re\" e \"regina\" sono più vicini di \"re\" e \"bicicletta\". Questi vettori sono l'input effettivo ai layer Transformer.",
      "La **self-attention** è il meccanismo fondamentale dei Transformer. Per ogni token, il modello calcola vettori Query, Key e Value. Il punteggio di attenzione tra due token è il prodotto scalare di Q e K, normalizzato per √d. Punteggi alti significano \"questo token è rilevante per me\". L'output è una somma pesata dei vettori Value. La multi-head attention esegue questo in parallelo su 32–128 head, ognuna che apprende diversi tipi di relazione (sintassi, semantica, coreferenza, ecc.).",
      "Dopo l'attenzione, la rappresentazione di ogni token passa attraverso una **rete feed-forward** (FFN) — tipicamente due strati lineari con non-linearità (GeLU/SiLU). Qui è dove la conoscenza fattuale è principalmente memorizzata. Gli LLM moderni impilano 32–120+ di questi blocchi Attention+FFN (\"layer\"). Ogni layer raffina la rappresentazione. Layer normalization e connessioni residue prevengono problemi di gradiente.",
      "Lo stato nascosto finale viene proiettato attraverso la **matrice di unembedding** (dimensione vocabolario × dimensione nascosta) per produrre logit per ogni token nel vocabolario. Una softmax converte questi in probabilità. Il modello poi campiona da questa distribuzione (con temperature, top-k o top-p per controllare la casualità). Temperature 0 sceglie sempre il token a probabilità massima (decodifica greedy).",
      "Gli LLM moderni possono invocare **strumenti esterni** tramite function calling. Il modello produce una richiesta JSON strutturata (nome tool + argomenti) invece di testo naturale. Un orchestratore esegue la chiamata (ricerca web, calcolatore, API, database) e restituisce il risultato nel contesto del modello. Così funzionano gli **agenti IA** — concatenano più chiamate a strumenti con passaggi di ragionamento (pattern ReAct).",
      "La generazione della risposta è **autoregressiva**: il modello produce un token alla volta, aggiungendo ciascuno al contesto prima di predire il successivo. Generare N token richiede N passate forward. Il KV-caching ottimizza memorizzando i calcoli intermedi di attenzione. Il processo continua fino a un token di fine-sequenza o un limite di lunghezza."
    ]
  },
  fr: {
    title:"LLM Explorer",
    subtitle:"Parcours interactif à travers l'inférence d'un Large Language Model",
    inputLabel:"Entrez un prompt à tracer dans le modèle :",
    inputPlaceholder:"ex. Quelle est la plus haute montagne sur Terre ?",
    explore:"Lancer l'Inférence",
    next:"Étape Suivante",
    back:"Précédent",
    restart:"Nouvel Input",
    compare:"Comparer",
    compareLabel:"Deuxième prompt :",
    comparePlaceholder:"Entrez un second prompt pour comparer...",
    quiz:"Vérification",
    checkAnswer:"Soumettre",
    correct:"Correct.",
    wrong:"Incorrect — relisez l'explication ci-dessus.",
    loading:"Pipeline d'inférence en cours...",
    tryExample:"Exemples de prompts :",
    sound:"Son",
    yourPrompt:"Votre prompt",
    inputA:"Prompt A", inputB:"Prompt B",
    funFact:"Note Technique",
    hoverHint:"Survolez les éléments pour les inspecter",
    clickHint:"Cliquez sur les éléments pour plus de détails",
    stageNames:["Tokenisation","Embedding","Self-Attention","Couches Feed-Forward","Distribution de Sortie","Tool Use / Agents","Génération de Tokens"],
    stageSubtitles:["Segmentation en sous-mots","Représentation vectorielle","Pondération contextuelle","Transformation non-linéaire","Distribution de probabilité sur le vocabulaire","Appels de fonctions externes","Décodage autorégressif"],
    stageExplanations:[
      "Le modèle ne peut pas traiter du texte brut. Un **tokenizer** (typiquement Byte-Pair Encoding) découpe votre entrée en unités sous-mot. Les mots courants restent entiers ; les mots rares ou longs sont décomposés. Chaque token correspond à un ID entier d'un vocabulaire fixe (~100K pour GPT-4). C'est une étape déterministe de pré-traitement — aucun réseau de neurones n'est impliqué.",
      "Chaque ID de token est projeté vers un vecteur dense (1536–12288 dimensions) via une **matrice d'embedding** apprise. Des encodages positionnels sont ajoutés pour l'ordre. Dans cet espace, les mots sémantiquement proches se regroupent : \"roi\" et \"reine\" sont voisins, \"roi\" et \"vélo\" sont éloignés. Ces vecteurs sont l'entrée réelle des couches Transformer.",
      "La **self-attention** est le mécanisme central des Transformers. Pour chaque token, le modèle calcule des vecteurs Query, Key et Value. Le score d'attention est le produit scalaire Q·K, normalisé par √d. Un score élevé signifie « ce token est pertinent pour moi ». La sortie est une somme pondérée des vecteurs Value. La multi-head attention exécute ceci en parallèle sur 32–128 têtes, chacune apprenant différents types de relations.",
      "Après l'attention, chaque représentation passe par un **réseau feed-forward** (FFN) — deux couches linéaires avec non-linéarité (GeLU/SiLU). C'est là que la connaissance factuelle est principalement stockée. Les LLM modernes empilent 32–120+ blocs Attention+FFN. Chaque couche raffine la représentation. La normalisation de couche et les connexions résiduelles préviennent les problèmes de gradient.",
      "L'état caché final est projeté via la **matrice de dé-embedding** pour produire des logits pour chaque token du vocabulaire. Un softmax convertit en probabilités. Le modèle échantillonne de cette distribution (avec température, top-k ou top-p). Une température de 0 choisit toujours le token le plus probable (décodage glouton).",
      "Les LLM modernes peuvent invoquer des **outils externes** via function calling. Le modèle produit une requête JSON structurée au lieu de texte. Un orchestrateur exécute l'appel (recherche web, calculateur, API) et renvoie le résultat dans le contexte. C'est ainsi que fonctionnent les **agents IA** — ils enchaînent appels d'outils et étapes de raisonnement (pattern ReAct).",
      "La génération est **autorégressive** : un token à la fois, ajouté au contexte avant de prédire le suivant. N tokens = N passes forward. Le KV-caching optimise en stockant les calculs intermédiaires. Le processus continue jusqu'à un token de fin ou une limite de longueur."
    ]
  },
  es: {
    title:"LLM Explorer",
    subtitle:"Recorrido interactivo por la inferencia de un Large Language Model",
    inputLabel:"Ingresa un prompt para trazar en el modelo:",
    inputPlaceholder:"ej. ¿Cuál es la montaña más alta de la Tierra?",
    explore:"Ejecutar Inferencia",
    next:"Siguiente Fase",
    back:"Anterior",
    restart:"Nuevo Input",
    compare:"Comparar",
    compareLabel:"Segundo prompt:",
    comparePlaceholder:"Ingresa un segundo prompt para comparar...",
    quiz:"Verificación",
    checkAnswer:"Enviar",
    correct:"Correcto.",
    wrong:"Incorrecto — revisa la explicación anterior.",
    loading:"Pipeline de inferencia en ejecución...",
    tryExample:"Prompts de ejemplo:",
    sound:"Sonido",
    yourPrompt:"Tu prompt",
    inputA:"Prompt A", inputB:"Prompt B",
    funFact:"Nota Técnica",
    hoverHint:"Pasa el mouse sobre los elementos para inspeccionarlos",
    clickHint:"Haz clic en los elementos para más detalles",
    stageNames:["Tokenización","Embedding","Self-Attention","Capas Feed-Forward","Distribución de Salida","Tool Use / Agentes","Generación de Tokens"],
    stageSubtitles:["Segmentación en subpalabras","Representación vectorial","Ponderación contextual","Transformación no-lineal","Distribución de probabilidad sobre vocabulario","Llamadas a funciones externas","Decodificación autorregresiva"],
    stageExplanations:[
      "El modelo no puede procesar texto crudo. Un **tokenizer** (típicamente Byte-Pair Encoding) divide tu input en unidades subpalabra. Palabras comunes permanecen enteras; las raras se descomponen. Cada token corresponde a un ID entero de un vocabulario fijo (~100K para GPT-4). Este es un paso determinístico de pre-procesamiento — ninguna red neuronal está involucrada.",
      "Cada ID de token se proyecta a un vector denso (1536–12288 dimensiones) mediante una **matriz de embedding** aprendida. Se agregan codificaciones posicionales para el orden. En este espacio, palabras semánticamente similares se agrupan: \"rey\" y \"reina\" están cerca, \"rey\" y \"bicicleta\" están lejos. Estos vectores son la entrada real a las capas Transformer.",
      "La **self-attention** es el mecanismo central de los Transformers. Para cada token, el modelo calcula vectores Query, Key y Value. El puntaje de atención es el producto punto Q·K, normalizado por √d. Puntajes altos significan \"este token es relevante para mí\". La salida es una suma ponderada de vectores Value. Multi-head attention ejecuta esto en paralelo en 32–128 cabezas, cada una aprendiendo diferentes tipos de relación.",
      "Después de la atención, cada representación pasa por una **red feed-forward** (FFN) — dos capas lineales con no-linealidad (GeLU/SiLU). Aquí se almacena principalmente el conocimiento factual. Los LLM modernos apilan 32–120+ bloques Attention+FFN. Cada capa refina la representación. Layer normalization y conexiones residuales previenen problemas de gradiente.",
      "El estado oculto final se proyecta mediante la **matriz de des-embedding** para producir logits para cada token del vocabulario. Un softmax convierte a probabilidades. El modelo muestrea de esta distribución (con temperatura, top-k o top-p). Temperatura 0 siempre elige el token más probable (decodificación greedy).",
      "Los LLM modernos pueden invocar **herramientas externas** mediante function calling. El modelo produce una solicitud JSON estructurada en lugar de texto. Un orquestador ejecuta la llamada (búsqueda web, calculadora, API) y devuelve el resultado al contexto. Así funcionan los **agentes IA** — encadenan llamadas a herramientas con pasos de razonamiento (patrón ReAct).",
      "La generación es **autorregresiva**: un token a la vez, añadido al contexto antes de predecir el siguiente. N tokens = N pasadas forward. El KV-caching optimiza almacenando cálculos intermedios. El proceso continúa hasta un token de fin de secuencia o un límite de longitud."
    ]
  }
};

const examplePrompts = {
  en:["What is the tallest mountain?","Explain quantum entanglement","Calculate 127 × 34","Who painted the Mona Lisa?"],
  it:["Qual è la montagna più alta?","Spiega l'entanglement quantistico","Calcola 127 × 34","Chi ha dipinto la Gioconda?"],
  fr:["Quelle est la plus haute montagne ?","Explique l'intrication quantique","Calcule 127 × 34","Qui a peint la Joconde ?"],
  es:["¿Cuál es la montaña más alta?","Explica el entrelazamiento cuántico","Calcula 127 × 34","¿Quién pintó la Mona Lisa?"]
};

// ═══════════════════════════════════════════════
// SOUND
// ═══════════════════════════════════════════════
let _ac=null;
const ac=()=>{if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();if(_ac.state==='suspended')_ac.resume();return _ac;};
const snd=(type,on)=>{if(!on)return;try{const c=ac(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);const t=c.currentTime;
  if(type==='step'){o.type='sine';o.frequency.setValueAtTime(440,t);o.frequency.exponentialRampToValueAtTime(880,t+0.08);g.gain.setValueAtTime(0.08,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.15);o.start(t);o.stop(t+0.15);}
  else if(type==='start'){o.type='sine';o.frequency.setValueAtTime(330,t);o.frequency.exponentialRampToValueAtTime(660,t+0.2);g.gain.setValueAtTime(0.06,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.3);o.start(t);o.stop(t+0.3);}
  else if(type==='ok'){o.type='sine';o.frequency.setValueAtTime(523,t);o.frequency.setValueAtTime(659,t+0.08);o.frequency.setValueAtTime(784,t+0.16);g.gain.setValueAtTime(0.1,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.3);o.start(t);o.stop(t+0.3);}
  else if(type==='no'){o.type='triangle';o.frequency.setValueAtTime(280,t);o.frequency.exponentialRampToValueAtTime(140,t+0.15);g.gain.setValueAtTime(0.06,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.2);o.start(t);o.stop(t+0.2);}
  else{o.type='sine';o.frequency.value=600;g.gain.setValueAtTime(0.05,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.06);o.start(t);o.stop(t+0.06);}
}catch(e){}};

// ═══════════════════════════════════════════════
// TOKENIZER
// ═══════════════════════════════════════════════
const tokenize=(text)=>{
  if(!text)return[];
  const parts=[];
  text.split(/(\s+)/).forEach(w=>{
    if(/^\s+$/.test(w))return;
    if(w.length<=4){parts.push({text:w,type:'word'});}
    else if(w.length<=7){parts.push({text:w.slice(0,4),type:'sub'});parts.push({text:w.slice(4),type:'sub'});}
    else{parts.push({text:w.slice(0,4),type:'sub'});parts.push({text:w.slice(4,-3),type:'sub'});parts.push({text:w.slice(-3),type:'sub'});}
  });
  return parts.map((p,i)=>({...p,id:i,color:PALETTE[i%PALETTE.length],tokenId:1000+Math.floor(Math.random()*50000)}));
};

// ═══════════════════════════════════════════════
// RICH TEXT (bold markdown)
// ═══════════════════════════════════════════════
const RT=({text})=>{
  if(!text)return null;
  const p=text.split(/(\*\*[^*]+\*\*)/g);
  return <>{p.map((s,i)=>s.startsWith('**')&&s.endsWith('**')?<span key={i} style={{color:'#a5b4fc',fontWeight:700}}>{s.slice(2,-2)}</span>:<span key={i}>{s}</span>)}</>;
};

// ═══════════════════════════════════════════════
// TOOLTIP
// ═══════════════════════════════════════════════
const InfoTooltip = ({ text, x, y, visible }) => {
  if (!visible || !text) return null;
  return <div style={{
    position:'absolute', left:x, top:y-40, transform:'translateX(-50%)',
    background:'#1e1b4b', border:'1px solid #4338ca', borderRadius:8,
    padding:'6px 12px', fontSize:12, color:'#e0e7ff', pointerEvents:'none',
    zIndex:100, whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(0,0,0,0.5)'
  }}>{text}</div>;
};

// ═══════════════════════════════════════════════
// VIZ 1: TOKENIZATION (interactive hover)
// ═══════════════════════════════════════════════
const TokenViz=({tokens,animate})=>{
  const [shown,setShown]=useState(0);
  const [hover,setHover]=useState(-1);
  useEffect(()=>{if(!animate)return;setShown(0);
    const iv=setInterval(()=>setShown(p=>{if(p>=tokens.length){clearInterval(iv);return p;}return p+1;}),100);
    return()=>clearInterval(iv);
  },[animate,tokens.length]);
  return <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',padding:16,minHeight:100}}>
    {tokens.slice(0,animate?shown:tokens.length).map((t,i)=>(
      <div key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(-1)}
        style={{
          background:hover===i?t.color+'33':t.color+'15',
          border:`1.5px solid ${hover===i?t.color:t.color+'66'}`,
          borderRadius:8, padding:'8px 14px', cursor:'default',
          display:'flex',flexDirection:'column',alignItems:'center',gap:3,
          animation:animate?'tokenSlide 0.25s ease-out':'none',
          transform:hover===i?'translateY(-4px) scale(1.05)':'none',
          transition:'transform 0.15s, background 0.15s, border-color 0.15s',
          boxShadow:hover===i?`0 8px 25px ${t.color}33`:'none'
        }}>
        <span style={{color:'#e2e8f0',fontFamily:'var(--mono)',fontSize:15,fontWeight:600}}>{t.text}</span>
        <span style={{color:t.color,fontFamily:'var(--mono)',fontSize:10,opacity:hover===i?1:0.5,transition:'opacity 0.15s'}}>
          ID: {t.tokenId} {hover===i?`• pos: ${i}`:''}</span>
        {hover===i && <span style={{color:'#94a3b8',fontFamily:'var(--mono)',fontSize:9}}>{t.type==='sub'?'subword':'full word'}</span>}
      </div>
    ))}
  </div>;
};

// ═══════════════════════════════════════════════
// VIZ 2: EMBEDDING (interactive: hover shows vector, click selects for distance)
// ═══════════════════════════════════════════════
const EmbeddingViz=({tokens,animate})=>{
  const [progress,setProgress]=useState(0);
  const [hover,setHover]=useState(-1);
  const [selected,setSelected]=useState(-1);
  const svgRef=useRef(null);

  useEffect(()=>{if(!animate){setProgress(1);return;}setProgress(0);
    const s=Date.now();const a=()=>{const p=Math.min(1,(Date.now()-s)/1800);setProgress(p);if(p<1)requestAnimationFrame(a);};requestAnimationFrame(a);
  },[animate]);

  const positions=useMemo(()=>tokens.map((t,i)=>{
    let h=0;for(let c of t.text)h=((h<<5)-h+c.charCodeAt(0))|0;
    const angle=(i/tokens.length)*Math.PI*2+(h%100)/120;
    const radius=80+(h%55);
    const vec=[(h%99)/10-5,((h>>4)%99)/10-5,((h>>8)%99)/10-5];
    return{x:220+radius*Math.cos(angle),y:195+radius*Math.sin(angle)*0.8,vec};
  }),[tokens]);

  const dist=(a,b)=>{if(a<0||b<0)return null;const pa=positions[a],pb=positions[b];return Math.sqrt((pa.x-pb.x)**2+(pa.y-pb.y)**2).toFixed(1);};

  return <div style={{position:'relative'}}>
    <svg ref={svgRef} viewBox="0 0 440 400" style={{width:'100%',maxWidth:600,height:'auto',margin:'0 auto',display:'block',cursor:'crosshair'}}>
      <defs>
        <radialGradient id="eg"><stop offset="0%" stopColor="#4338ca" stopOpacity="0.12"/><stop offset="100%" stopColor="transparent"/></radialGradient>
        <filter id="gl"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="220" cy="195" r="155" fill="url(#eg)"/>
      {/* Grid */}
      {[80,140,200,260,320,380].map(v=><g key={v} opacity="0.08">
        <line x1={v} y1="20" x2={v} y2="380" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,5"/>
        <line x1="30" y1={v-20} x2="410" y2={v-20} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,5"/>
      </g>)}
      {/* Distance line */}
      {selected>=0 && hover>=0 && hover!==selected && (()=>{
        const p1=positions[selected],p2=positions[hover];
        return <g>
          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" opacity="0.7"/>
          <text x={(p1.x+p2.x)/2} y={(p1.y+p2.y)/2-8} textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="var(--mono)">d={dist(selected,hover)}</text>
        </g>;
      })()}
      {/* Tokens */}
      {tokens.map((t,i)=>{
        const pos=positions[i];
        const p=Math.min(1,progress*(tokens.length+2)-i);
        if(p<=0)return null;
        const isHov=hover===i;
        const isSel=selected===i;
        return <g key={i} style={{opacity:Math.max(0,p),cursor:'pointer'}}
          onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(-1)}
          onClick={()=>setSelected(selected===i?-1:i)}>
          <circle cx={pos.x} cy={pos.y} r={isHov?18:isSel?16:12} fill={t.color} opacity={isHov?0.15:0.06} style={{transition:'r 0.15s'}}/>
          <circle cx={pos.x} cy={pos.y} r={isHov?8:6} fill={t.color} opacity={0.85} filter="url(#gl)"
            stroke={isSel?'#f59e0b':'none'} strokeWidth={isSel?2:0}/>
          <circle cx={pos.x} cy={pos.y} r={2.5} fill="#fff" opacity={0.5}/>
          <text x={pos.x} y={pos.y-12} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="600" fontFamily="var(--sans)">{t.text}</text>
          {(isHov||isSel)&&<>
            <rect x={pos.x-32} y={pos.y+10} width="64" height="15" rx="3" fill="#0f172a" opacity="0.9"/>
            <text x={pos.x} y={pos.y+21} textAnchor="middle" fill={t.color} fontSize="8" fontFamily="var(--mono)">
              [{pos.vec.map(v=>v.toFixed(1)).join(', ')}]
            </text>
          </>}
        </g>;
      })}
      <text x="220" y="393" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="var(--mono)">
        2D projection of ~1536-dimensional space{selected>=0?' • click another token to measure distance':''}
      </text>
    </svg>
  </div>;
};

// ═══════════════════════════════════════════════
// VIZ 3: ATTENTION (interactive: hover token highlights its attention, click to pin)
// ═══════════════════════════════════════════════
const AttentionViz=({tokens,animate})=>{
  const [progress,setProgress]=useState(0);
  const [focus,setFocus]=useState(-1);
  const [pinned,setPinned]=useState(-1);

  const weights=useMemo(()=>tokens.map((_,i)=>tokens.map((_,j)=>{
    if(i===j)return 0.85;
    const d=Math.abs(i-j);return Math.max(0.02,0.65-d*0.1+Math.random()*0.2);
  })),[tokens.length]);

  useEffect(()=>{if(!animate){setProgress(1);return;}setProgress(0);
    const s=Date.now();const a=()=>{const p=Math.min(1,(Date.now()-s)/2200);setProgress(p);if(p<1)requestAnimationFrame(a);};requestAnimationFrame(a);
  },[animate]);

  const active=pinned>=0?pinned:focus;
  const spacing=Math.min(72,520/(tokens.length+1));
  const startX=(600-(tokens.length-1)*spacing)/2;

  return <div style={{position:'relative',overflowX:'auto'}}>
    <svg viewBox="0 0 600 340" style={{width:'100%',maxWidth:680,height:'auto',margin:'0 auto',display:'block'}}>
      <defs>
        <filter id="ag"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="hot" x1="0" x2="1"><stop offset="0%" stopColor="#f43f5e"/><stop offset="100%" stopColor="#eab308"/></linearGradient>
        <linearGradient id="cold" x1="0" x2="1"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#6366f1"/></linearGradient>
      </defs>
      {/* Arcs */}
      {progress>0.1 && tokens.map((_,i)=>tokens.map((_,j)=>{
        if(i>=j)return null;
        const w=weights[i][j];
        const lp=Math.max(0,(progress-0.1)/0.9);
        const x1=startX+i*spacing,x2=startX+j*spacing;
        const mid=(x1+x2)/2;
        const arcH=25+Math.abs(j-i)*20;
        const path=`M ${x1} 55 Q ${mid} ${55+arcH} ${x2} 55`;
        const isActive=active>=0&&(i===active||j===active);
        const dimmed=active>=0&&!isActive;
        return <path key={`${i}-${j}`} d={path} fill="none"
          stroke={w>0.35?'url(#hot)':'url(#cold)'}
          strokeWidth={isActive?Math.max(1,w*5):Math.max(0.3,w*3)*lp}
          opacity={dimmed?0.08:w*0.75*lp}
          strokeLinecap="round" filter={isActive&&w>0.4?'url(#ag)':undefined}
          style={{transition:'opacity 0.2s, stroke-width 0.2s'}}/>;
      }))}
      {/* Nodes */}
      {tokens.map((t,i)=>{
        const x=startX+i*spacing;
        const isAct=active===i;
        return <g key={i} style={{cursor:'pointer'}}
          onMouseEnter={()=>{if(pinned<0)setFocus(i);}}
          onMouseLeave={()=>{if(pinned<0)setFocus(-1);}}
          onClick={()=>setPinned(pinned===i?-1:i)}>
          <circle cx={x} cy={55} r={isAct?14:10} fill={t.color} opacity={isAct?0.2:0.08} style={{transition:'all 0.15s'}}/>
          <circle cx={x} cy={55} r={isAct?8:6} fill={t.color} opacity={0.85} filter={isAct?'url(#ag)':undefined}
            stroke={pinned===i?'#f59e0b':'none'} strokeWidth={pinned===i?2:0}/>
          <text x={x} y={38} textAnchor="middle" fill={isAct?'#fff':'#cbd5e1'} fontSize="10" fontWeight={isAct?700:500} fontFamily="var(--sans)"
            style={{transition:'fill 0.15s'}}>{t.text}</text>
          {isAct&&<text x={x} y={78} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="var(--mono)">
            attn: [{weights[i].map(w=>w.toFixed(2)).join(', ')}]
          </text>}
        </g>;
      })}
      {/* Heatmap */}
      {progress>0.4&&(()=>{
        const sz=Math.min(24,220/tokens.length);
        const mx=(600-tokens.length*sz)/2;
        const my=130;
        const mp=Math.max(0,(progress-0.4)/0.6);
        return <g opacity={mp}>
          <text x="300" y={my-8} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="var(--mono)" fontWeight="600">Attention Weight Matrix</text>
          {tokens.map((_,i)=>tokens.map((_,j)=>{
            const w=weights[i][j];
            const isAct=active>=0&&(i===active||j===active);
            return <rect key={`m${i}-${j}`} x={mx+j*sz} y={my+i*sz} width={sz-1.5} height={sz-1.5} rx={3}
              fill={w>0.5?'#f43f5e':w>0.25?'#6366f1':'#22d3ee'}
              opacity={isAct?w:active>=0?w*0.2:w*0.75}
              onMouseEnter={()=>{if(pinned<0)setFocus(i);}}
              style={{cursor:'pointer',transition:'opacity 0.15s'}}/>;
          }))}
          {tokens.map((t,i)=><text key={`r${i}`} x={mx-4} y={my+i*sz+sz/2+3} textAnchor="end" fill={active===i?t.color:'#94a3b8'} fontSize={Math.min(9,sz*0.45)} fontFamily="var(--mono)" fontWeight={active===i?700:400}>{t.text}</text>)}
          {tokens.map((t,i)=><text key={`c${i}`} x={mx+i*sz+sz/2} y={my+tokens.length*sz+12} textAnchor="middle" fill={active===i?t.color:'#94a3b8'} fontSize={Math.min(9,sz*0.45)} fontFamily="var(--mono)" fontWeight={active===i?700:400}>{t.text}</text>)}
          <g transform={`translate(${mx},${my+tokens.length*sz+22})`}>
            <text x="0" y="0" fill="#64748b" fontSize="8" fontFamily="var(--mono)">0.0</text>
            <rect x="20" y="-6" width="80" height="6" rx="2" fill="url(#cold)" opacity="0.6"/>
            <rect x="100" y="-6" width="80" height="6" rx="2" fill="url(#hot)" opacity="0.6"/>
            <text x="185" y="0" fill="#64748b" fontSize="8" fontFamily="var(--mono)">1.0</text>
          </g>
        </g>;
      })()}
    </svg>
    {pinned>=0&&<div style={{textAlign:'center',color:'#64748b',fontSize:11,fontFamily:'var(--mono)',marginTop:4}}>
      Pinned: "{tokens[pinned]?.text}" — click again to unpin
    </div>}
  </div>;
};

// ═══════════════════════════════════════════════
// VIZ 4: NEURAL LAYERS (interactive: hover layer for details)
// ═══════════════════════════════════════════════
const NeuralViz=({tokens,animate})=>{
  const [activeL,setActiveL]=useState(-1);
  const [hoverL,setHoverL]=useState(-1);
  const layers=10;const npl=10;

  useEffect(()=>{if(!animate){setActiveL(layers);return;}setActiveL(-1);
    let i=0;const iv=setInterval(()=>{setActiveL(i);i++;if(i>layers)clearInterval(iv);},280);return()=>clearInterval(iv);
  },[animate]);

  const lTypes=['Emb','Attn','FFN','Attn','FFN','Attn','FFN','Attn','FFN','Out'];
  const lW=36;const gap=14;const totalW=layers*(lW+gap)+40;

  return <div style={{position:'relative',overflowX:'auto'}}>
    <svg viewBox={`0 0 ${totalW} 260`} style={{width:'100%',maxWidth:680,height:'auto',margin:'0 auto',display:'block'}}>
      <defs>
        <filter id="ng"><feGaussianBlur stdDeviation="1.5"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <marker id="na" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto"><polygon points="0 0,5 2,0 4" fill="#6366f1"/></marker>
      </defs>
      {/* Connections */}
      {Array.from({length:layers-1},(_,l)=>{
        const x1=25+l*(lW+gap)+lW,x2=25+(l+1)*(lW+gap);
        const vis=l<activeL;
        return Array.from({length:3},(_,c)=>{
          const y=60+c*65;
          return <line key={`c${l}-${c}`} x1={x1} y1={y} x2={x2} y2={60+((c+1)%3)*65}
            stroke={vis?'#6366f1':'#1e293b'} strokeWidth={vis?0.6:0.3} opacity={vis?0.35:0.1}
            style={{transition:'all 0.2s'}}/>;
        });
      })}
      {/* Layers */}
      {Array.from({length:layers},(_,l)=>{
        const x=25+l*(lW+gap);
        const on=l<=activeL; const cur=l===activeL; const hov=l===hoverL;
        const hue=220+l*12;
        return <g key={l} onMouseEnter={()=>setHoverL(l)} onMouseLeave={()=>setHoverL(-1)} style={{cursor:'default'}}>
          <rect x={x} y={18} width={lW} height={220} rx={8}
            fill={on?`hsla(${hue},50%,${cur?30:20}%,${hov?0.8:0.5})`:'#0f172a66'}
            stroke={hov?`hsl(${hue},60%,60%)`:on?`hsl(${hue},40%,40%)`:'#1e293b'}
            strokeWidth={hov||cur?1.5:0.5} style={{transition:'all 0.2s'}}/>
          {Array.from({length:npl},(_,n)=>{
            const ny=32+n*20;
            const nOn=on&&(cur||Math.random()>0.25);
            return <circle key={n} cx={x+lW/2} cy={ny}
              r={cur?3.5:hov?3:2.5} fill={nOn?`hsl(${hue+n*3},65%,60%)`:'#1e293b'}
              opacity={nOn?0.9:0.2}
              style={{transition:'all 0.2s',animation:cur?`pulse 0.5s ${n*0.04}s ease-in-out infinite`:'none'}}/>;
          })}
          <text x={x+lW/2} y={250} textAnchor="middle" fill={on?'#94a3b8':'#334155'} fontSize="7" fontFamily="var(--mono)"
            fontWeight={hov?700:400} style={{transition:'all 0.15s'}}>{lTypes[l]}</text>
          {/* Hover info */}
          {hov&&<g>
            <rect x={x-10} y={0} width={lW+20} height={16} rx={4} fill="#1e1b4b" stroke="#4338ca" strokeWidth="0.5"/>
            <text x={x+lW/2} y={11} textAnchor="middle" fill="#a5b4fc" fontSize="7" fontFamily="var(--mono)" fontWeight="600">
              Layer {l+1}: {lTypes[l]} • {lTypes[l]==='Attn'?'~32 heads':'~4096 units'}
            </text>
          </g>}
        </g>;
      })}
      {/* Data flow arrow */}
      {activeL>=0&&activeL<layers&&<circle r="3" fill="#eab308" opacity="0.8" filter="url(#ng)">
        <animateMotion dur="0.28s" repeatCount="1" path={`M ${25+activeL*(lW+gap)} 130 L ${25+activeL*(lW+gap)+lW} 130`}/>
      </circle>}
    </svg>
  </div>;
};

// ═══════════════════════════════════════════════
// VIZ 5: PREDICTION (interactive bar chart with hover)
// ═══════════════════════════════════════════════
const PredictionViz=({predictions,animate})=>{
  const [show,setShow]=useState(false);
  useEffect(()=>{if(!animate){setShow(true);return;}setShow(false);setTimeout(()=>setShow(true),200);},[animate]);
  if(!predictions||!predictions.length) return <div style={{textAlign:'center',color:'#64748b',padding:30}}>Generating predictions...</div>;
  return <div style={{width:'100%',maxWidth:520,margin:'0 auto',height:260}}>
    {show&&<ResponsiveContainer width="100%" height="100%">
      <BarChart data={predictions} layout="vertical" margin={{left:80,right:20,top:10,bottom:10}}>
        <XAxis type="number" domain={[0,'auto']} tick={{fill:'#94a3b8',fontSize:11}} tickFormatter={v=>`${(v*100).toFixed(0)}%`} stroke="#1e293b"/>
        <YAxis type="category" dataKey="word" tick={{fill:'#e2e8f0',fontSize:13,fontFamily:'var(--mono)'}} stroke="#1e293b"/>
        <Tooltip formatter={v=>[`${(v*100).toFixed(1)}%`,'Probability']}
          contentStyle={{background:'#1e1b4b',border:'1px solid #4338ca',borderRadius:8,color:'#e2e8f0',fontFamily:'var(--mono)',fontSize:12}}
          cursor={{fill:'#ffffff08'}}/>
        <Bar dataKey="prob" radius={[0,6,6,0]} animationDuration={1000}>
          {predictions.map((_,i)=><Cell key={i} fill={PALETTE[i]} fillOpacity={0.75}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>}
  </div>;
};

// ═══════════════════════════════════════════════
// VIZ 6: TOOL CALL (REAL API call with web_search)
// ═══════════════════════════════════════════════
const ToolCallViz=({userInput,lang,animate})=>{
  const [step,setStep]=useState(0);
  const [realResult,setRealResult]=useState(null);
  const [calling,setCalling]=useState(false);
  const calledRef=useRef(false);

  const langNames={en:'English',it:'Italiano',fr:'Français',es:'Español'};

  // Real API call
  const doToolCall=useCallback(async()=>{
    if(calledRef.current)return;
    calledRef.current=true;
    setCalling(true);
    try{
      const response=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1000,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:`Answer this question concisely in ${langNames[lang]} (2-3 sentences max): "${userInput}"`}]
        })
      });
      const data=await response.json();
      // Extract search queries, results and text
      const blocks=data.content||[];
      const searchBlocks=blocks.filter(b=>b.type==='web_search_tool_use'||b.type==='server_tool_use');
      const resultBlocks=blocks.filter(b=>b.type==='web_search_tool_result'||b.type==='server_tool_result');
      const textBlocks=blocks.filter(b=>b.type==='text');

      const searchQuery=searchBlocks.length>0?(searchBlocks[0].input?.query||searchBlocks[0].name||'web_search'):'web_search';
      const answer=textBlocks.map(b=>b.text).join(' ').trim()||'No text response received.';

      // Try to extract search result titles
      let sources=[];
      try{
        for(const rb of resultBlocks){
          const content = rb.content || [];
          for (const c of content) {
            if (c.type === 'web_search_tool_result' && c.search_results) {
              sources = c.search_results.slice(0,3).map(r=>({title:r.title,url:r.url}));
            }
          }
        }
      }catch(e){}

      setRealResult({searchQuery,answer,sources,raw:JSON.stringify(data.content?.map(b=>({type:b.type,name:b.name})),null,2)});
    }catch(err){
      console.error('Tool call error:',err);
      setRealResult({searchQuery:'web_search',answer:`Error: ${err.message}`,sources:[],raw:''});
    }
    setCalling(false);
  },[userInput,lang]);

  useEffect(()=>{
    if(!animate){setStep(4);doToolCall();return;}
    calledRef.current=false;
    setStep(0);setRealResult(null);
    let i=0;
    const iv=setInterval(()=>{
      i++;setStep(i);
      if(i===2)doToolCall(); // trigger real call at step 2
      if(i>=4)clearInterval(iv);
    },800);
    return()=>clearInterval(iv);
  },[animate]);

  const stages=['🔍 Analyze prompt','⚙️ Select tool','📡 Execute call','📥 Parse result','✅ Integrate'];

  return <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:16}}>
    {/* Flow */}
    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
      {stages.map((label,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{
            padding:'8px 14px',borderRadius:8,fontSize:12,fontWeight:600,fontFamily:'var(--mono)',
            background:i<=step?(i===step?'#312e81':'#1e1b4b'):'#0f172a',
            border:`1px solid ${i<=step?(i===step?'#6366f1':'#4338ca'):'#1e293b'}`,
            color:i<=step?'#e0e7ff':'#475569',transition:'all 0.3s',
            boxShadow:i===step?'0 0 12px #6366f133':'none'
          }}>{label}</div>
          {i<4&&<span style={{color:i<step?'#6366f1':'#1e293b',fontSize:14}}>→</span>}
        </div>
      ))}
    </div>

    {/* Live terminal */}
    <div style={{
      background:'#0c0a1d',border:'1px solid #1e293b',borderRadius:10,
      padding:16,fontFamily:'var(--mono)',fontSize:12,maxWidth:550,width:'100%',lineHeight:1.8
    }}>
      <div style={{display:'flex',gap:6,marginBottom:10}}>
        <div style={{width:10,height:10,borderRadius:'50%',background:'#ef4444'}}/>
        <div style={{width:10,height:10,borderRadius:'50%',background:'#eab308'}}/>
        <div style={{width:10,height:10,borderRadius:'50%',background:'#22c55e'}}/>
        <span style={{color:'#475569',marginLeft:8,fontSize:11}}>tool_executor.py</span>
      </div>

      {step>=0&&<div style={{color:'#94a3b8'}}>
        <span style={{color:'#a855f7'}}>agent</span>.<span style={{color:'#22d3ee'}}>analyze</span>(<span style={{color:'#eab308'}}>"{userInput}"</span>)
      </div>}
      {step>=1&&<div style={{color:'#94a3b8'}}>
        <span style={{color:'#6366f1'}}>→</span> tool_needed: <span style={{color:'#22c55e'}}>true</span>, name: <span style={{color:'#eab308'}}>"web_search"</span>
      </div>}
      {step>=2&&<>
        <div style={{color:'#22d3ee',marginTop:4}}>
          <span style={{color:'#a855f7'}}>api</span>.<span style={{color:'#22d3ee'}}>call</span>({'{'}
        </div>
        <div style={{paddingLeft:16,color:'#94a3b8'}}>
          model: <span style={{color:'#eab308'}}>"claude-sonnet-4"</span>,<br/>
          tools: [<span style={{color:'#eab308'}}>"web_search"</span>],<br/>
          query: <span style={{color:'#eab308'}}>"{realResult?.searchQuery||userInput}"</span>
        </div>
        <div style={{color:'#22d3ee'}}>{'}'})  {calling&&<span style={{color:'#f59e0b',animation:'pulse 1s infinite'}}>⏳ waiting...</span>}</div>
      </>}
      {step>=3&&realResult&&<>
        <div style={{color:'#22c55e',marginTop:8,borderTop:'1px solid #1e293b',paddingTop:8}}>
          ← <span style={{fontWeight:700}}>200 OK</span>
        </div>
        {realResult.sources.length>0&&<div style={{color:'#64748b',paddingLeft:16,marginTop:4}}>
          {realResult.sources.map((s,i)=><div key={i}>source[{i}]: <a href={s.url} target="_blank" rel="noopener" style={{color:'#6366f1',textDecoration:'none'}}>{s.title?.slice(0,60)}</a></div>)}
        </div>}
      </>}
      {step>=4&&realResult&&<div style={{color:'#e2e8f0',marginTop:8,padding:12,background:'#1e1b4b44',borderRadius:6,borderLeft:'2px solid #6366f1',lineHeight:1.6,fontFamily:'var(--sans)',fontSize:13}}>
        {realResult.answer}
      </div>}
    </div>

    <div style={{color:'#475569',fontSize:11,fontFamily:'var(--mono)',textAlign:'center'}}>
      This is a real API call to Claude Sonnet with web_search tool
    </div>
  </div>;
};

// ═══════════════════════════════════════════════
// VIZ 7: RESPONSE (uses real tool call result)
// ═══════════════════════════════════════════════
const ResponseViz=({response,animate})=>{
  const [shown,setShown]=useState('');
  useEffect(()=>{
    if(!response){setShown('');return;}
    if(!animate){setShown(response);return;}
    setShown('');let i=0;
    const iv=setInterval(()=>{i++;setShown(response.slice(0,i));if(i>=response.length)clearInterval(iv);},20);
    return()=>clearInterval(iv);
  },[animate,response]);

  if(!response)return <div style={{textAlign:'center',color:'#64748b',padding:30,fontFamily:'var(--mono)',fontSize:13}}>Waiting for tool call result...</div>;

  const tokensGenerated = response.split(/\s+/).length;

  return <div style={{maxWidth:550,margin:'0 auto'}}>
    <div style={{background:'#0c0a1d',border:'1px solid #1e293b',borderRadius:10,padding:20,minHeight:80}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
        <span style={{color:'#6366f1',fontFamily:'var(--mono)',fontSize:11}}>Generated Response</span>
        <span style={{color:'#475569',fontFamily:'var(--mono)',fontSize:10}}>~{tokensGenerated} tokens</span>
      </div>
      <div style={{color:'#e2e8f0',fontSize:15,lineHeight:1.8,fontFamily:'var(--sans)'}}>
        {shown}
        {shown.length<(response?.length||0)&&<span style={{display:'inline-block',width:2,height:16,background:'#6366f1',marginLeft:1,animation:'blink 0.7s step-end infinite',verticalAlign:'text-bottom'}}/>}
      </div>
    </div>
    <div style={{display:'flex',justifyContent:'center',gap:20,marginTop:12}}>
      {['KV-cache: active','Temperature: 0.7',`Tokens: ~${tokensGenerated}`].map((l,i)=>(
        <span key={i} style={{color:'#475569',fontSize:10,fontFamily:'var(--mono)',padding:'3px 8px',background:'#0f172a',borderRadius:4,border:'1px solid #1e293b'}}>{l}</span>
      ))}
    </div>
  </div>;
};

// ═══════════════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════════════
const Quiz=({quiz,lang,soundOn})=>{
  const [sel,setSel]=useState(null);
  const [done,setDone]=useState(false);
  const t=i18n[lang];
  if(!quiz)return null;
  const check=()=>{setDone(true);snd(sel===quiz.correctIndex?'ok':'no',soundOn);};
  return <div style={{background:'#1e1b4b33',border:'1px solid #4338ca33',borderRadius:12,padding:18,marginTop:16}}>
    <div style={{color:'#a5b4fc',fontWeight:700,fontSize:13,marginBottom:10,fontFamily:'var(--mono)'}}>{t.quiz}</div>
    <div style={{color:'#e2e8f0',fontSize:13,marginBottom:14,lineHeight:1.5}}>{quiz.question}</div>
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      {quiz.options.map((o,i)=>{
        const isC=done&&i===quiz.correctIndex;
        const isW=done&&i===sel&&i!==quiz.correctIndex;
        return <button key={i} onClick={()=>{if(!done){setSel(i);snd('click',soundOn);}}}
          style={{
            padding:'8px 14px',borderRadius:8,border:'none',cursor:done?'default':'pointer',
            background:isC?'#22c55e18':isW?'#ef444418':i===sel?'#6366f118':'#0f172a44',
            color:'#e2e8f0',fontSize:12,textAlign:'left',transition:'all 0.15s',fontFamily:'var(--sans)',
            outline:i===sel&&!done?'1.5px solid #6366f1':isC?'1.5px solid #22c55e':isW?'1.5px solid #ef4444':'1px solid #1e293b'
          }}><span style={{fontWeight:700,marginRight:8,color:PALETTE[i],fontFamily:'var(--mono)'}}>{String.fromCharCode(65+i)}</span>{o}</button>;
      })}
    </div>
    {sel!==null&&!done&&<button onClick={check} style={{
      marginTop:10,padding:'6px 20px',borderRadius:8,border:'none',
      background:'#4338ca',color:'#e0e7ff',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'var(--mono)'
    }}>{t.checkAnswer}</button>}
    {done&&<div style={{marginTop:10,padding:'6px 14px',borderRadius:8,fontSize:12,fontWeight:600,fontFamily:'var(--mono)',
      background:sel===quiz.correctIndex?'#22c55e15':'#ef444415',
      color:sel===quiz.correctIndex?'#22c55e':'#f59e0b'
    }}>{sel===quiz.correctIndex?t.correct:t.wrong}</div>}
  </div>;
};

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════
export default function LLMExplorer(){
  const [lang,setLang]=useState('en');
  const [inputText,setInputText]=useState('');
  const [compareText,setCompareText]=useState('');
  const [compareMode,setCompareMode]=useState(false);
  const [stage,setStage]=useState(-1);
  const [loading,setLoading]=useState(false);
  const [stageData,setStageData]=useState(null);
  const [compData,setCompData]=useState(null);
  const [tokens,setTokens]=useState([]);
  const [compTokens,setCompTokens]=useState([]);
  const [animKey,setAnimKey]=useState(0);
  const [soundOn,setSoundOn]=useState(true);
  const [toolResponse,setToolResponse]=useState(null);

  const t=i18n[lang];
  const langNames={en:'English',it:'Italiano',fr:'Français',es:'Español'};

  const callAgent=async(text,lc)=>{
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          messages:[{role:"user",content:`You are a technical AI educator. The student's prompt is: "${text}"

Return ONLY valid JSON (no markdown, no backticks). Respond in ${langNames[lc]}:

{
  "stages": [
    { "funFact": "technical fact about tokenization for this specific input", "quiz": { "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 } },
    { "funFact": "fact about embeddings", "quiz": { "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 } },
    { "funFact": "fact about attention for this input", "quiz": { "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 } },
    { "funFact": "fact about feed-forward layers", "quiz": { "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 } },
    { "funFact": "fact about probability distribution", "quiz": { "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 } },
    { "funFact": "fact about tool use and AI agents", "quiz": { "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 } },
    { "funFact": "fact about autoregressive generation", "quiz": { "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 } }
  ],
  "predictions": [{"word":"most_likely_next_word_for_this_input","prob":0.38},{"word":"second","prob":0.24},{"word":"third","prob":0.16},{"word":"fourth","prob":0.11},{"word":"fifth","prob":0.07}]
}`}]})});
      const d=await r.json();
      const raw=d.content.map(c=>c.text||'').join('');
      return JSON.parse(raw.replace(/```json|```/g,'').trim());
    }catch(e){console.error(e);return null;}
  };

  const handleExplore=async()=>{
    if(!inputText.trim())return;
    setLoading(true);snd('start',soundOn);
    setTokens(tokenize(inputText));setToolResponse(null);
    const proms=[callAgent(inputText,lang)];
    if(compareMode&&compareText.trim()){setCompTokens(tokenize(compareText));proms.push(callAgent(compareText,lang));}
    const res=await Promise.all(proms);
    setStageData(res[0]);if(res[1])setCompData(res[1]);
    setLoading(false);setStage(0);setAnimKey(k=>k+1);snd('step',soundOn);
  };

  const goNext=()=>{if(stage<6){setStage(s=>s+1);setAnimKey(k=>k+1);snd('step',soundOn);}};
  const goBack=()=>{if(stage>0){setStage(s=>s-1);setAnimKey(k=>k+1);snd('step',soundOn);}};
  const restart=()=>{setStage(-1);setStageData(null);setCompData(null);setToolResponse(null);setAnimKey(0);snd('click',soundOn);};

  const renderViz=(si,toks,data,key)=>{
    switch(si){
      case 0:return <TokenViz key={key} tokens={toks} animate={true}/>;
      case 1:return <EmbeddingViz key={key} tokens={toks} animate={true}/>;
      case 2:return <AttentionViz key={key} tokens={toks} animate={true}/>;
      case 3:return <NeuralViz key={key} tokens={toks} animate={true}/>;
      case 4:return <PredictionViz key={key} predictions={data?.predictions} animate={true}/>;
      case 5:return <ToolCallViz key={key} userInput={inputText} lang={lang} animate={true}/>;
      case 6:return <ResponseViz key={key} response={toolResponse} animate={true}/>;
      default:return null;
    }
  };

  // Capture tool response for stage 7
  // We'll use a ref-based approach: ToolCallViz stores result, ResponseViz reads it
  // Simpler: just make another real call for the response stage
  const [finalResponse,setFinalResponse]=useState(null);
  useEffect(()=>{
    if(stage===6&&!finalResponse){
      (async()=>{
        try{
          const r=await fetch("https://api.anthropic.com/v1/messages",{
            method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
              tools:[{type:"web_search_20250305",name:"web_search"}],
              messages:[{role:"user",content:`Answer concisely in ${langNames[lang]} (2-3 sentences): "${inputText}"`}]
            })});
          const d=await r.json();
          const txt=d.content?.filter(b=>b.type==='text').map(b=>b.text).join(' ').trim();
          setFinalResponse(txt||'No response generated.');
        }catch(e){setFinalResponse('Error generating response.');}
      })();
    }
  },[stage]);

  useEffect(()=>{if(stage===-1)setFinalResponse(null);},[stage]);

  const renderVizFinal=(si,toks,data,key)=>{
    if(si===6)return <ResponseViz key={key} response={finalResponse} animate={true}/>;
    if(si===5)return <ToolCallViz key={key} userInput={inputText} lang={lang} animate={true}/>;
    return renderViz(si,toks,data,key);
  };

  const curSD=stageData?.stages?.[stage];

  return <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
      :root{--sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'JetBrains Mono',monospace;}
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#060612;min-height:100vh;font-family:var(--sans);color:#e2e8f0;overflow-x:hidden}
      @keyframes tokenSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      .wrap{max-width:840px;margin:0 auto;padding:20px 16px}
      .card{background:#0f0f23;border:1px solid #1e293b;border-radius:12px;padding:20px}
      .btn{padding:12px 28px;border-radius:10px;border:none;font-family:var(--sans);font-weight:600;font-size:14px;cursor:pointer;transition:all .2s}
      .btn:hover{transform:translateY(-1px)}
      .btn-p{background:#4338ca;color:#e0e7ff;box-shadow:0 2px 15px #4338ca44}.btn-p:hover{background:#4f46e5;box-shadow:0 4px 20px #4338ca66}
      .btn-s{background:#1e1b4b;color:#a5b4fc;border:1px solid #312e81}.btn-s:hover{background:#312e81}
      .ex-btn{padding:6px 14px;border-radius:8px;border:1px solid #1e293b;background:#0f172a;color:#94a3b8;font-size:12px;cursor:pointer;transition:all .15s;font-family:var(--mono)}
      .ex-btn:hover{background:#1e1b4b;border-color:#4338ca;color:#e0e7ff}
      input[type="text"]{width:100%;padding:12px 16px;border-radius:10px;border:1px solid #1e293b;background:#0a0a1a;color:#e2e8f0;font-size:14px;font-family:var(--sans);outline:none;transition:border-color .2s}
      input[type="text"]:focus{border-color:#4338ca;box-shadow:0 0 12px #4338ca22}
      input::placeholder{color:#475569}
      .dot{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-family:var(--mono);transition:all .2s;border:1.5px solid transparent}
      .lang-btn{padding:4px 10px;border-radius:6px;border:1px solid transparent;background:transparent;font-size:20px;cursor:pointer;transition:all .15s;opacity:.4}
      .lang-btn:hover{opacity:.7}.lang-btn.on{opacity:1;border-color:#4338ca;background:#1e1b4b}
      .loader{width:36px;height:36px;border:3px solid #1e293b;border-top-color:#6366f1;border-radius:50%;animation:spin .7s linear infinite}
    `}</style>

    {/* Subtle grid background */}
    <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',
      backgroundImage:'radial-gradient(#1e293b 1px,transparent 1px)',backgroundSize:'40px 40px',opacity:0.3}}/>
    <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',
      background:'radial-gradient(ellipse at 30% 20%,#1e1b4b22 0%,transparent 50%)'}}/>

    <div className="wrap" style={{position:'relative',zIndex:1}}>
      {/* Header */}
      <div style={{textAlign:'center',paddingTop:28,paddingBottom:4}}>
        <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:14}}>
          {Object.entries(FLAGS).map(([c,f])=>(
            <button key={c} className={`lang-btn ${lang===c?'on':''}`} onClick={()=>{setLang(c);snd('click',soundOn)}}>{f}</button>
          ))}
          <button className="lang-btn" style={{fontSize:14,opacity:soundOn?0.8:0.3}} onClick={()=>setSoundOn(!soundOn)}>
            {soundOn?'🔊':'🔇'}
          </button>
        </div>
        <h1 style={{fontSize:36,fontWeight:700,letterSpacing:'-0.02em',color:'#e2e8f0'}}>{t.title}</h1>
        <p style={{color:'#64748b',fontSize:14,marginTop:6}}>{t.subtitle}</p>
      </div>

      {/* Input */}
      {stage===-1&&!loading&&<div style={{animation:'fadeIn 0.4s'}}>
        <div className="card" style={{marginTop:28}}>
          <label style={{display:'block',color:'#94a3b8',fontSize:13,marginBottom:8,fontFamily:'var(--mono)'}}>{t.inputLabel}</label>
          <input type="text" value={inputText} onChange={e=>setInputText(e.target.value)}
            placeholder={t.inputPlaceholder} onKeyDown={e=>e.key==='Enter'&&handleExplore()}/>
          <div style={{marginTop:14,display:'flex',alignItems:'center',gap:8}}>
            <button onClick={()=>setCompareMode(!compareMode)} style={{
              padding:'4px 12px',borderRadius:6,border:`1px solid ${compareMode?'#6366f1':'#1e293b'}`,
              background:compareMode?'#1e1b4b':'transparent',color:compareMode?'#a5b4fc':'#475569',
              fontSize:12,cursor:'pointer',fontFamily:'var(--mono)',fontWeight:600,transition:'all .15s'
            }}>⚡ {t.compare}</button>
          </div>
          {compareMode&&<div style={{marginTop:10,animation:'fadeIn 0.2s'}}>
            <input type="text" value={compareText} onChange={e=>setCompareText(e.target.value)} placeholder={t.comparePlaceholder}/>
          </div>}
          <div style={{marginTop:18}}>
            <span style={{color:'#475569',fontSize:12,fontFamily:'var(--mono)'}}>{t.tryExample}</span>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>
              {(examplePrompts[lang]||examplePrompts.en).map((ex,i)=>(
                <button key={i} className="ex-btn" onClick={()=>{setInputText(ex);snd('click',soundOn)}}>{ex}</button>
              ))}
            </div>
          </div>
          <div style={{textAlign:'center',marginTop:24}}>
            <button className="btn btn-p" onClick={handleExplore} disabled={!inputText.trim()} style={{opacity:inputText.trim()?1:.4}}>
              ▶ {t.explore}
            </button>
          </div>
        </div>
      </div>}

      {/* Loading */}
      {loading&&<div style={{textAlign:'center',marginTop:80,animation:'fadeIn 0.3s'}}>
        <div className="loader" style={{margin:'0 auto 16px'}}/>
        <p style={{color:'#6366f1',fontSize:14,fontFamily:'var(--mono)'}}>{t.loading}</p>
      </div>}

      {/* Stage view */}
      {stage>=0&&!loading&&<div style={{animation:'fadeIn 0.3s'}}>
        {/* Prompt banner */}
        <div style={{
          background:'#0f0f23',border:'1px solid #1e293b',borderRadius:10,padding:'10px 18px',
          marginBottom:16,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'
        }}>
          <span style={{color:'#6366f1',fontFamily:'var(--mono)',fontSize:11,fontWeight:600}}>{t.yourPrompt}:</span>
          <span style={{color:'#e2e8f0',fontSize:14,fontWeight:600}}>"{inputText}"</span>
          {compareMode&&compareText&&<>
            <span style={{color:'#1e293b'}}>|</span>
            <span style={{color:'#f43f5e',fontFamily:'var(--mono)',fontSize:11,fontWeight:600}}>{t.inputB}:</span>
            <span style={{color:'#f43f5e',fontSize:14,fontWeight:600}}>"{compareText}"</span>
          </>}
        </div>

        {/* Stage dots */}
        <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:12}}>
          {t.stageNames.map((name,i)=>(
            <div key={i} className="dot" style={{
              background:i===stage?'#1e1b4b':i<stage?'#22c55e11':'#0f172a',
              borderColor:i===stage?'#6366f1':i<stage?'#22c55e44':'#1e293b',
              color:i===stage?'#a5b4fc':i<stage?'#22c55e':'#334155',
              boxShadow:i===stage?'0 0 10px #6366f133':'none'
            }} title={name}>{i<stage?'✓':STAGE_ICONS[i]}</div>
          ))}
        </div>

        {/* Title */}
        <div style={{textAlign:'center',marginBottom:16}}>
          <h2 style={{fontSize:22,fontWeight:700,color:'#e2e8f0',letterSpacing:'-0.01em'}}>{t.stageNames[stage]}</h2>
          <p style={{color:'#6366f1',fontSize:12,fontFamily:'var(--mono)',marginTop:2}}>{t.stageSubtitles[stage]}</p>
        </div>

        {/* Built-in explanation */}
        <div className="card" style={{marginBottom:14,borderLeft:'2px solid #4338ca'}}>
          <div style={{color:'#cbd5e1',fontSize:14,lineHeight:1.85}}><RT text={t.stageExplanations[stage]}/></div>
        </div>

        {/* Visualization */}
        {compareMode&&compData?(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div className="card">
              <div style={{color:'#6366f1',fontSize:11,fontWeight:600,marginBottom:6,fontFamily:'var(--mono)',textAlign:'center'}}>{t.inputA}</div>
              {renderVizFinal(stage,tokens,stageData,`a-${animKey}-${stage}`)}
            </div>
            <div className="card">
              <div style={{color:'#f43f5e',fontSize:11,fontWeight:600,marginBottom:6,fontFamily:'var(--mono)',textAlign:'center'}}>{t.inputB}</div>
              {renderVizFinal(stage,compTokens,compData,`b-${animKey}-${stage}`)}
            </div>
          </div>
        ):(
          <div className="card">
            {renderVizFinal(stage,tokens,stageData,`m-${animKey}-${stage}`)}
          </div>
        )}

        {/* Fun fact */}
        {curSD?.funFact&&<div style={{
          marginTop:14,padding:'12px 18px',borderRadius:10,
          background:'#1e1b4b22',border:'1px solid #312e8133'
        }}>
          <span style={{color:'#a5b4fc',fontWeight:600,fontSize:12,fontFamily:'var(--mono)'}}>{t.funFact}: </span>
          <span style={{color:'#94a3b8',fontSize:13}}>{curSD.funFact}</span>
        </div>}

        {/* Quiz */}
        {curSD?.quiz&&<Quiz key={`q-${stage}-${animKey}`} quiz={curSD.quiz} lang={lang} soundOn={soundOn}/>}

        {/* Hint */}
        <div style={{textAlign:'center',marginTop:10,color:'#334155',fontSize:11,fontFamily:'var(--mono)'}}>
          {stage<=3?t.hoverHint:stage===4?t.clickHint:''}
        </div>

        {/* Nav */}
        <div style={{display:'flex',justifyContent:'space-between',marginTop:20,marginBottom:40}}>
          <button className="btn btn-s" onClick={stage===0?restart:goBack}>
            {stage===0?`↩ ${t.restart}`:`← ${t.back}`}
          </button>
          {stage<6?<button className="btn btn-p" onClick={goNext}>{t.next} →</button>
            :<button className="btn btn-p" onClick={restart}>↺ {t.restart}</button>}
        </div>
      </div>}
    </div>
  </>;
}
