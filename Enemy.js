const enemys=[];

class Enemy{
      constructor(coordSys){
        this.coordSys=coordSys;     
        this.gameArea=this.coordSys?.area;

        this.xE=0;
        this.yE=0;
        this.w=15;
        this.h=15;
        
        this.id=`enemy-${ENEMY_ID++}`;
        this.team=`enemy`;
        this.alive=true;
        this.hp=1;

        this.enemy=document.createElement("div");
        this.enemy.className = 'enemy'; 
        this.element = this.enemy;
        this.shotInterval = 2;
        this.nextShotAt=undefined;

        
        // this.element=this.enemy;

        Object.assign(this.enemy.style,{
            position: 'absolute',
            width:'30px',
            height:'30px',
            borderRadius:'3px',
            backgroundRepeat:'no-repeat',
            backgroundSize:'contain',
            backgroundImage:"url('assets/enemy_medium.png')" ,  

            // backgroundColor:'#ffa',
            // outline:'2px solid #0ff',
            // zIndex:'3',
    }); 

    this.gameArea.appendChild(this.enemy);

      requestAnimationFrame(() => {
      this.measureEnemySize();
      this.enemyBounds();
      this.enemyApear();
      enemys.push(this); 
    });
    }
    //   console.log(
    //     '[Enemy] spawn at',{x: this.xE, y: this.yE, w: this.w, h: this.h, 
    //       minX: this.minX, maxX: this.maxX, minY: this.minY, maxY: this.maxY }
    //   );console.log('[Enemy] count', enemys.length, document.querySelectorAll('.enemy').length);
   

     measureEnemySize()
     {
        let w=this.enemy.offsetWidth||this.enemy.clientWidth;
        let h=this.enemy.offsetHeight||this.enemy.clientHeight;

        // console.log('1st get it'+h+w);

        if(!w||!h)
        {
            const cs = getComputedStyle(this.enemy);
            w=parseFloat(cs.width)
            h=parseFloat(cs.height)
            // console.log('2ed get it'+h+w);
        }

        this.w=w||15;
        this.h=h||15;
        // console.log('3rd get it'+h+w);

     }

     enemyBounds(){
        const W=this.gameArea.clientWidth;
        const H=this.gameArea.clientHeight;
       
         
       
         this.minX= -W/2 + this.w/2;
         this.maxX= W/2 - this.w/2;

         const topFraction = 2/3;              
         const zoneBottom = H * (1 - topFraction); 
         const topPadding = 0;      

         this.minY= zoneBottom;
         this.maxY= H - this.h-topPadding;
    }

    clampEnemy(){
        this.xE=Math.min(Math.max(this.xE,this.minX), this.maxX);
        this.yE=Math.min(Math.max(this.yE,this.minY), this.maxY);
    }

    locatEnemy(){
        const bottom=this.yE - this.h/2;
        this.coordSys.toStage(this.xE,this.yE,this.enemy,'center-bottom')
    }

    overlapCheck(other,minDistance=35){
        const dx=this.xE-other.xE;
        const dy=this.yE-other.yE;
        return Math.sqrt(dx*dx+dy*dy)<minDistance;
    }

    enemyApear(){
         const ranDom=(min,max)=>min+Math.random()*(max-min);
         let safe=false;
         let tryTimes=0;
         for(let tryTimes=0;tryTimes<100&&safe===false;tryTimes++){
         this.xE=ranDom(this.minX,this.maxX);
         this.yE=ranDom(this.minY,this.maxY);
         this.clampEnemy();
         safe=enemys.every(e=>!this.overlapCheck(e));
         }

         if(!safe){this.xE=0;this.yE=(this.minY+this.maxY)/2}
         this.locatEnemy();
        //  enemys.push(this);
         }        
         
        }

// for(let i=0;i<=5;i++){
//     new Enemy(coordSys);
// }

// console.log('spawn', this.xE, this.yE, 'boundsY', this.minY, this.maxY);
// console.log('count', enemys.length, document.querySelectorAll('.enemy').length);

// console.log('[Enemy] area node =', this.gameArea);
// console.log('[Enemy] area class/id =', this.gameArea.className, this.gameArea.id);
// console.log('[Enemy] area rect =', this.gameArea.getBoundingClientRect());




