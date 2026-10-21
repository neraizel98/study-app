// Independent exact arithmetic. Does not import production calculation helpers.
const gcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){[a,b]=[b,a%b];}return a||1n;};
function fraction(n,d=1n){n=BigInt(n);d=BigInt(d);if(!d)throw Error('zero denominator');if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return [n/g,d/g];}
function decimal(v){const s=String(v);if(!/^-?\d+(\.\d+)?$/.test(s))throw Error('not rational: '+s);const places=(s.split('.')[1]||'').length;return fraction(s.replace('.',''),10n**BigInt(places));}
const mul=(a,b)=>fraction(a[0]*b[0],a[1]*b[1]);
const div=(a,b)=>fraction(a[0]*b[1],a[1]*b[0]);
function value(text){let s=String(text).replace(/\$/g,'').replace(/\\%/g,'').replace(/(?:cm|m|kg|L)(?:\^[23])?$/,'').replace(/(?:개|명|원|분|층|점|살|℃)$/,'').trim();const f=s.match(/^\\frac\{(-?\d+)\}\{(-?\d+)\}$/);return f?fraction(f[1],f[2]):decimal(s);}
function expected(meta){const p=meta.operands;switch(meta.kind){
case 'boxVolume':if(p.some(v=>v<=0))throw Error('dimensions');return p.reduce((a,x)=>mul(a,decimal(x)),decimal(1));
case 'boxSurface':if(p.some(v=>v<=0))throw Error('dimensions');return decimal(p[0]*p[1]+p[1]*p[2]+p[2]*p[0]+p[0]*p[1]+p[1]*p[2]+p[2]*p[0]);
case 'percentPart':return div(mul(decimal(p[0]),decimal(p[1])),decimal(100));
case 'proportionMissing':{const i=meta.missingIndex;const slots=[[1,2,3],[0,3,2],[0,3,1],[1,2,0]][i];return div(mul(decimal(p[slots[0]]),decimal(p[slots[1]])),decimal(p[slots[2]]));}
case 'primeCount':{let n=p[0],count=0;for(let d=2;d<=n;d++){if(n%d===0){count++;while(n%d===0)n/=d;}}return decimal(count);}
case 'primeExponent':{let n=p[0],count=0;while(n%p[1]===0){count++;n/=p[1];}return decimal(count);}
case 'divisorCount':{let count=0;for(let d=1;d<=p[0];d++)if(p[0]%d===0)count++;return decimal(count);}
case 'gcd':{let d=Math.min(...p);while(p.some(n=>n%d!==0))d--;return decimal(d);}
case 'lcm':{let n=Math.max(...p);while(p.some(v=>n%v!==0))n++;return decimal(n);}
case 'absolute':return decimal(p[0]<0?-p[0]:p[0]);
case 'sum':return decimal(p[0]+p[1]);
case 'subtract':return decimal(p[0]-p[1]);
case 'product':return mul(decimal(p[0]),decimal(p[1]));
case 'subtractProduct':return decimal(p[0]-p[1]*p[2]);
case 'differenceProduct':return decimal((p[0]-p[1])*p[2]);
case 'linearValue':return decimal(p[0]*p[1]+p[2]);
case 'rectanglePerimeter':if(p.some(v=>v<=0))throw Error('dimensions');return decimal(2*p[0]+2*p[1]);
case 'linearEquation':return div(decimal(p[3]-p[1]),decimal(p[0]-p[2]));
case 'fractionDivision':return div(fraction(p[0],p[1]),fraction(p[2],p[3]));
case 'division':return div(decimal(p[0]),decimal(p[1]));
case 'percentage':return mul(div(decimal(p[0]),decimal(p[1])),decimal(100));
case 'circleArea':if(p[0]<=0)throw Error('radius');return mul(mul(decimal(p[0]),decimal(p[0])),decimal(p[1]));
case 'cylinderVolume':if(p[0]<=0||p[1]<=0)throw Error('dimensions');return p.reduce((a,x)=>mul(a,decimal(x)),decimal(p[0]));
case 'polyCount':{const [shape,property,n]=p;if(n<3)throw Error('polygon');const vertices=shape==='각기둥'?2*n:n+1;const edges=shape==='각기둥'?3*n:2*n;return decimal(property==='꼭짓점'?vertices:property==='모서리'?edges:2-vertices+edges);}
default:throw Error('unsupported oracle '+meta.kind);
}}
const equal=(a,b)=>a[0]===b[0]&&a[1]===b[1];
function verify(q){if(!q.verification)return {supported:false};if(q.verification.renderedQuestion!==q.question)throw Error('rendered conditions changed');const answer=expected(q.verification);const matches=q.choices.map((c,i)=>{try{return equal(value(c),answer)?i:-1;}catch{return -1;}}).filter(i=>i>=0);if(matches.length!==1||matches[0]!==q.answer)throw Error(JSON.stringify({expected:answer.map(String),matches,question:q.question,choices:q.choices,answer:q.answer,inputs:q.verification}));return {supported:true};}
module.exports={fraction,decimal,value,equal,expected,verify};
