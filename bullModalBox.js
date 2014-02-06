/**
 * @alias bullModalBox Implement Mask
 * @author Felipe Pupo Rodrigues
 * @classDescription classe modal box
 */
 
 var bullModalBox = new Class({
 	Implements: Options,
 	options:{
 		placeholder: null,
 		hideScroll:true,
 		modalboardElement:'div',
 		modalboardElementClass:'bull-modalboard',
 		modalboxElement:'div',
 		modalboxElementClass:'bull-modalbox',
 		closemodalElement:'a',
 		closemodalElementClass:'bull-modalclose',
 		errorMessage:'Error to load content.',
 		clickOutClose:true,
 		ajaxOptions:{
 			method:'get'
 		},
 		writeIntercept:function(){},
 		hideIntercept:function(){},
 		openIntercept:function(){},
 		showIntercept:function(){},
 		updateIntercept:function(){}
 	},
 	
 	/**
	 * atualiza options
	 */
 	initialize:function(options){
 		this.setOptions(options);
 		
 		if(!this.options.placeholder){
 			this.options.placeholder = document.body;
 		}else if(this.options.placeholder.getStyle('position') != 'absolute'){
 			this.options.placeholder.setStyle('position','relative');
 		}
 			
 		this.makePlaceboard();
 		this.makeModalbox();
	 },
	 
	 /**
	 * cria elemento placeboard
	 */
	 makePlaceboard: function(){
	 	this.placeboard = new Element(this.options.modalboardElement,{
 			'class'	:this.options.modalboardElementClass,
 			'styles':{
 				'position'	:'absolute',
 				'top'		:'0px',
 				'left'		:'0px',
 				'opacity'	:'0',
 				'display'	:'none'
 			},
 			'tween':{
 				duration: 'long'
 			}
		}).inject(this.options.placeholder);
		
		if(this.options.clickOutClose)
			this.placeboard.addEvent('click',this.hideBoard.bind(this));
			
		if(this.options.placeholder === document.body)
			window.addEvent('resize',function(){
				this.options.placeholder.store('placeHolderSize')
				this.updateBoard.call(this);
			}.bind(this));
	 },
	 
	 /**
	 * cria elemento modalbox
	 */
	 makeModalbox:function(){
	 	this.modalbox = new Element(this.options.modalboxElement,{
 			'class'	:this.options.modalboxElementClass,
 			'styles':{
 				'position'	:'absolute',
 				'top'		:'50%',
 				'left'		:'50%',
 				'opacity'	:'0',
 				'display'	:'none'
 			},
 			'tween':{
 				duration: 'long'
 			}
		}).inject(this.options.placeholder);
	 },
	 
	 /**
	 * abre um conteudo ajax dentro do modal
	 */
	 open:function(url,options){
	 	var settings = this.options;
	 	$extend(settings,options);
	 	this.showBoard();
 	 	var request = new Request($extend({
	        url:url,
	        onSuccess: function(t,x){
	            this.updateContent(t);
	        }.bind(this),
	        onFailure: function(t){
	            this.updateContent(t);
	        }.bind(this,[this.options.errorMessage])
	     },settings.ajaxOptions));	        
	    request.send(); 	
 	 },
 	 
 	 /**
	 * escreve um conteudo texto ou html dentro do modal
	 */
 	 write:function(content){
 	 	this.options.writeIntercept.call(this);
 	 	this.showBoard();
 	 	this.updateContent(content);
 	 },
 	 
 	 /**
	 * atualiza conteudo do modal
	 */
	 updateContent:function(content){	
	 	var actsize			= {width:false,height:false};
	 	
	 	if($(content)){
	 		actsize			= $(content).getStyles('width','height');
	 		actsize.width 	= actsize.width.toInt();
	 		actsize.height 	= actsize.height.toInt();
	 		content 		= $(content).get('html');
	 	}
	 	
	 	this.modalbox.set('html',content);
	 	
	 	this.modalbox.setStyles({
	 		'width'		:'',
	 		'height'	:'',
	 		'display'	:'block'
 		});

	 	var ctsize 		= this.modalbox.getSize();
	 	ctsize.y		= (actsize.height && actsize.height!=NaN)?actsize.height:ctsize.y;
	 	ctsize.x		= (actsize.width && actsize.width!=NaN)?actsize.width:ctsize.x;
	 	var scposition 	= this.options.placeholder.getScroll();

	 	this.modalbox.setStyles({
	 		'width'		:(actsize.width && actsize.width!=NaN)?actsize.width:'',
	 		'height'	:(actsize.height && actsize.height!=NaN)?actsize.height:'',
	 		'display'	:'none',
	 		'margin'	:(scposition.y-(ctsize.y/2))+'px 0 0 '+(scposition.x-(ctsize.x/2))+'px',
	 		'overflow'	:'hidden'
 		});
 		
 		this.modalbox.getElements(this.options.closemodalElement+'.'+this.options.closemodalElementClass).addEvent('click',this.hideBoard.bind(this))
 		this.options.updateIntercept.call(this);
 		
 		this.showModalEffect();
 	},
 	
 	/**
	 * mostra o placeboard
	 */
 	showBoard:function(){
 		if(this.options.hideScroll){
	 		$(this.options.placeholder).store('scroll',this.options.placeholder.getStyles('overflow-y','overflow-x','overflow'));
	 		$(this.options.placeholder).setStyle('overflow','hidden');
	 	}else{
	 		(this.options.placeholder === document.body ? window : this.options.placeholder).addEvent('scroll',function(e){
			    if(!this.modalbox.retrieve('oppened')) return;
			    
	 			var ctsize 		= this.modalbox.getStyles('width','height');
	 			ctsize.width	= ctsize.width.toInt();
	 			ctsize.height	= ctsize.height.toInt();
			 	var scposition 	= this.options.placeholder.getScroll();

				clearTimeout(this.modalbox.scrollUpdate);
				
				this.modalbox.scrollUpdate = setTimeout(function(){
			 		this.modalbox.get('tween',{
			 			onComplete: function(){}	
			 		}).start('margin',(scposition.y-(ctsize.height/2))+'px 0 0 '+(scposition.x-(ctsize.width/2))+'px');
		 		}.bind(this),50);
			 	
			}.bind(this))
	 	}
	 	
	 	this.updateBoard();
 		
 		this.showBoardEffect();
 	},
 	/**
	 * atualiza o tamanho do placeboard
	 */
 	updateBoard:function(){
 		this.placeboard.setStyle('display','none');
 		
 		var scstylesize = $(this.options.placeholder).getSize();
	 	var scsize 		= $(this.options.placeholder).getScrollSize();
	 	
	 	//ie bug
	 	scsize.y		= (scsize.y<scstylesize.y)?scstylesize.y:scsize.y;
	 	scsize.x		= (scsize.x<scstylesize.x)?scstylesize.x:scsize.x;
	 	
	 	this.placeboard.setStyles({
	 		'width'		:scsize.x,
 			'height'	:scsize.y
 		});
 		
 		this.placeboard.setStyle('display','block');
 	},
 	/**
	 * esconde o place board
	 */
 	hideBoard:function(){
 		this.hideModalEffect();
 		this.hideBoardEffect(function(){
 			this.options.placeholder.setStyles(this.options.placeholder.retrieve('scroll'));
 			this.options.hideIntercept.call(this);
 		});
 	},
 	
 	
 	/*--------------------------------------------------------------------------------------
 	 * Efeitos
 	 * Nota: Ao estender o efeito temos que chamar algumas funcoes e manter alguns passos.
 	 */
 	showBoardEffect:function(fn){
 		this.placeboard.setStyle('display','block');
 		this.placeboard.get('tween',{
 			onComplete: function(){
 				if(fn) fn.call(this);
 			}.bind(this,[fn])	
 		}).start('opacity',0.8);
 	},
 	hideBoardEffect:function(fn){
 		this.placeboard.get('tween',{
 			onComplete: function(fn){
 				this.placeboard.setStyle('display','none');
 				if(fn) fn.call(this);
 			}.bind(this,[fn])
 		}).start('opacity',0);
 	},
 	showModalEffect:function(fn){
 		this.modalbox.store('oppened',true);
 		this.modalbox.setStyles({
			'overflow'	:'auto',
			'display'	:'block'
		});
 		this.modalbox.get('tween',{
 			onComplete: function(){
 				if(fn) fn.call(this);
 			}.bind(this,[fn])	
 		}).start('opacity',1);
 	},
 	hideModalEffect:function(fn){
 		this.modalbox.store('oppened',false);
 		this.modalbox.setStyles({
 			'overflow'	:'hidden'
 		});
 		this.modalbox.get('tween',{
 			onComplete: function(e){
 				this.modalbox.setStyle('display','none');
 				if(fn) fn.call(this);
 			}.bind(this,[fn])	
 		}).start('opacity',0);
 	}
 });