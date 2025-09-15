class CoordSys{
    constructor(gameArea){
        this.area=gameArea;
    }

toStage(x,y,element,anchor='center'){
    const w=this.area.clientWidth;
    const h=this.area.clientHeight;
    const stageX=w/2+x;
    const stageY=y;
    element.style.position="absolute";
    element.style.left=stageX+'px';
    element.style.bottom=stageY+'px';
    if(anchor==='center'){
    element.style.transform = "translate(-50%,-50%)";  
}
else if(anchor==='center-bottom'){
    element.style.transform='translate(-50%,0)'
}
else{
    element.style.transform='';
}
}
}