class EnemySpawner{
constructor(coordSys,opts={}){
    this.coordSys=coordSys;
    this.waveInterval=opts.waveInterval??3;
    this.perWave=opts.perWave??3;
    this.lastWaveAt=0;
    this.initialized=false;
}

initFist(nowGame)
{
if(!this.initialized){
    this.spawneWave();
    this.lastWaveAt=nowGame;
    this.initialized=true;
}
}

update(deltaGametime,nowGame)
{
this.initFist(nowGame);
if((nowGame-this.lastWaveAt)>this.waveInterval)
    {this.spawneWave();
      this.lastWaveAt=nowGame;
    }
}

spawneWave()
{
    for(let i=0;i<this.perWave;i++){
        new Enemy(this.coordSys);
    }
}

}

const enemySpawner=new EnemySpawner(coordSys, { waveInterval: 3, perWave: 3 });


class enemyBullet{
    constructor(coordSys){
        this.coordSys=coordSys;
        this.bulletContainer=coordSys.area;
        this.bullets=[];
        }

     // Produce bullets=================
        createBulletElement(){
            const bullet=document.createElement("div");
             Object.assign(bullet.style, {
                    position: 'absolute',
                    width: '4px',
                    height: '8px',
                    borderRadius: '3px',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    backgroundImage: "url('assets/enemy_bullet.png')",
                    zIndex: '3',
                  });

            this.bulletContainer.appendChild(bullet);
            return bullet;
        }


    //load the magazine and simultaneously initialize position and velocity

        fireBurst(enemy,count=10,baseSpeed=320)
        {
            if(!enemy||!enemy.alive)return;
            const xB=enemy.xE;
            const yB=enemy.yE-enemy.h*0.2;
            const maxSideSpeed=150;

            for(let i=0;i<count;i++)
                {
                    const t=(i-(count-1)/2)/((count-1)/2)
                    const vx=t*maxSideSpeed;
                    const vy=-baseSpeed;
                    const element=this.createBulletElement();
                    const b={
                        id:`eb-${BULLET_ID++}`,
                        team: 'enemy',
                        ownerId: enemy.id,
                        damage: 1,
                        active: true,
                        x: xB,
                        y: yB,
                        vx, vy,
                        element,
                    }
                    this.bullets.push(b);
                    this.coordSys.toStage(b.x,b.y,b.element,'center-bottom')
                }
                }
    //bullets are propelled by firing physics============
        updateAll(dt)
        {
            const W=this.bulletContainer.clientWidth;
            const H=this.bulletContainer.clientHeight;
            const minX=-W/2-60, maxX=W/2 + 60;
            const minY=-60;

            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const b = this.bullets[i];
                if (!b.active) { this.bullets.splice(i,1); continue; }
                let moveX = b.vx * dt, moveY = b.vy * dt;
                const maxStep = 8;
                 while (Math.abs(moveX) > 0 || Math.abs(moveY) > 0) {
                const stepX = Math.abs(moveX) > maxStep ? Math.sign(moveX) * maxStep : moveX;
                const stepY = Math.abs(moveY) > maxStep ? Math.sign(moveY) * maxStep : moveY;
                b.x += stepX; b.y += stepY;
                moveX -= stepX; moveY -= stepY;
      }

      this.coordSys.toStage(b.x, b.y, b.element, 'center-bottom');

     
      if (b.y < minY || b.x < minX || b.x > maxX) {
        b.active = false;
        b.element.remove();
        this.bullets.splice(i, 1);
      }
    }
  }
}       

const bulletOfEnemy = new enemyBullet(coordSys);

// Every 2 units of game time generate a new batch of bullets=============
function updateEnemyShooting(nowGame){
  for (const e of enemys) {
    if (!e.alive) continue;
    if (e.nextShotAt === undefined) {
      e.nextShotAt = nowGame + (e.shotInterval || 2);
    }
    if (nowGame >= e.nextShotAt) {
      bulletOfEnemy.fireBurst(e, 10);             
      e.nextShotAt += (e.shotInterval || 2);     
    }
  }
}

       