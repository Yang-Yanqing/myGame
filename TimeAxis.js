class TimeAxis{
    
    constructor(scale){
        this.scale=scale;
        this.nowReal=0;
        this.nowGame=0;
        this.checkRunning=false;
        this.lastTs=0;
        this.rAF=0;
        this.maxRealDt=0.05;
         

         // ==The heart of this game==//
        //==========================//
        this.gameLoop = (ts) => {
            if (this.checkRunning===false){
                return
            };     

            if(this.lastTs===0){
                this.lastTs=ts;
                this.rAF=requestAnimationFrame(this.gameLoop);
                return;
            }

            const deltaRealtime = Math.min((ts-this.lastTs)/1000,this.maxRealDt);//avoid frame drops//
            this.lastTs=ts;
            const deltaGametime =deltaRealtime*this.scale;
            this.nowReal+=deltaRealtime;
            this.nowGame+=deltaGametime;
            this.rAF=requestAnimationFrame(this.gameLoop);

            if (DEBUG_FPS_LOG && (Math.floor(this.nowReal) !== Math.floor(this.nowReal - deltaRealtime))) {
             console.log('nowGame=', this.nowGame.toFixed(2));  }
            
            bulletOfEnemy.updateAll(deltaGametime);//小怪子弹
            resolveBulletPlayerHits();//玩家受击
            
            updateEnemyShooting(this.nowGame,3); //怪攻击
            updateBossSpawner(this.nowGame);//刷Boss
            for (const boss of bosses) {boss.updateBoss(deltaGametime, this.nowGame);} //刷Boss

            bulletOfPlayer.updateAll(deltaGametime);//玩家子弹
            resolveBulletBossHits();//Boss受击
            
            enemySpawner.update(deltaGametime, this.nowGame);
            resolveBulletEnemyHits();//小怪受击 
            
            updateWeaponState(this.nowGame);//weapon道具
        }
    }
        

        start()
        {
            if(this.checkRunning===true){return};
            this.checkRunning=true;
            this.lastTs=0;
            this.rAF=requestAnimationFrame(this.gameLoop);
             }
        
        pause()
        {
            if(this.checkRunning===false){return}
            this.checkRunning=false;
            cancelAnimationFrame(this.rAF);
            this.lastTs=0;
            this.rAF=0;   
        }

        restart()
        {
            this.pause();
            this.nowReal=0;
            this.nowGame=0;
            this.start();
        }
        
        // ==Innovation point: Design a time currency that allows us to take full control of our time.==//
        setScale(scaleNum)
        {
            if(!(Number(scaleNum)>0)){
                this.scale=1;
            }
            else{
                this.scale=Number(scaleNum)
            }
        }
          
}