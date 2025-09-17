const enemys=[];
const bosses=[];
let lastBossAt=0;
let bossGapTime=6;

class Enemy{
      constructor(coordSys){
        this.coordSys=coordSys;     
        this.gameArea=this.coordSys?.area;

        this.xE=0;
        this.yE=0;
        this.w=15;
        this.h=15;
        this.muzzleOffsetY=10;
        
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
   
     getMuzzle(){
        const x = (this.xB ?? this.xE);
        const y = (this.yB ?? this.yE) + this.muzzleOffsetY; // 因为子弹位置问题，新建一个找到中点的函数
        return { x, y };
       }

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
    this.waveInterval=opts.waveInterval??2;
    this.perWave=opts.perWave??2;
    this.lastWaveAt=0;
    this.initialized=false;
}

initFirst(nowGame)
{
if(!this.initialized){
    this.spawnWave();
    this.lastWaveAt=nowGame;
    this.initialized=true;
}
}

update(deltaGametime,nowGame)
{
this.initFirst(nowGame);
if((nowGame-this.lastWaveAt)>this.waveInterval)
    {this.spawnWave();
      this.lastWaveAt=nowGame;
    }
}

spawnWave()
{
    for(let i=0;i<this.perWave;i++){
        new Enemy(this.coordSys);
    }
}

}

