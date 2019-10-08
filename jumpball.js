var canvas,
ctx,
ALTURA, 
LARGURA, 
maxPulos = 3, 
velocidade = 6, 
estadoAtual, 
record,

estados = {
	jogar: 0,
	jogando: 1,
	perdeu: 2
},
chao = {
	y: 550,
	x: 0,
	altura: 50,

	atualiza: function(){
		this.x -= velocidade;
		if(this.x < -30){
			this.x = 0;
		}
	},

	desenha: function(){
		spriteChao.desenha(this.x, this.y);
		spriteChao.desenha(this.x + spriteChao.largura, this.y);
	}
},

bloco = {
	x: 50,
	y: 0,
	altura: spriteBoneco.altura,
	largura: spriteBoneco.largura,	
	gravidade: 1.5,
	velocidade: 0,	
	forcaDoPulo: 24,
	qtdPulos: 0,
	score: 0,
	rotacao: 0,

	atualiza: function(){
		this.velocidade += this.gravidade;
		this.y += this.velocidade;
		this.rotacao += Math.PI / 180 * velocidade;
		
		if(this.y > chao.y - this.altura && estadoAtual != estados.perdeu){
			this.y = chao.y - this.altura;
			this.qtdPulos = 0;
			this.velocidade = 0;
		}
		
		if(estadoAtual == estados.perdeu)
			this.pula();
	},
	pula: function(){
		if(this.qtdPulos < maxPulos){
			this.velocidade = -this.forcaDoPulo;	
			this.qtdPulos++;			
		}			
	},
	reset: function(){
		this.y = 0;
		this.velocidade = 0;
		
		if(this.score > record){
			localStorage.setItem("record", this.score);
			record = this.store;
		}
		this.score = 0;
	},
	desenha: function(){	
		//operacoes para rotacionar o boneco
		ctx.save();
		ctx.translate(this.x + this.largura / 2, this.y + this.altura / 2);
		ctx.rotate(this.rotacao);
		spriteBoneco.desenha(-this.largura / 2, -this.altura / 2);
		ctx.restore();		
	}
},

obstaculos = {
	_obs: [],
	_cores: ["#ffbc1c","#ff1c1c","#ff85e1","#52a7ff","#78ff5d"],
	tempoInsere: 0,
	insere: function(){
		this._obs.push({
			x: LARGURA,
			//largura: 30 + Math.floor(21 * Math.random()),
			largura: 50,
			altura: 30 + Math.floor(120 * Math.random()),
			cor: this._cores[Math.floor(5 * Math.random())]
		});	
		this.tempoInsere = 40 + Math.floor(21 * Math.random());
	},
	atualiza: function(){
		if(this.tempoInsere == 0)
			this.insere();
		else
			this.tempoInsere--;
		for(var i = 0, tam = this._obs.length; i < tam; i++){
			var obs = this._obs[i];
			obs.x -= velocidade;
			
			if(bloco.x < obs.x + obs.largura && bloco.x + bloco.largura >= obs.x &&
				bloco.y + bloco.altura >= chao.y - obs.altura)
				estadoAtual = estados.perdeu;
			else
				if(obs.x == 0)
					bloco.score++;
				else
					if(obs.x <= -obs.largura){
						this._obs.splice(i, 1);
						tam--;
						i--;
					}
		}
	},
	limpa: function(){
		this._obs = [];
	},
	desenha: function(){
		for(var i = 0, tam = this._obs.length; i < tam; i++){
			var obs = this._obs[i];
			ctx.fillStyle = obs.cor;
			ctx.fillRect(obs.x, chao.y - obs.altura, obs.largura, obs.altura);
		}			
	},
};

window.onload = function(){
	main();
}

function main(){
	ALTURA = window.innerHeight;
	LARGURA = window.innerWidth;
	
	if(LARGURA >= 500)
		LARGURA = ALTURA = 600;
	
	canvas = document.createElement("canvas");
	canvas.width = LARGURA;
	canvas.height = ALTURA;
	canvas.style.border = "1px solid #000";	
	
	ctx = canvas.getContext("2d");	
	document.body.appendChild(canvas);	
	
	document.addEventListener("mousedown", clique);
	
	estadoAtual = estados.jogar;	
	
	roda();
}

function roda(){
	record = localStorage.getItem("record");
	
	if(record == null)
		record = 0;

	atualiza();
	desenha();	
	window.requestAnimationFrame(roda);
}

function clique(e){
	if(estadoAtual == estados.jogando)
		bloco.pula();
	else
		if(estadoAtual == estados.jogar){
			estadoAtual = estados.jogando;
		}
		else
			if(bloco.y >= 2 * ALTURA){
				estadoAtual = estados.jogar;
				bloco.reset();
				obstaculos.limpa();						
		}
			
}

function atualiza(){
	if(estadoAtual == estados.jogando)
		obstaculos.atualiza();

	bloco.atualiza();
	chao.atualiza();
}

function desenha(){
	bg.desenha(0,0);

	ctx.fillStyle = "#000";
	ctx.font = "50px Arial";

	if(bloco.score < 10)
		ctx.fillText(bloco.score, 110, 138);
	else 
		if (bloco.score >= 10 && bloco.score < 100) 
			ctx.fillText(bloco.score, 95, 138);
		else
			ctx.fillText(bloco.score, 75, 138);

	ctx.fillText(maxPulos - bloco.qtdPulos, 473, 182);
	
	if(estadoAtual == estados.jogando)
		obstaculos.desenha();

	chao.desenha();	
	bloco.desenha();			

	if(estadoAtual == estados.jogar)
		jogar.desenha(LARGURA / 2 - jogar.largura / 2, ALTURA / 2 - jogar.altura / 2);
	
	if(estadoAtual == estados.perdeu){
		perdeu.desenha(LARGURA / 2 - perdeu.largura / 2, ALTURA / 2 - perdeu.altura / 2 - spriteRecord.altura / 2);
		
		spriteRecord.desenha(LARGURA / 2 - spriteRecord.largura / 2, ALTURA / 2 - spriteRecord.altura / 2 + perdeu.altura / 2 - 23);
	
		ctx.fillStyle = "#000";
		ctx.fillText(bloco.score, 375, 390);
		
		if(bloco.score > record){
			novo.desenha(LARGURA / 2 - 180, ALTURA / 2 + 30);
			ctx.fillText(bloco.score, 415, 475);
		}
		else
			ctx.fillText(record, 415, 475);	
	}

}