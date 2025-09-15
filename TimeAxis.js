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

            console.log("nowGame=",this.nowGame);

            bulletOfPlayer.updateAll(deltaGametime);
        }
    }
        

        start()
        {
            if(this.checkRunning===true){return};
            this.checkRunning=true;
            this.lastTs=0;
            this.rAF=requestAnimationFrame(this.gameLoop);
            console.log(this.lastTs);
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