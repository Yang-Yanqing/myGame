const gameArea=document.getElementById('gameArea');
const coordSys=new CoordSys(gameArea);
let gameClock=new TimeAxis(1);
let score=0
const weaponScoreTrigger = 50;
let nextWeaponAt = weaponScoreTrigger;
let weaponTrigger = false;
let weaponActive=false;
let weaponExpireAt=0
setWeaponVisible(false);
const weaponMilestones=new Set(); 


function endGame()
 {
   if(typeof gameClock !== 'undefined') gameClock.pause();//清空时间
   
   if(typeof bulletOfPlayer !== 'undefined' && bulletOfPlayer.bullets) {
    for (const b of bulletOfPlayer.bullets) { b.alive = false; b.element.remove(); }
    bulletOfPlayer.bullets.length = 0;
  }//清空玩家子弹
  
  if(typeof bulletOfEnemy !== 'undefined' && bulletOfEnemy.bullets) {
    for (const b of bulletOfEnemy.bullets) { b.alive = false; b.element.remove(); }
    bulletOfEnemy.bullets.length = 0;
  }//清空敌军子弹

  if(typeof enemys !== 'undefined') {
    for(const e of enemys) { e.alive = false; e.element?.remove(); }
    enemys.length = 0;
  }//清空小怪

  if (typeof bosses !== 'undefined') {
    for (const bo of bosses) { bo.alive = false; bo.element?.remove(); }
    bosses.length = 0;
  }//清空BOSS

   const gameScreen=document.getElementById('gameScreen');
   const gameOverScreen=document.getElementById('gameOverScreen');
   if(gameScreen)gameScreen.style.display='none';
   if(gameOverScreen)gameOverScreen.style.display='grid';
  }

  
  function refreshHp()
  {
    const hpEl=document.getElementById('hpNum')
    const hpFillEl=document.querySelector('.hpFill')
    if(!hpEl||!hpFillEl)return;
    hpEl.textContent=String(playerShip.hp);
    const persenTage=Math.max(0,Math.min(100,(playerShip.hp/100)*100))
    hpFillEl.style.width=persenTage+'%'
  }


  function updateScore(){
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.textContent = String(score).padStart(6,'0');

    while( score >= nextWeaponAt)
      {
        showWeaponForGameTime(3);
        nextWeaponAt+=weaponScoreTrigger;
      }
  }


  function setWeaponVisible(show=false){
    const elementWeapon=document.getElementById('weapon');
    if(elementWeapon){
      if(show){elementWeapon.style.display='block'}
      else{elementWeapon.style.display='none'}
    }
  }

  function showWeaponForGameTime(duration=3){
    weaponExpireAt = gameClock.nowGame+duration;
    weaponActive = true;
    setWeaponVisible(true);
  }

    function updateWeaponState(nowGame){
      if (weaponActive && nowGame >= weaponExpireAt){
        weaponActive=false;
        setWeaponVisible(false);
      }
    }


  