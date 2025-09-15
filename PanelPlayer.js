const gameArea=document.querySelector('.gameArea');
const coordSys=new CoordSys(gameArea);
const gameStartPlay=new Start();
const gameClock=new TimeAxis(1);
gameClock.start();


class PanelPlayer{
    constructor(coordSys){
        this.coordSys=coordSys;
        this.element=document.getElementById('mainShip')
        this.Hp=document.getElementById('hpNum')
        
        this.gameArea=this.coordSys.area;
        this.xP=0;
        this.yP=20;
        this.speed=5           
    }

    bounds(){
        const W=this.gameArea.clientWidth;
        const H=this.gameArea.clientHeight;
        const w=this.element.clientWidth;
        const h=this.element.clientHeight;
        const minX= -W/2+w/2;
        const maxX= W/2 - w/2;
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





class AllBullet{
    constructor(coordSys){
        this.coordSys=coordSys;
        this.bulletContainer=coordSys.area;
       
        this.BulletYellow=this.creatBullet();
        this.BulletRed=this.creatBullet();
        this.BulletGreen=this.creatBullet();
        this.bullets=[];

        this.changeBackground()
    
    }
        creatBullet(){
            const bullet=document.createElement("div");
            bullet.className = 'bullet';  
            bullet.style.position = 'absolute';
            bullet.style.width = '2px';
            bullet.style.height = '5px';
            bullet.style.borderRadius = '3px';
            bullet.style.backgroundRepeat = 'no-repeat';
            bullet.style.backgroundSize = 'contain';
            this.bulletContainer.appendChild(bullet);
            return bullet;
        }

        changeBackground(){
              this.BulletYellow.style.backgroundImage = "url('assets/player_bullet.png')";
              this.BulletRed.style.backgroundImage    = "url('assets/enemy_bullet.png')";
              this.BulletGreen.style.backgroundImage  = "url('assets/player_bullet.png')";
         }


        biuBiu(player,vy=600){
            const startX=player.xP;
            const startY=player.yP+player.element.clientHeight;

            const element=this.creatBullet();
            element.style.backgroundImage="url('assets/player_bullet.png')"
            const bullet={
                 x: startX,
                 y: startY,
                 vy: vy,
                 element: element
            };

            this.bullets.push(bullet);

        }

        updateAll(deltaGametime){
            for(let i=this.bullets.length-1;i>=0;i--)
                {
                    const b=this.bullets[i];
                    b.y+=b.vy*deltaGametime;
                    this.coordSys.toStage(b.x,b.y,b.element,'center-bottom');
                    if(b.y>this.bulletContainer.clientHeight+50){b.element.remove();this.bullets.splice(i,1);}

                }
            
      

        }
    }


    const bulletOfPlayer=new AllBullet(coordSys);
    
    document.addEventListener('keydown',(event)=>{
    if(event.code==='Space'){bulletOfPlayer.biuBiu(playerShip)};
    
})



