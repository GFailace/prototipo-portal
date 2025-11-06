import{a as se}from"./chunk-P5EMSU3E.js";import{a as ce,e as ae,u as re}from"./chunk-IAHTW4I6.js";import{Ma as de,Oa as le,da as ne,ea as te,i as J,k as W,m as Y,p as ee,ta as oe,ua as T,za as ie}from"./chunk-MJDQIN5M.js";import{$b as K,Bb as G,Cc as a,Db as m,Dc as Z,Gb as L,Ha as h,Hb as P,Ib as V,Jb as F,L as A,M as $,N as q,Pb as U,Qb as b,R as v,Sa as M,Ta as j,Ua as I,W as C,Wa as u,X as _,Y as x,Ya as g,_a as w,cc as X,da as y,gb as p,ha as Q,ia as d,mb as l,nb as S,ob as z,pb as D,sb as H,sc as f,tb as B,ub as E,wb as R,wc as i}from"./chunk-46BPWYI5.js";var N=(()=>{class e extends re{required=i(void 0,{transform:a});invalid=i(void 0,{transform:a});disabled=i(void 0,{transform:a});name=i();_disabled=y(!1);$disabled=f(()=>this.disabled()||this._disabled());onModelChange=()=>{};onModelTouched=()=>{};writeDisabledState(n){this._disabled.set(n)}writeControlValue(n,o){}writeValue(n){this.writeControlValue(n,this.writeModelValue.bind(this))}registerOnChange(n){this.onModelChange=n}registerOnTouched(n){this.onModelTouched=n}setDisabledState(n){this.writeDisabledState(n),this.cd.markForCheck()}static \u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})();static \u0275dir=I({type:e,inputs:{required:[1,"required"],invalid:[1,"invalid"],disabled:[1,"disabled"],name:[1,"name"]},features:[u]})}return e})();var me=["data-p-icon","check"],he=(()=>{class e extends le{static \u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})();static \u0275cmp=M({type:e,selectors:[["","data-p-icon","check"]],features:[u],attrs:me,decls:1,vars:0,consts:[["d","M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z","fill","currentColor"]],template:function(o,t){o&1&&(x(),H(0,"path",0))},encapsulation:2})}return e})();var ue=`
    .p-checkbox {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('checkbox.width');
        height: dt('checkbox.height');
    }

    .p-checkbox-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border: 1px solid transparent;
        border-radius: dt('checkbox.border.radius');
    }

    .p-checkbox-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: dt('checkbox.border.radius');
        border: 1px solid dt('checkbox.border.color');
        background: dt('checkbox.background');
        width: dt('checkbox.width');
        height: dt('checkbox.height');
        transition:
            background dt('checkbox.transition.duration'),
            color dt('checkbox.transition.duration'),
            border-color dt('checkbox.transition.duration'),
            box-shadow dt('checkbox.transition.duration'),
            outline-color dt('checkbox.transition.duration');
        outline-color: transparent;
        box-shadow: dt('checkbox.shadow');
    }

    .p-checkbox-icon {
        transition-duration: dt('checkbox.transition.duration');
        color: dt('checkbox.icon.color');
        font-size: dt('checkbox.icon.size');
        width: dt('checkbox.icon.size');
        height: dt('checkbox.icon.size');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        border-color: dt('checkbox.hover.border.color');
    }

    .p-checkbox-checked .p-checkbox-box {
        border-color: dt('checkbox.checked.border.color');
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked .p-checkbox-icon {
        color: dt('checkbox.icon.checked.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
        border-color: dt('checkbox.checked.hover.border.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-icon {
        color: dt('checkbox.icon.checked.hover.color');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.focus.border.color');
        box-shadow: dt('checkbox.focus.ring.shadow');
        outline: dt('checkbox.focus.ring.width') dt('checkbox.focus.ring.style') dt('checkbox.focus.ring.color');
        outline-offset: dt('checkbox.focus.ring.offset');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.checked.focus.border.color');
    }

    .p-checkbox.p-invalid > .p-checkbox-box {
        border-color: dt('checkbox.invalid.border.color');
    }

    .p-checkbox.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.filled.background');
    }

    .p-checkbox-checked.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked.p-variant-filled:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
    }

    .p-checkbox.p-disabled {
        opacity: 1;
    }

    .p-checkbox.p-disabled .p-checkbox-box {
        background: dt('checkbox.disabled.background');
        border-color: dt('checkbox.checked.disabled.border.color');
    }

    .p-checkbox.p-disabled .p-checkbox-box .p-checkbox-icon {
        color: dt('checkbox.icon.disabled.color');
    }

    .p-checkbox-sm,
    .p-checkbox-sm .p-checkbox-box {
        width: dt('checkbox.sm.width');
        height: dt('checkbox.sm.height');
    }

    .p-checkbox-sm .p-checkbox-icon {
        font-size: dt('checkbox.icon.sm.size');
        width: dt('checkbox.icon.sm.size');
        height: dt('checkbox.icon.sm.size');
    }

    .p-checkbox-lg,
    .p-checkbox-lg .p-checkbox-box {
        width: dt('checkbox.lg.width');
        height: dt('checkbox.lg.height');
    }

    .p-checkbox-lg .p-checkbox-icon {
        font-size: dt('checkbox.icon.lg.size');
        width: dt('checkbox.icon.lg.size');
        height: dt('checkbox.icon.lg.size');
    }
`;var fe=["icon"],ke=["input"],xe=(e,s)=>({checked:e,class:s});function ge(e,s){if(e&1&&D(0,"span",7),e&2){let n=m(3);b(n.cx("icon")),l("ngClass",n.checkboxIcon),p("data-pc-section","icon")}}function ve(e,s){if(e&1&&(x(),D(0,"svg",8)),e&2){let n=m(3);b(n.cx("icon")),p("data-pc-section","icon")}}function Ce(e,s){if(e&1&&(B(0),g(1,ge,1,4,"span",5)(2,ve,1,3,"svg",6),E()),e&2){let n=m(2);h(),l("ngIf",n.checkboxIcon),h(),l("ngIf",!n.checkboxIcon)}}function _e(e,s){if(e&1&&(x(),D(0,"svg",9)),e&2){let n=m(2);b(n.cx("icon")),p("data-pc-section","icon")}}function ye(e,s){if(e&1&&(B(0),g(1,Ce,3,2,"ng-container",2)(2,_e,1,3,"svg",4),E()),e&2){let n=m();h(),l("ngIf",n.checked),h(),l("ngIf",n._indeterminate())}}function Me(e,s){}function Ie(e,s){e&1&&g(0,Me,0,0,"ng-template")}var we=`
    ${ue}

    /* For PrimeNG */
    p-checkBox.ng-invalid.ng-dirty .p-checkbox-box,
    p-check-box.ng-invalid.ng-dirty .p-checkbox-box,
    p-checkbox.ng-invalid.ng-dirty .p-checkbox-box {
        border-color: dt('checkbox.invalid.border.color');
    }
`,De={root:({instance:e})=>["p-checkbox p-component",{"p-checkbox-checked p-highlight":e.checked,"p-disabled":e.$disabled(),"p-invalid":e.invalid(),"p-variant-filled":e.$variant()==="filled","p-checkbox-sm p-inputfield-sm":e.size()==="small","p-checkbox-lg p-inputfield-lg":e.size()==="large"}],box:"p-checkbox-box",input:"p-checkbox-input",icon:"p-checkbox-icon"},be=(()=>{class e extends ie{name="checkbox";theme=we;classes=De;static \u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})();static \u0275prov=$({token:e,factory:e.\u0275fac})}return e})();var Ve={provide:ce,useExisting:A(()=>pe),multi:!0},pe=(()=>{class e extends N{value;binary;ariaLabelledBy;ariaLabel;tabindex;inputId;inputStyle;styleClass;inputClass;indeterminate=!1;formControl;checkboxIcon;readonly;autofocus;trueValue=!0;falseValue=!1;variant=i();size=i();onChange=new w;onFocus=new w;onBlur=new w;inputViewChild;get checked(){return this._indeterminate()?!1:this.binary?this.modelValue()===this.trueValue:te(this.value,this.modelValue())}_indeterminate=y(void 0);checkboxIconTemplate;templates;_checkboxIconTemplate;focused=!1;_componentStyle=v(be);$variant=f(()=>this.variant()||this.config.inputStyle()||this.config.inputVariant());ngAfterContentInit(){this.templates?.forEach(n=>{switch(n.getType()){case"icon":this._checkboxIconTemplate=n.template;break;case"checkboxicon":this._checkboxIconTemplate=n.template;break}})}ngOnChanges(n){super.ngOnChanges(n),n.indeterminate&&this._indeterminate.set(n.indeterminate.currentValue)}updateModel(n){let o,t=this.injector.get(ae,null,{optional:!0,self:!0}),c=t&&!this.formControl?t.value:this.modelValue();this.binary?(o=this._indeterminate()?this.trueValue:this.checked?this.falseValue:this.trueValue,this.writeModelValue(o),this.onModelChange(o)):(this.checked||this._indeterminate()?o=c.filter(r=>!ne(r,this.value)):o=c?[...c,this.value]:[this.value],this.onModelChange(o),this.writeModelValue(o),this.formControl&&this.formControl.setValue(o)),this._indeterminate()&&this._indeterminate.set(!1),this.onChange.emit({checked:o,originalEvent:n})}handleChange(n){this.readonly||this.updateModel(n)}onInputFocus(n){this.focused=!0,this.onFocus.emit(n)}onInputBlur(n){this.focused=!1,this.onBlur.emit(n),this.onModelTouched()}focus(){this.inputViewChild?.nativeElement.focus()}writeControlValue(n,o){o(n),this.cd.markForCheck()}static \u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})();static \u0275cmp=M({type:e,selectors:[["p-checkbox"],["p-checkBox"],["p-check-box"]],contentQueries:function(o,t,c){if(o&1&&(L(c,fe,4),L(c,oe,4)),o&2){let r;V(r=F())&&(t.checkboxIconTemplate=r.first),V(r=F())&&(t.templates=r)}},viewQuery:function(o,t){if(o&1&&P(ke,5),o&2){let c;V(c=F())&&(t.inputViewChild=c.first)}},hostVars:6,hostBindings:function(o,t){o&2&&(p("data-pc-name","checkbox")("data-p-highlight",t.checked)("data-p-checked",t.checked)("data-p-disabled",t.$disabled()),b(t.cn(t.cx("root"),t.styleClass)))},inputs:{value:"value",binary:[2,"binary","binary",a],ariaLabelledBy:"ariaLabelledBy",ariaLabel:"ariaLabel",tabindex:[2,"tabindex","tabindex",Z],inputId:"inputId",inputStyle:"inputStyle",styleClass:"styleClass",inputClass:"inputClass",indeterminate:[2,"indeterminate","indeterminate",a],formControl:"formControl",checkboxIcon:"checkboxIcon",readonly:[2,"readonly","readonly",a],autofocus:[2,"autofocus","autofocus",a],trueValue:"trueValue",falseValue:"falseValue",variant:[1,"variant"],size:[1,"size"]},outputs:{onChange:"onChange",onFocus:"onFocus",onBlur:"onBlur"},features:[K([Ve,be]),u,Q],decls:5,vars:22,consts:[["input",""],["type","checkbox",3,"focus","blur","change","checked"],[4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],["data-p-icon","minus",3,"class",4,"ngIf"],[3,"class","ngClass",4,"ngIf"],["data-p-icon","check",3,"class",4,"ngIf"],[3,"ngClass"],["data-p-icon","check"],["data-p-icon","minus"]],template:function(o,t){if(o&1){let c=R();S(0,"input",1,0),G("focus",function(k){return C(c),_(t.onInputFocus(k))})("blur",function(k){return C(c),_(t.onInputBlur(k))})("change",function(k){return C(c),_(t.handleChange(k))}),z(),S(2,"div"),g(3,ye,3,2,"ng-container",2)(4,Ie,1,0,null,3),z()}o&2&&(U(t.inputStyle),b(t.cn(t.cx("input"),t.inputClass)),l("checked",t.checked),p("id",t.inputId)("value",t.value)("name",t.name())("tabindex",t.tabindex)("required",t.required()?"":void 0)("readonly",t.readonly?"":void 0)("disabled",t.$disabled()?"":void 0)("aria-labelledby",t.ariaLabelledBy)("aria-label",t.ariaLabel),h(2),b(t.cx("box")),h(),l("ngIf",!t.checkboxIconTemplate&&!t._checkboxIconTemplate),h(),l("ngTemplateOutlet",t.checkboxIconTemplate||t._checkboxIconTemplate)("ngTemplateOutletContext",X(19,xe,t.checked,t.cx("icon"))))},dependencies:[ee,J,W,Y,T,he,se],encapsulation:2,changeDetection:0})}return e})(),on=(()=>{class e{static \u0275fac=function(o){return new(o||e)};static \u0275mod=j({type:e});static \u0275inj=q({imports:[pe,T,T]})}return e})();var sn=(()=>{class e extends N{pcFluid=v(de,{optional:!0,host:!0,skipSelf:!0});fluid=i(void 0,{transform:a});variant=i();size=i();inputSize=i();pattern=i();min=i();max=i();step=i();minlength=i();maxlength=i();$variant=f(()=>this.variant()||this.config.inputStyle()||this.config.inputVariant());get hasFluid(){return this.fluid()??!!this.pcFluid}static \u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})();static \u0275dir=I({type:e,inputs:{fluid:[1,"fluid"],variant:[1,"variant"],size:[1,"size"],inputSize:[1,"inputSize"],pattern:[1,"pattern"],min:[1,"min"],max:[1,"max"],step:[1,"step"],minlength:[1,"minlength"],maxlength:[1,"maxlength"]},features:[u]})}return e})();export{N as a,he as b,sn as c,pe as d,on as e};
