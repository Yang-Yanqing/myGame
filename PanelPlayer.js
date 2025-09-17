
// const coordSys=new CoordSys(gameArea);
// const gameArea=document.getElementById('gameArea');
// const gameClock=new TimeAxis(1);
gameClock.start();
class PanelPlayer{
    constructor(coordSys){
        this.coordSys=coordSys;
        this.element=document.getElementById('mainShip')
                
        this.gameArea=this.coordSys.area;
        this.xP=0;
        this.yP=20;
        this.speed=9; 

        this.id='player1'
        this.team = 'player';
        this.alive = true;
        this.hp=100;
        
        
    }

    bounds(){
        const W=this.gameArea.clientWidth;
        const H=this.gameArea.clientHeight;
        const w=this.element.clientWidth;
        const h=this.element.clientHeight;
        const minX= -W/2+w/2;
        const maxX= W/2-w/2;
        const minY=0;
        const maxY=H-h;

        this.xP = Math.min(Math.max(this.xP,minX), maxX);
        this.yP = Math.min(Math.max(this.yP,minY), maxY);
    }
        
    render()
        {
            this.coordSys.toStage(this.xP,this.yP,this.element,'center-bottom')
        }

        moveLeft()
        {
            this.xP-=this.speed;
            this.render();
            this.bounds();
        }

        moveRight()
        {
            this.xP+=this.speed
            this.render();
            this.bounds();
        }
        moveAhead()
        {
            this.yP+=this.speed;
            this.render();
            this.bounds();
        }
        moveBackward()
        {
            this.yP-=this.speed;
            this.render();
            this.bounds();
        }
   
       
    }

const playerShip=new PanelPlayer(coordSys);

document.addEventListener('keydown',(event)=>{
    if(event.key==='ArrowLeft'){playerShip.moveLeft()};
    if(event.key==='ArrowRight'){playerShip.moveRight()};
    if(event.key==='ArrowUp'){playerShip.moveAhead()};
    if(event.key==='ArrowDown'){playerShip.moveBackward()};
})





class playerBullet{
    constructor(coordSys){
        this.coordSys=coordSys;
        this.bulletContainer=coordSys.area;
        this.bullets=[];
        }
        createBulletElement(){
            const bullet=document.createElement("div");
             Object.assign(bullet.style, {
                    position: 'absolute',
                    width: '2px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    backgroundImage: "url('assets/player_bullet.png')",
                    zIndex: '3',
                  });

            this.bulletContainer.appendChild(bullet);
            return bullet;
        }

        

        biuBiu(player,vy=600){
            const startX=player.xP;
            const startY=player.yP+player.element.clientHeight;

            const element=this.createBulletElement();
            element.style.backgroundImage="url('assets/player_bullet.png')"
            const b={
                  id: `pb-${BULLET_ID++}`,
                  team: 'player',
                  ownerId: player.id,
                  damage: 1,
                  alive: true,
                  x: startX,
                  y: startY,
                  vx: 0,
                  vy: vy,
                  element,
                      };

            this.bullets.push(b);
        }

        updateAll(dt){
            for(let i=this.bullets.length-1;i>=0;i--)
                {
                    const b=this.bullets[i];
                    if(!b.alive)continue;
                    b.y+=b.vy*dt;
                    b.x+=b.vx*dt;
                    this.coordSys.toStage(b.x,b.y,b.element,'center-bottom');
                    if(b.y>this.bulletContainer.clientHeight+50)
                        {
                            b.alive=false;
                            b.element.remove();
                            this.bullets.splice(i,1);
                        }
                }         
         }
    }


const bulletOfPlayer=new playerBullet(coordSys);
    
    document.addEventListener('keydown',(event)=>{
    if(event.code==='Space')
        {
            bulletOfPlayer.biuBiu(playerShip)
        };
    
})



