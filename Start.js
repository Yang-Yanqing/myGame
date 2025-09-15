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