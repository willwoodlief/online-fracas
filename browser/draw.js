function DrawSimple()
{
             //the html5 canvas we are drawing on
   this.canvas  = null;
   //game will control the map
   this.game = null;
   //a click handler will be called with the params id of the country or water, and bool true if left click
   this.clickHandler = null;
   
   this.setGame = function(game)
   {
      this.game= game;
   }
   
   this.setCanvas = function(canvas)
   {
      this.canvas = canvas;
   }
   
   //simply blanks out canvas
   this.drawBlank = function()
   {
      var ctx = this.canvas.getContext("2d");
      var canHeight = this.canvas.height;
        var canWidth = this.canvas.width;
	ctx.fillStyle = "rgb("+255+","+ 255+","+255+")"; 
        ctx.fillRect(0,0,canWidth,canHeight);
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
   
   
    this.drawMapInternal= function(map,canvas) {

	 
        var ctx = canvas.getContext("2d");
        
        
        
	
	var colours = this.genRandomColours(map);

	var w = map.setup.width - 1;
	var h = map.setup.height - 1;
        var canHeight = canvas.height;
        var canWidth = canvas.width;
        var lesser = canHeight < canWidth ? canHeight : canWidth;
        var ratio = lesser/100;
        var size = Math.floor(ratio);
        var xOffset = Math.floor((canWidth - ( size * (w + 1)))/2);
        var yOffset = Math.floor((canHeight - ( size * (h + 1)))/2);
         ctx.fillStyle = "rgb("+255+","+ 255+","+255+")"; 
        ctx.fillRect(0,0,canWidth,canHeight);
	
         var r=0,g=0,b=0;
	for (var x=0; x<w; x++) {
            for (var y = 0; y < h; y++) {
                var dad = map.cell(x,y);
               
                r = colours[dad].r;
                g = colours[dad].g;
                b = colours[dad].b;
                ctx.fillStyle = "rgb("+r+","+ g+","+b+")";
                var placeX = (x*size) + xOffset;
                var placeY = (y*size) + yOffset;
              ctx.fillRect(placeX,placeY,size,size);
            } 
               
              
        }
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



