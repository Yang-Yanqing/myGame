let ENEMY_ID = 1;
let BULLET_ID = 1;


const DEBUG_FPS_LOG = false;


class Start{
    constructor(){
        this.languageBtn=document.getElementById('languageBtn');
        this.startBtn=document.getElementById('startBtn');
        this.topupBtn=document.getElementById('topupBtn');
        this.adminBtn=document.getElementById('adminBtn');
        this.startScreen=document.getElementById('startScreen');
        this.gameScreen=document.getElementById('gameScreen');
        
        this.difficulty=document.getElementById('diffSelect')

       

        this.startBtn.addEventListener('click',()=>{
                        
                         enemySpawner.initialized = false;
                         enemySpawner.lastWaveAt = 0;
                         lastBossAt = 0;

                        const difficulty = this.difficulty.value;
                        let scale;
                        if (difficulty === 'easy'){ scale = 0.5}
                        else if (difficulty === 'normal'){ scale = 0.8 }
                        else if (difficulty === 'hard'){ scale = 1.5 }
                        gameClock.pause();          // 停干净
                        gameClock.setScale(scale);  // 改倍率
                        

                        gameClock.restart();

                        this.startScreen.style.display='none';
                        this.gameScreen.style.display='block';
                        setTimeout(() => playerShip.render(), 50);

                        playerShip.alive=true;
                        playerShip.hp=100;
                        refreshHp();

                        score=0;
                        nextWeaponAt= weaponScoreTrigger; 
                        updateScore();

  
                         weaponActive=false;
                         weaponExpireAt=0;
                         setWeaponVisible(false);
                        //  weaponMilestones.clear();
                        })

    }

}

const gameStart=new Start();

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
      if (bullet.alive === false) return;
      if (bullet.ownerId === ship.id) return;                         // 排除自伤
      if (!allowFriendlyFire && bullet.team === ship.team) return;    // 排除友伤
      if (isColliding(ship.element, bullet.element, includeTouch)) {
        hits.push({ shipId: ship.id, bulletId: bullet.id });
      }
    });
  });
  return hits;
}


function resolveBulletPlayerHits() {
  const hits = checkHits([playerShip], bulletOfEnemy.bullets, /* allowFriendlyFire */ false, /* includeTouch */ true);

  if (hits.length === 0) return;

  // 把命中的 id 收集起来，避免在循环中反复 splice 干扰
  let totalDamage=0
  const deadBulletIds=new Set();

  for (const {bulletId} of hits) {
    const b=bulletOfEnemy.bullets.find(x=>x.id===bulletId&&x.alive);
    if(!b)continue;
    totalDamage+=(b.damage??1);
    deadBulletIds.add(b.id);
  }

  // 敌人：标记 + 删 DOM + 过滤数组
  for (const b of bulletOfEnemy.bullets) {
    if (deadBulletIds.has(b.id) && b.alive) {
      b.alive = false;
      b.element.remove();
    }
  }
  for (let i = bulletOfEnemy.bullets.length - 1; i >= 0; i--) {
    if (!bulletOfEnemy.bullets[i].alive) bulletOfEnemy.bullets.splice(i, 1);
  }

  // 子弹：标记 inalive，具体清理交给 updateAll 
  for (const b of bulletOfPlayer.bullets) {
    if (deadBulletIds.has(b.id) && b.alive) {
      b.alive = false;
      b.element.remove();
    }
  }

  //扣血
  playerShip.hp=Math.max(0,playerShip.hp-totalDamage);
  refreshHp();


  //玩家判定死亡
  if(playerShip.hp<=0&&playerShip.alive!==false){
    playerShip.alive=false;
    endGame()
  }
 
}

function resolveBulletEnemyHits() {
  const hits = checkHits(enemys, bulletOfPlayer.bullets, /* allowFriendlyFire */ false, /* includeTouch */ true);

  if (hits.length === 0) return;

  // 把命中的 id 收集起来，避免在循环中反复 splice 干扰
  const deadEnemyIds=new Set();
  const deadBulletIds=new Set();

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
      score += 5;
      updateScore();
    }
  }
  for (let i = enemys.length - 1; i >= 0; i--) {
    if (!enemys[i].alive) enemys.splice(i, 1);
  }

  // 子弹：标记 inalive，具体清理交给 updateAll 
  for (const b of bulletOfPlayer.bullets) {
    if (deadBulletIds.has(b.id) && b.alive) {
      b.alive = false;
      b.element.remove();
    }
  }
  for (let i = bulletOfPlayer.bullets.length - 1; i >= 0; i--) {
    if (!bulletOfPlayer.bullets[i].alive) bulletOfPlayer.bullets.splice(i, 1);
  }
}


function resolveBulletBossHits() {
  const hits = checkHits(bosses, bulletOfPlayer.bullets, /* allowFriendlyFire */ false, /* includeTouch */ true);

  if (hits.length === 0) return;

  // 把命中的 id 收集起来，避免在循环中反复 splice 干扰
  const damageByBoss=new Map()
  const deadBulletIds=new Set();

  for (const {shipId,bulletId} of hits) {
    const b=bulletOfPlayer.bullets.find(x=>x.id===bulletId&&x.alive);
    if(!b)continue;
    const dmg = (b.damage??1);
    damageByBoss.set(shipId,(damageByBoss.get(shipId)??0)+dmg);
    deadBulletIds.add(b.id);
  }

  for (let i = bulletOfPlayer.bullets.length - 1; i >= 0; i--) {
    const b = bulletOfPlayer.bullets[i];
    if(deadBulletIds.has(b.id) && b.alive) {
      b.alive = false;
      b.element.remove();
      bulletOfPlayer.bullets.splice(i,1);
    }
  }

  //按照BossID扣血，因为不止一个Boss
  for(const[bossId,dmgSum] of damageByBoss.entries())
    {
      const boss=bosses.find(x=>x.id===bossId&&x.alive)//I found you
      if(!boss) continue;
      // boss.hp=Math.max(0,boss.hp-dmgSum);
      // if(boss.hp===0&&boss.alive===true)boss.destroy();    
      boss.takeDamage(dmgSum);
  }
}





class GameOver{
    constructor()
    {
      this.restartBtn=document.getElementById('goRestart');
      this.gameOverScreen=document.getElementById('gameOverScreen');
      this.startScreen=document.getElementById('startScreen');
     
      this.restartBtn.addEventListener('click',()=>{
        if(this.gameOverScreen)this.gameOverScreen.style.display='none';
        if(this.startScreen)this.startScreen.style.display='block';
      })
    }
  }

  const gameOver=new GameOver();