const enemySpawner=new EnemySpawner(coordSys, { waveInterval: 3, perWave: 2 });


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

        fireBurst(enemy,count,baseSpeed=320)
        {
            if(!enemy||!enemy.alive)return;
             const {x : startX, y : startY}=enemy.getMuzzle();
             const maxSideSpeed = 150;

            for(let i=0;i<count;i++)
                {
                    const t=(i-(count-1)/2)/((count-1)/2) //让t进行均匀分布
                    const vx=t*maxSideSpeed;          //t给子弹x速度，实际上就是进行分开发射    
                    const vy=-baseSpeed;
                    const element=this.createBulletElement();
                    const b={
                        id:`eb-${BULLET_ID++}`,
                        team: 'enemy',
                        ownerId: enemy.id,
                        damage: 1,
                        alive: true,
                        x: startX,
                        y: startY,
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
            const maxStep = 8;
            const EPS = 0.0001;  //防止浮点误差造成死循环

            for (let i = this.bullets.length - 1; i >= 0; i--) {       //防止穿透，做一个8步长的分步方法
                const b = this.bullets[i];
                if (!b.alive) { this.bullets.splice(i,1); continue; }
                let moveX = b.vx * dt;
                let moveY = b.vy * dt;  //每一个帧的总位移
                
                while(Math.abs(moveX)>EPS||Math.abs(moveY)>EPS){                                  
                let stepX;
                 if(moveX > maxStep){stepX=maxStep}
                 else if(moveX < -maxStep){stepX=-maxStep}
                 else{stepX=moveX}
                
                let stepY;
                if(moveY > maxStep){stepY=maxStep}
                 else if(moveY < -maxStep){stepY=-maxStep}
                 else{stepY=moveY}

                b.x += stepX; b.y += stepY;
                moveX -= stepX; moveY -= stepY;
      }

      this.coordSys.toStage(b.x, b.y, b.element, 'center-bottom');

     
      if (b.y < minY || b.x < minX || b.x > maxX) {
        b.alive = false;
        b.element.remove();
        this.bullets.splice(i, 1);
      }
    }
  }
}       

const bulletOfEnemy = new enemyBullet(coordSys);

// Every 2 units of game time generate a new batch of bullets=============
function updateEnemyShooting(nowGame,NumOfbullet){       //不断打时间记号，不断开火
  for (const e of enemys) {
    if (!e.alive) continue;
    if (e.nextShotAt === undefined) {
      e.nextShotAt = nowGame + (e.shotInterval || 2);
    }
    if (nowGame >= e.nextShotAt) {
      bulletOfEnemy.fireBurst(e, NumOfbullet);             
      e.nextShotAt += (e.shotInterval || 2);     
    }
  }
}



class Boss{
      constructor(coordSys){
        this.coordSys=coordSys;     
        this.gameArea=this.coordSys?.area;
        

        // this.xB=0;
        // this.yB=0;
        // this.w=50;
        // this.h=35;
        
        this.id=`boss-${ENEMY_ID++}`;
        this.team=`enemy`;
        this.alive=true;
        this.isBoss=true;
        this.hp=10;

        this.element=document.createElement("div");
        this.element.className = 'enemy'; 
        this.element.classList.add('boss');        
        // this.element=this.enemy;

        this.xE=this.xB
        this.yE=this.yB
        this.muzzleOffsetY=28;

        

 
        Object.assign(this.element.style,{
            position: 'absolute',
            width:'96px',
            height:'96px',
            borderRadius:'3px',
            backgroundRepeat:'no-repeat',
            backgroundSize:'contain',
            backgroundImage:"url('assets/boss.png')" ,

            // backgroundColor:'#ffa',
            // outline:'2px solid #0ff',
            // zIndex:'5',
    }); 
    
    this.gameArea.appendChild(this.element);
    this.hpBar=document.createElement('div')
    this.hpBar.className='bossHp';
    this.hpFill=document.createElement('div');
    this.hpFill.className='bossHpFill'
    this.hpBar.appendChild(this.hpFill);
    this.element.appendChild(this.hpBar);
    this.updateHpBar();
        
        this.w=this.element.clientWidth||96;
        this.h=this.element.clientHeight||96;

        const W=this.gameArea.clientWidth;
        const H=this.gameArea.clientHeight;
        
        const minX= -W/2+this.w/2;
        const maxX= W/2-this.w/2;
        // const minY=0;
        // const maxY=H-h;

        // this.xP = Math.min(Math.max(this.xP,minX), maxX);
        // this.yP = Math.min(Math.max(this.yP,minY), maxY);
       this.minX=minX;
       this.maxX=maxX;
       this.xB=this.rand(this.minX,this.maxX);
       this.yB=H+this.h

       this.state='enter';
       this.enterDuration=0.6;
       this.vyEnter=-30;
       this.vySpeed=-110;
       this.t=0

       this.shotInterval=1.2
       this.nextShotAt=undefined

       this.render();
       bosses.push(this);         
    }
    
    rand(a,b){return a+Math.random()*(b-a);}

    render()
        {
            this.coordSys.toStage(this.xB,this.yB,this.element,'center-bottom')
            this.xE=this.xB
            this.yE=this.yB

        }

     getMuzzle(){
        const x = (this.xB ?? this.xE);
        const y = (this.yB ?? this.yE) + this.muzzleOffsetY; // 因为子弹位置问题，新建一个找到中点的函数
        return { x, y };
       }
       
       updateHpBar(){
        const persenTage=Math.max(0,Math.min(100,(this.hp/10)*100));
        this.hpFill.style.width=persenTage+'%';
       }

   updateBoss(dt,nowGame){
          if(!this.alive) return;

          if(this.state==='enter'){
            this.t+=dt;
            this.yB+=this.vyEnter*dt //slowly enter
            if(this.t>=this.enterDuration){this.state='normalFly'}}
            else{this.yB+=this.vySpeed*dt;}
            this.xE=this.xB
            this.yE=this.yB

          this.render()
          
          if(this.yB<-this.h)
            {
              this.destroy();
              return;
            }


          if(this.nextShotAt===undefined)
            {this.nextShotAt=nowGame+this.shotInterval}
          if(nowGame>=this.nextShotAt)
          {
            if(bulletOfEnemy&&bulletOfEnemy.fireBurst){
              bulletOfEnemy.fireBurst(this,12,280);
            }
            this.nextShotAt+=this.shotInterval;
          }
        }

        takeDamage(dmg)
        {
          if(!this.alive)return;
          this.hp=Math.max(0,this.hp-(dmg||0));
          
          if( this.hp <= 0)this.destroy();

        }

        destroy(){
          this.alive=false;
          if(this.element)this.element.remove();
          const j=bosses.indexOf(this);
          if(j>=0)bosses.splice(j,1);
        }         
      }

      function updateBossSpawner(nowGame)
      {
        if(nowGame-lastBossAt>=bossGapTime){
          new Boss(coordSys);
          lastBossAt += bossGapTime;
        }
      }

      