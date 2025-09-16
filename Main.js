let ENEMY_ID = 1;
let BULLET_ID = 1;
const DEBUG_FPS_LOG = false;
const coordSys=new CoordSys(gameArea);
const gameClock=new TimeAxis(1);

class Start{
    constructor(){
        this.languageBtn=document.getElementById('languageBtn');
        this.startBtn=document.getElementById('startBtn');
        this.topupBtn=document.getElementById('topupBtn');
        this.adminBtn=document.getElementById('adminBtn');
        this.startScreen=document.getElementById('startScreen');
        this.gameScreen=document.getElementById('gameScreen');

        this.startBtn.addEventListener('click',()=>{
            this.startScreen.style.display='none';
            this.gameScreen.style.display='block';
            setTimeout(()=>playerShip.render(),50);
        })

    }

}

const gameStart=new Start;

//碰撞检测

function isColliding(element1,element2,includeTouch=true)
{
const r1=element1.getBoundingClientRect();
const r2=element2.getBoundingClientRect();

if(includeTouch===true){
    return !(
        r1.right<= r2.left||
        r1.left>=r2.right||
        r1.bottom<=r2.top||
        r1.top>=r2.bottom)
}else{
    return !(
      r1.right<r2.left ||
      r1.left>r2.right ||
      r1.bottom<r2.top ||
      r1.top>r2.bottom
    )
}
}

function checkHits(ships, bullets, allowFriendlyFire = false, includeTouch = true) {
  const hits = [];
  ships.forEach(ship => {
    if (ship.alive === false) return;
    bullets.forEach(bullet => {
      if (bullet.active === false) return;
      if (bullet.ownerId === ship.id) return;                         // 排除自伤
      if (!allowFriendlyFire && bullet.team === ship.team) return;    // 排除友伤
      if (isColliding(ship.element, bullet.element, includeTouch)) {
        hits.push({ shipId: ship.id, bulletId: bullet.id });
      }
    });
  });
  return hits;
}


function resolveBulletEnemyHits() {
  const hits = checkHits(enemys, bulletOfPlayer.bullets, /* allowFriendlyFire */ false, /* includeTouch */ true);

  if (hits.length === 0) return;

  // 把命中的 id 收集起来，避免在循环中反复 splice 干扰
  const deadEnemyIds = new Set();
  const deadBulletIds = new Set();

  for (const { shipId, bulletId } of hits) {
    deadBulletIds.add(bulletId);
    const e = enemys.find(x => x.id === shipId);
     if (e && e.alive) {
    deadEnemyIds.add(shipId);
     }
  }

  // 敌人：标记 + 删 DOM + 过滤数组
  for (const e of enemys) {
    if (deadEnemyIds.has(e.id) && e.alive) {
      e.alive = false;
      e.element.remove();
    }
  }
  for (let i = enemys.length - 1; i >= 0; i--) {
    if (!enemys[i].alive) enemys.splice(i, 1);
  }

  // 子弹：标记 inactive，具体清理交给 updateAll 
  for (const b of bulletOfPlayer.bullets) {
    if (deadBulletIds.has(b.id) && b.active) {
      b.active = false;
      b.element.remove();
    }
  }
  for (let i = bulletOfPlayer.bullets.length - 1; i >= 0; i--) {
    if (!bulletOfPlayer.bullets[i].active) bulletOfPlayer.bullets.splice(i, 1);
  }
}