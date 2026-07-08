function $(s){return document.querySelector(s)}
function inject(){if($('#visualPolish7Style'))return;const style=document.createElement('style');style.id='visualPolish7Style';style.textContent=`
#game{perspective:780px;overflow:hidden;background:linear-gradient(#9be7ff 0 18%,#6bd66f 18% 100%)}
#game:before{content:'';position:absolute;inset:0 0 auto 0;height:28%;z-index:1;pointer-events:none;background:linear-gradient(#bff2ff,#ffffff55 55%,transparent);opacity:.65}
#map{filter:saturate(1.22) contrast(1.06);transform-origin:50% 54%;box-shadow:inset 0 -120px 160px #07111e22;transition:filter .28s ease}
#map:after{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 62%,transparent 0 36%,#07111e22 100%),linear-gradient(0deg,#07111e44,transparent 42%,#ffffff33);mix-blend-mode:multiply;opacity:.55}
.player{z-index:32!important;filter:drop-shadow(0 16px 14px #0007);transition:transform .18s ease,filter .18s ease}
.player:after{content:'';position:absolute;left:50%;bottom:-10px;width:74px;height:22px;border-radius:50%;background:#0006;transform:translateX(-50%);filter:blur(7px);z-index:-1}
.bug{z-index:31;transition:transform .22s ease,filter .22s ease;animation:bugFloat 2.4s ease-in-out infinite;will-change:transform,filter}
.bug .sp{position:relative;box-shadow:0 10px 24px #0005,0 0 0 2px var(--c,#fff),0 0 22px color-mix(in srgb,var(--c,#fff) 55%,transparent);background:#ffffffee!important;overflow:visible!important}
.bug .sp:after{content:'';position:absolute;left:50%;bottom:-12px;width:58px;height:16px;border-radius:50%;background:#0007;transform:translateX(-50%);filter:blur(8px);z-index:-1}
.bug .sp img{transform:scale(1.08);filter:drop-shadow(0 8px 7px #0005)}
.bug .lab{margin-top:4px;background:#07111ed9!important;border:1px solid #ffffff44;box-shadow:0 8px 16px #0006;color:white!important;text-shadow:0 2px 4px #000}
.bug.boosted .sp{animation:rareGlow 1.4s ease-in-out infinite alternate}
@keyframes bugFloat{0%,100%{margin-top:0}50%{margin-top:-7px}}
@keyframes rareGlow{0%{box-shadow:0 10px 24px #0005,0 0 10px #82f7c1}100%{box-shadow:0 14px 30px #0007,0 0 28px #82f7c1,0 0 50px #82f7c155}}
#enc{background:linear-gradient(#b7ecff,#bff1cd 42%,#4eb04f)!important;backdrop-filter:blur(3px)}
#enc:before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,#ffffff99,transparent 38%),radial-gradient(circle at 50% 58%,transparent 0 28%,#00000028 100%);z-index:0}
#enc .panel{background:transparent!important;box-shadow:none!important;overflow:visible!important}
#enc .stage{min-height:46vh;border-radius:0!important;background:linear-gradient(#c8f1ff 0 30%,#a8e98b 30% 100%)!important;box-shadow:inset 0 -80px 90px #2f7a2b55;position:relative;overflow:hidden}
#enc .stage:before{content:'';position:absolute;left:-20%;right:-20%;bottom:8%;height:24%;background:radial-gradient(ellipse,#ffffff99 0 15%,transparent 16%),linear-gradient(90deg,transparent,#ffffff44,transparent);opacity:.5;filter:blur(1px)}
#enc .target{filter:drop-shadow(0 28px 18px #0008);transform-origin:50% 88%;animation:targetBreath 1.7s ease-in-out infinite;z-index:2}
#enc .target img{transform:scale(1.35);image-rendering:auto}
#enc .target:after{content:'';position:absolute;left:50%;bottom:-22px;width:110px;height:28px;border-radius:50%;background:#0007;transform:translateX(-50%);filter:blur(10px);z-index:-1}
#enc .net{z-index:3;filter:drop-shadow(0 10px 10px #0007);transform:scale(1.15);transition:transform .2s ease,filter .2s ease}
#enc .body{position:relative;z-index:4;background:#fffffff2!important;border-radius:28px 28px 0 0!important;box-shadow:0 -18px 40px #0004!important}
#judge{font-size:20px!important;letter-spacing:.5px}
#catch{background:linear-gradient(135deg,#07111e,#123b5c)!important;box-shadow:0 10px 22px #0004!important}
@keyframes targetBreath{0%,100%{scale:1}50%{scale:1.045}}
body[data-gps="on"] .player,body[data-gps="requesting"] .player{filter:drop-shadow(0 16px 14px #0007) drop-shadow(0 0 18px #7fffd4)}
body[data-gps="on"] #map{filter:saturate(1.28) contrast(1.08) brightness(1.03)}
`;document.head.appendChild(style)}
function tick(){inject();setTimeout(tick,1500)}
document.addEventListener('DOMContentLoaded',()=>setTimeout(tick,600));setTimeout(tick,1200);
