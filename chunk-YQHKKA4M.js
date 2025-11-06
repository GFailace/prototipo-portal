import{a as G}from"./chunk-XRDK3KIB.js";import{b as F}from"./chunk-NHQIUECH.js";import{a as W,b as z}from"./chunk-PA2VT7HQ.js";import"./chunk-F7FOKUKQ.js";import"./chunk-PE7RODJA.js";import{Ca as B,Ra as N,Ta as L,k as U,p as h,ta as E,ua as v,za as R}from"./chunk-MJDQIN5M.js";import{$b as D,Bb as y,Db as c,Ha as a,M as k,Ma as _,N as A,Nb as V,Qb as g,R as P,Rb as l,Sa as m,Sb as w,Ta as S,W as b,Wa as j,X as C,Y as M,Ya as d,gb as f,ha as O,ia as x,mb as p,nb as s,ob as o,pb as u,wb as T}from"./chunk-46BPWYI5.js";import"./chunk-EQDQRRRY.js";var H=`
    .p-progressspinner {
        position: relative;
        margin: 0 auto;
        width: 100px;
        height: 100px;
        display: inline-block;
    }

    .p-progressspinner::before {
        content: '';
        display: block;
        padding-top: 100%;
    }

    .p-progressspinner-spin {
        height: 100%;
        transform-origin: center center;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        animation: p-progressspinner-rotate 2s linear infinite;
    }

    .p-progressspinner-circle {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: 0;
        stroke: dt('progressspinner.colorOne');
        animation:
            p-progressspinner-dash 1.5s ease-in-out infinite,
            p-progressspinner-color 6s ease-in-out infinite;
        stroke-linecap: round;
    }

    @keyframes p-progressspinner-rotate {
        100% {
            transform: rotate(360deg);
        }
    }
    @keyframes p-progressspinner-dash {
        0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
        }
        100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
        }
    }
    @keyframes p-progressspinner-color {
        100%,
        0% {
            stroke: dt('progressspinner.color.one');
        }
        40% {
            stroke: dt('progressspinner.color.two');
        }
        66% {
            stroke: dt('progressspinner.color.three');
        }
        80%,
        90% {
            stroke: dt('progressspinner.color.four');
        }
    }
`;var Q={root:()=>["p-progressspinner"],spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},$=(()=>{class t extends R{name="progressspinner";theme=H;classes=Q;static \u0275fac=(()=>{let e;return function(i){return(e||(e=x(t)))(i||t)}})();static \u0275prov=k({token:t,factory:t.\u0275fac})}return t})();var I=(()=>{class t extends B{styleClass;strokeWidth="2";fill="none";animationDuration="2s";ariaLabel;_componentStyle=P($);static \u0275fac=(()=>{let e;return function(i){return(e||(e=x(t)))(i||t)}})();static \u0275cmp=m({type:t,selectors:[["p-progressSpinner"],["p-progress-spinner"],["p-progressspinner"]],hostVars:7,hostBindings:function(r,i){r&2&&(f("aria-label",i.ariaLabel)("role","progressbar")("data-pc-name","progressspinner")("data-pc-section","root")("aria-busy",!0),g(i.cn(i.cx("root"),i.styleClass)))},inputs:{styleClass:"styleClass",strokeWidth:"strokeWidth",fill:"fill",animationDuration:"animationDuration",ariaLabel:"ariaLabel"},features:[D([$]),j],decls:2,vars:9,consts:[["viewBox","25 25 50 50"],["cx","50","cy","50","r","20","stroke-miterlimit","10"]],template:function(r,i){r&1&&(M(),s(0,"svg",0),u(1,"circle",1),o()),r&2&&(g(i.cx("spin")),V("animation-duration",i.animationDuration),f("data-pc-section","root"),a(),g(i.cx("circle")),f("fill",i.fill)("stroke-width",i.strokeWidth))},dependencies:[h,v],encapsulation:2,changeDetection:0})}return t})(),q=(()=>{class t{static \u0275fac=function(r){return new(r||t)};static \u0275mod=S({type:t});static \u0275inj=A({imports:[I,v,v]})}return t})();function Y(t,n){if(t&1&&(s(0,"div",8),l(1,"Cliente: "),s(2,"span",9),l(3),o()()),t&2){let e=c(2);a(3),w(e.clientId)}}function Z(t,n){t&1&&(s(0,"div",10),l(1,"Nenhum ART dispon\xEDvel"),o())}function ee(t,n){if(t&1&&(s(0,"div",4)(1,"div")(2,"div",5),l(3,"ART"),o(),d(4,Y,4,1,"div",6),o(),d(5,Z,2,0,"div",7),o()),t&2){let e=c();a(4),p("ngIf",e.clientId),a(),p("ngIf",!e.hasArt)}}function te(t,n){t&1&&(s(0,"div",17),u(1,"p-progressSpinner",18),o())}function ne(t,n){if(t&1){let e=T();s(0,"div")(1,"div",11)(2,"div",12)(3,"strong"),l(4),o()()(),s(5,"div",13)(6,"button",14),y("click",function(){b(e);let i=c();return C(i.downloadArt())}),l(7,"Baixar"),o(),s(8,"button",15),y("click",function(){b(e);let i=c();return C(i.openInNewTab())}),l(9,"Abrir"),o(),d(10,te,2,0,"div",16),o()()}if(t&2){let e=c();a(4),w(e.fileName||"ART-"+(e.clientId||"cliente")+".pdf"),a(2),p("disabled",e.loading),a(2),p("disabled",e.loading),a(2),p("ngIf",e.loading)}}function ie(t,n){t&1&&(s(0,"div",19),l(1,"O ART ainda n\xE3o foi carregado pelo administrador."),o())}var J=class t{constructor(n,e){this.route=n;this.svc=e}clientId;pdfUrl=null;fileName=null;hasArt=!1;loading=!1;objectUrl=null;ngOnInit(){if(this.clientId){this.loadForClientId(this.clientId);return}let n=this.route.snapshot.paramMap.get("clientId");if(!n){let e=this.route.parent;for(;e&&!n;)n=e.snapshot.paramMap.get("clientId"),e=e.parent}if(!n){console.debug("PmocArtViewer: clientId not found on route or parents"),this.hasArt=!1;return}this.loadForClientId(n)}ngOnChanges(n){if(n.clientId&&!n.clientId.isFirstChange()){let e=n.clientId.currentValue;this.loadForClientId(e)}}loadForClientId(n){if(!n){this.hasArt=!1;return}this.loading=!0;try{console.debug("PmocArtViewer: loading ART for clientId",n);let e=this.svc.getArtBlobForClient(n||void 0);if(!e){this.hasArt=!1,this.loading=!1;return}if(this.objectUrl){try{URL.revokeObjectURL(this.objectUrl)}catch{}this.objectUrl=null}this.objectUrl=URL.createObjectURL(e),this.pdfUrl=this.objectUrl;let r=this.svc.getArtBase64ForClient(n||void 0);this.fileName=r?r.name:`ART-${n}.pdf`,this.hasArt=!0}catch(e){console.error("failed to load ART",e),this.hasArt=!1}finally{this.loading=!1}}downloadArt(){if(!this.objectUrl)return;let n=document.createElement("a");n.href=this.objectUrl,n.download=this.fileName||"ART.pdf",document.body.appendChild(n),n.click(),n.remove()}openInNewTab(){this.objectUrl&&window.open(this.objectUrl,"_blank")}ngOnDestroy(){this.objectUrl&&(URL.revokeObjectURL(this.objectUrl),this.objectUrl=null)}static \u0275fac=function(e){return new(e||t)(_(F),_(G))};static \u0275cmp=m({type:t,selectors:[["pmoc-art-viewer"]],inputs:{clientId:"clientId"},features:[O],decls:5,vars:2,consts:[[1,"p-4","rounded","border","border-surface-200","dark:border-surface-700","bg-surface-0","dark:bg-surface-900","shadow-sm","pmoc-card","pmoc-art-card"],["pTemplate","header"],[4,"ngIf"],["class","p-3 text-sm text-muted",4,"ngIf"],[1,"flex","items-center","justify-between"],[1,"font-semibold","pmoc-title"],["class","text-sm text-muted mt-0.5",4,"ngIf"],["class","text-sm text-muted",4,"ngIf"],[1,"text-sm","text-muted","mt-0.5"],[1,"font-medium"],[1,"text-sm","text-muted"],[1,"p-2"],[1,"text-sm","truncate"],[1,"pmoc-footer","flex","items-center","justify-start","gap-2"],["pButton","","type","button","icon","pi pi-download",1,"p-button-sm","flex-none","whitespace-nowrap",3,"click","disabled"],["pButton","","type","button","icon","pi pi-external-link",1,"p-button-sm","p-button-text","ml-2","flex-none","whitespace-nowrap",3,"click","disabled"],["class","ml-3",4,"ngIf"],[1,"ml-3"],["styleClass","p-small"],[1,"p-3","text-sm","text-muted"]],template:function(e,r){e&1&&(s(0,"div")(1,"p-card",0),d(2,ee,6,2,"ng-template",1)(3,ne,11,4,"div",2)(4,ie,2,0,"div",3),o()()),e&2&&(a(3),p("ngIf",r.hasArt),a(),p("ngIf",!r.hasArt))},dependencies:[h,U,L,N,E,z,W,q,I],styles:["[_nghost-%COMP%]{display:block}.pmoc-card[_ngcontent-%COMP%]{padding:1rem!important}.pmoc-title[_ngcontent-%COMP%]{font-size:1.05rem;letter-spacing:-.2px}.pmoc-art-card[_ngcontent-%COMP%]{max-width:100%}.pmoc-footer[_ngcontent-%COMP%]{margin-top:.5rem;padding-top:.5rem;border-top:1px solid var(--surface-border, rgba(0, 0, 0, .06))}.truncate[_ngcontent-%COMP%]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.app-dark[_nghost-%COMP%]   .pmoc-title[_ngcontent-%COMP%], .app-dark   [_nghost-%COMP%]   .pmoc-title[_ngcontent-%COMP%], .dark[_nghost-%COMP%]   .pmoc-title[_ngcontent-%COMP%], .dark   [_nghost-%COMP%]   .pmoc-title[_ngcontent-%COMP%]{color:inherit}"]})};export{J as PmocArtViewerComponent};
