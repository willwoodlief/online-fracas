function Draw2()
{
             //the html5 canvas we are drawing on
   this.canvas  = null;
   //game will control the map
   this.game = null;
   //a click handler will be called with the params id of the country or water, and bool true if left click
   this.clickHandler = null;
   
   //how big the borders for countries will be drawn
   this.borderSize = 3;
   
   //toggle to on if we set borderSize and dont want it automatically calculated
   this.bSetBorderSize = false;
   
   //interface way of settting border size
   this.setBorderSize = function(size) {
      this.borderSize = size;
      this.bSetBorderSize = true;
   }
   
   //the hash which will store all the boundary info for each region
   this.borderLookup = null;
   
   //class for the prepping object
   this.prep = new prepDrawMap();
   
   //mapping for the colors
   this.colours = null;
   
   //size and properties of the canvas shape
   this.startX = 0;
   this.startY = 0;
   this.cellSpacing = 0;
   
   //simply blanks out canvas
   this.drawBlank = function(canvas)
   {
      if (!canvas)
      {
         if (this.canvas)
         {
            canvas = this.canvas;
         }
         else
         {
            throw "canvas not set";
         }
      }
      var ctx = canvas.getContext("2d");
      var canHeight = canvas.height;
        var canWidth = canvas.width;
	ctx.fillStyle = "blue"; 
        ctx.fillRect(0,0,canWidth,canHeight);
   }
   //color needs to be object with rgb fields
   this.changeCountryColor = function(regionID,color)
   {
      if (regionID <0 || regionID >= this.game.map.WATERBODY_START) {throw new RangeError("can only change colors of countries");}
      this.colours[regionID]=color;
      this.drawShapeForCountry(this.canvas, regionID);
   }
   
   this.setGame = function(game)
   {
      this.game= game;
      var teague = this.prep.setupCountryInfo(game.map);
      this.borderLookup = teague;
      this.colours = this.genRandomColours(game.map);
      var w = game.map.setup.width - 1;
	var h =game.map.setup.height - 1;
        var MostMapDim = h > w?h:w;
        var canHeight = this.canvas.height;
        var canWidth = this.canvas.width;
        var lesser = canHeight < canWidth ? canHeight : canWidth;
        var ratio = lesser/MostMapDim;
        var size = Math.floor(ratio);
        if (!this.bSetBorderSize)
        {
         var btr = Math.floor( size/3);
         if (btr<= 0) { btr = 1;}
         this.borderSize = btr;
         this.borderSize =1;//overwrite for now
        }
      
        
         this.cellSpacing = size;
        var xOffset = Math.floor((canWidth - ( size * (w + 1)))/2);
        this.startX = xOffset;
        var yOffset = Math.floor((canHeight - ( size * (h + 1)))/2);
        this.startY = yOffset;
        this.prep.walkWithBorders(game.map,this.borderLookup);
        this.prep.convertPathData(this.borderLookup,this.cellSpacing,this.startY,this.startX );
        
        var that = this;
        $(this.canvas).click(function(e){
                            
                            var canvas = that.canvas;
                            var offset = $(canvas).offset();
                             var   xTrue = e.pageX - offset.left;
                             var   yTrue = e.pageY - offset.top;
                             var   x = Math.floor((xTrue-that.startX)/that.cellSpacing);
                             var   y = Math.floor((yTrue-that.startY)/that.cellSpacing);
                                if (x >= game.map.setup.width || y >= game.map.setup.height) {return false;}
                                var index = x + y * game.map.setup.width;
                                var what = game.map.mapdata[index] ;
                                //alert(what + "   ("+xTrue+","+yTrue +")");
                                if (that.clickHandler)
                                {
                                   that.clickHandler(what,true);
                                }
                                return false;
                            

               }).bind("contextmenu",function(e){
                              var canvas = that.canvas;
                            var offset = $(canvas).offset();
                             var   xTrue = e.pageX - offset.left;
                             var   yTrue = e.pageY - offset.top;
                             var   x = Math.floor((xTrue-that.startX)/that.cellSpacing);
                             var   y = Math.floor((yTrue-that.startY)/that.cellSpacing);
                                if (x >= game.map.setup.width || y >= game.map.setup.height) {return false;}
                                var index = x + y * game.map.setup.width;
                                var what = game.map.mapdata[index] ;
                                //alert(what + "   ("+xTrue+","+yTrue +")");
                                if (that.clickHandler)
                                {
                                   that.clickHandler(what,false);
                                }
                                return false;
                           }); ;
   }
   
   this.setMap = function(map)
   {
      var game= {map:map};//fake game object
      this.setGame(game);
      
   }
   
   this.setCanvas = function(canvas)
   {
      this.canvas = canvas;
   }
   
   //used to draw the whole map for initial or refresh, if scale is true, streches map to fit
   this.drawMap = function(/*{scale:boolean default false}*/)
   {
      //scale not implemented
      this.drawMapInternal(this.game.map,this.canvas);
      //put in the click handler here
      
   }
   this.flashCountry =function (countryID){}
   this.flashCountryAndNeighbors =function (countryID){}
   this.updateCountry = function(countryID) {}
   
   
    this.drawMapInternal= function(map,canvas)
   {

	 
        var ctx = canvas.getContext("2d");
        
        
        
	
	

	 var canHeight = canvas.height;
        var canWidth = canvas.width;
         ctx.fillStyle = "white"; 
        ctx.fillRect(0,0,canWidth,canHeight);
        ctx.fillStyle = "blue";
        //ctx.fillRect(this.startX,this.startY,canWidth-this.startX,canHeight-this.startY);
        var blueWidth = canWidth- 2*this.startX;
        var blueHeight = canHeight- 2*this.startY;
        ctx.fillRect(this.startX,this.startY,blueWidth,blueHeight);
        
        //use the prep object to draw all the drawing
        //this.borderSize
        this.drawShapes(canvas);
        
	
        
   }
   
this.drawShapes = function(canvas)
{
   
    //fill out
    
     if (!this.borderLookup) {return;}
     for(var i = 0; i < this.borderLookup.length; i++)
    {
        if (!this.borderLookup[i]) {continue;}
        this.drawShapeForCountry(canvas,i);
    }
    
}

this.drawShapeForCountry = function(canvas,id)
{
    if (! this.borderLookup[id].borderQuads) {throw "could not find quads for id " + id}
    var quads =  this.borderLookup[id].borderQuads;
    
    
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    
    
    for(var i = 0; i < quads.length; i+=2)
    {
       
        var q = quads[i];
        var start = q.start;
        var control = q.control;
        var end = q.finish;
        
        
        if (i===0)
        {
            ctx.moveTo(start.x,start.y);
        }
      //  ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
      //  continue;
        if (i < quads.length-1)
        {
          var q2 = quads[i+1];
          var control2 = q2.control;
          var end2 = q2.finish;
          ctx.bezierCurveTo(control.x, control.y,control2.x, control2.y, end2.x, end2.y);
        }
        else
        {
           ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
        }
        
    
    }
    ctx.closePath();
    ctx.lineWidth = this.borderSize;
   var r = this.colours[id].r;
   var    g = this.colours[id].g;
   var    b = this.colours[id].b;
                ctx.fillStyle = "rgb("+r+","+ g+","+b+")";
    
    ctx.fill();
    ctx.strokeStyle = "RGB(20,20,20)";
    ctx.stroke();
    
    
    

      
}
	
    
        
    

this.genRandomColours = function(map)
{
    var colours = {};
       for(var i = 0; i < map.mapdata.length; i++) {
        
        var data = map.mapdata[i];
        if (data < 0)
        {
            switch (data)
            {
                case map.TILE_WATER://pink
                    colours[ map.TILE_WATER ] =  { r:255, g:51, b:153 };
                    break;
                case map.TILE_COASTLINE://orange
                    colours[ map.TILE_WATER ] =  { r:255, g:102, b:0 };
                    break;
                case map.TILE_INVALID://red
                    colours[ map.TILE_WATER ] =  { r:255, g:0, b:0 };
                    break;
                case map.TILE_UNUSABLE: //lavender
                    colours[ map.TILE_WATER ] =  { r:255, g:153, b:255 };
                    break;
                case map.LANDBODY_START: //
                    colours[ map.TILE_WATER ] =  { r:255, g:255, b:0 };
                    break;
                default:
                   throw "unknown value of " + data;
                    
            }
        }
        else if (data < map.WATERBODY_START-1)
        {
            //color land greens
             r = Math.floor(Math.random()*110) ;
	    g = Math.floor(Math.random()*150) + 106;
	    b = Math.floor(Math.random()*201);
            
	    colours[ data ] =  { r:r, g:g, b:b };
        }
        else if (data >= map.WATERBODY_START)
        {
               r = g = 0;
                b = 255;
            
	        colours[ data]= { r:r, g:g, b:b };
            }
            else
            {
                throw "what the hell ? number is " +data;
            }
       }
         
	
        
		return colours;

}

} 



