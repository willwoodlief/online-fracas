/*
 countryShapeIndex 0..4
 sizeCountryVarianceIndex 0..5
 coastAmountIndex 0..4
 countrySizeIndex 0..7
 percentageLand 0..100
 minLakeSize 0..   2 5 0
 islandStyleIndex 0..2
 
 these numbers are user given in the form
 
 //set all array count for roomto numberroom
 //set switch and pop for erasing possible
 
*/
//if w is not true, will initialize an empty setup
function MapSetup(w,h,countrySizeIndex,percentageLand,islandStyleIndex,sizeCountryVarianceIndex,
                  coastAmountIndex,countryShapeIndex,minLakeSize)
{
  if (w)
  {
    this.width = w;
    this.height = h;
    this.area = w *h;
    this.countrySize  = 80 * Math.pow(1.5,countrySizeIndex  - 3.0);
    var approxNumCountries = this.area / this.countrySize;
    this.desiredNumCountries = Math.floor(approxNumCountries * percentageLand / 100.0);
    this.percentageLand = percentageLand;
    this.islandStyle = islandStyleIndex;
    this.sizeVariance = 100 - sizeCountryVarianceIndex * 20;
    this.coastPreserve = 100 - (10+ coastAmountIndex * 20);
    this.countryShape =  10 + countryShapeIndex * 20;
    this.minLakeSize = minLakeSize;
    this.args = {};
    this.args.countrySizeIndex = countrySizeIndex;
    this.args.islandStyleIndex = islandStyleIndex;
    this.args.sizeCountryVarianceIndex = sizeCountryVarianceIndex;
    this.args.coastAmountIndex = coastAmountIndex;
    this.args.countryShapeIndex = countryShapeIndex;
  }
  else
  {
    this.width = 0;
    this.height = 0;
    this.area = 0;
    this.countrySize  = 0;
    var approxNumCountries = 0;
    this.desiredNumCountries = 0;
    this.percentageLand = 0;
    this.islandStyle = 0;
    this.sizeVariance = 0;
    this.coastPreserve = 0;
    this.countryShape =  0;
    this.minLakeSize = 0;
    this.args = {};
    this.args.countrySizeIndex = 0;
    this.args.islandStyleIndex = 0;
    this.args.sizeCountryVarianceIndex = 0;
    this.args.coastAmountIndex = 0;
    this.args.countryShapeIndex = 0;
  }
  
    
}

MapSetup.prototype.copy = function(other)
{
  this.width =other.width;
  this.height = other.height;
  this.area = other.area;
  this.countrySize  = other.countrySize;
  
  this.desiredNumCountries = other.desiredNumCountries;
  this.percentageLand = other.percentageLand;
  this.islandStyle = other.islandStyle;
  this.sizeVariance = other.sizeVariance;
  this.coastPreserve = other.coastPreserve;
  this.countryShape =  other.countryShape;
   this.minLakeSize = other.minLakeSize;
   this.args = {};
    this.args.countrySizeIndex = other.args.countrySizeIndex;
    this.args.islandStyleIndex = other.args.islandStyleIndex;
    this.args.sizeCountryVarianceIndex = other.args.sizeCountryVarianceIndex;
    this.args.coastAmountIndex = other.args.coastAmountIndex;
    this.args.countryShapeIndex = other.args.countryShapeIndex;
   return this;
  
}

MapSetup.prototype.clone = function()
{
  var other =   new MapSetup(this.width,this.height,this.args.countrySizeIndex,this.percentageLand,
                              this.args.islandStyleIndex,this.args.sizeCountryVarianceIndex,
                                    this.args.coastAmountIndex,this.args.countryShapeIndex,this.minLakeSize);
  return other;
  
}



function AveMap(setup)
{
  if (setup)
  {
    this.setup = setup.clone();
     this.mapdata = new Array(setup.width * setup.height);
    this.numberRoom = this.setup.area;
    
  }
  else
  {
    this.setup = new MapSetup(false);
    this.mapdata=null;
    this.numberRoom =0;
  }
   
   this.doesMapHaveRoom = function() { return this.numberRoom?true: false;}
   

    this.properties = {};
    this.waterProperties = {};
    this.LANDBODY_START = -1
    this.WATERBODY_START = 999999;
    
    this.TILE_WATER = -2;
    this.TILE_COASTLINE = -3;
    this.TILE_INVALID = -4;
    this.TILE_UNUSABLE = -5;
    
    this.ISLAND_STYLE_NONE = 0;
    this.ISLAND_STYLE_SOME = 1;
    this.ISLAND_STYLE_LOTS = 2;
    
    this.PROPERTY_KEY = {};
    this.PROPERTY_KEY.NAME = "name";
    this.PROPERTY_KEY.PLAYABLE = "playable";
    if (setup)
    {
      this.clear();
    }
  
}

 AveMap.prototype.attachData = function(smap)
 {
    var setup = new MapSetup(false); //empty map setup
    this.copy(smap);
 }



 AveMap.prototype.setProperty = function(regionID, key, value)
 {
	
		if (regionID < this.WATERBODY_START)
                {
                  if (!this.properties[regionID])
                  {
			this.properties[regionID] = {};
                        this.properties[regionID][key] = value;
                  }
                  else
                  {
			this.properties[regionID][key] = value;
                  }
                }
                else
                {
			var waterID = regionID - (this.WATERBODY_START+1);
                        if (!this.waterProperties[waterID])
                        {
                              this.waterProperties[waterID] = {};
                              this.waterProperties[waterID][key] = value;
                        }
                        else
                        {
                              this.waterProperties[waterID][key] = value;
                        }
                }
	
 }
	
AveMap.prototype.getProperty = function(regionID, key)
{
	
		if (regionID < WATERBODY_START)
                {
			if (!this.properties[regionID]) { return null;}
			return this.properties[regionID][key];
                }
		else
                {
			var waterID = regionID - WATERBODY_START - 1;
                        if (!this.waterProperties[waterID]) { return null;}
                        return this.waterProperties[waterID][key];
			
                }
	
}

/*
 can look for array of values or just a value
*/
AveMap.prototype.include = function(value)
{
        
          //is array of values to check
          for(var i = 0; i < this.mapdata.length; i++) {
                if(this.mapdata[i] === value) {
                    return true;
                }
            }
            return false;
        

}
	

	// use slice copy the data from another map into this one
AveMap.prototype.copy = function(map)
{
		//only bother if this is another map, or at least acts like it
               
                this.setup.copy(map.setup);

		this.mapdata = map.mapdata.slice();
                
                
		this.numberRoom = map.numberRoom;
                this.properties = {};
		var   key = 0;
                for (key in map.properties) {
                    if (map.properties.hasOwnProperty(key)) 
                    {
                      this.properties[key] = map.properties[key];
                    }
                }
                
                 this.waterProperties = {};
                for (key in map.waterProperties) {
                    if (map.waterProperties.hasOwnProperty(key)) 
                    {
                      this.waterProperties[key] = map.waterProperties[key];
                    }
                }
                
                  return this;
}

AveMap.prototype.clone = function()
{
      
      var newby = new AveMap(this.setup);
      newby.mapdata = this.mapdata.slice();
      
      
      var   key = 0;
         
          for (key in this.properties) {
              if (this.properties.hasOwnProperty(key)) 
              {
                newby.properties[key] = this.properties[key];
              }
          }
                
     
     for (key in this.waterProperties) {
         if (this.waterProperties.hasOwnProperty(key)) 
         {
           newby.waterProperties[key] = this.waterProperties[key];
         }
     }
     
     newby.numberRoom = this.numberRoom;
                
      return newby;
}

AveMap.prototype.clear = function()
{
        for(var i = 0; i < this.mapdata.length; i++) {
            this.mapdata[i]= this.TILE_WATER;
            
        }
		
}

AveMap.prototype.cell = function(x, y)
{
     if (x < 0 || y < 0 || x > this.setup.width-1 || y > this.setup.height-1)
    {
          return this.TILE_INVALID
    }

		var result = this.mapdata[x + (y * this.setup.width)] ;
		return result;
}

AveMap.prototype.setCell = function(x, y, value)
{
  if (x < 0 || y < 0 || x > this.setup.width-1 || y > this.setup.height-1)
  {
          return false;
  }
	   var oldData = this.mapdata[x + (y * this.setup.width)];
           if (
	       (oldData == this.TILE_COASTLINE || oldData == this.TILE_WATER) &&
	       (value != this.TILE_COASTLINE && value != this.TILE_WATER)
	      )
	   {
	      this.numberRoom --;
	   }
	   else
	   {
	      if (
		 (oldData != this.TILE_COASTLINE && oldData != this.TILE_WATER) &&
		 (value == this.TILE_COASTLINE || value == this.TILE_WATER)
		)
	     {
		this.numberRoom ++;
	     }
	    
	   }
	   this.mapdata[x + (y * this.setup.width)] = value;
           return value;
}

	

//list is the x,y coordinates that will take on value
AveMap.prototype.setCells = function(list, value)
{
	for(var i = 0; i < list.length; i++) {
            this.setCell(list[i].x,list[i].y,value);
            
        }
	
}

AveMap.prototype.countryCount = function()
{

	     var maxCountry = this.LANDBODY_START;
        for(var i = 0; i < this.mapdata.length; i++) {
            if (this.mapdata[i]< this.WATERBODY_START && this.mapdata[i] >maxCountry )
            {
               maxCountry = this.mapdata[i];
            }
            
        }
        return maxCountry - this.LANDBODY_START;
}
		
		

AveMap.prototype.lakeCount = function()
{

		//create a list of all lakes
		var lakes = {};
		for(var i = 0; i < this.mapdata.length; i++) {
                    if (this.mapdata[i] > this.WATERBODY_START)
                    {
                        lakes[this.mapdata[i]] = true;
                    }
                }

		
		var size = 0, key;
                for (key in lakes) {
                    if (lakes.hasOwnProperty(key)) size++;
                }
                return size;
}

AveMap.prototype.createNeighboursList = function()
{

	    //country - int value of country - 1 over index

		var neighbours = {};
		var playable = {};
		
		var countries = this.countryCount();
		var lakes = this.lakeCount();
		
		for(var i = LANDBODY_START+1; i < countries-1; i++)
		{
		    neighbours[i] = {};
		    playable[index] = isPlayable(i);
		    
		}
		
		for(i = WATERBODY_START+1; i < lakes-1; i++)
		{
		    neighbours[i] = {};
		    playable[index] = isPlayable(i);
		    
		}
		
		
		for(var x =0; x < this.setup.width-1; x++)
		{
			for(var y =0; y < this.setup.height-1; y++)
			{
			   var country = this.cell();
			   if (playable[country] == true)
			    {
				    var countryE = this.cell(x + 1, y);
				    var countryS = this.cell(x, y + 1);

				    if (countryE != country && countryE > LANDBODY_START)
				    {
					    neighbours[country][countryE]= true;
					    neighbours[countryE][country] = true;
				    }
				    if (countryS != country && countryS > LANDBODY_START)
				    {
					    neighbours[country][countryS]= true;
					    neighbours[countryS][country] = true;
				    }
			    }
			}
		}

		return neighbours;

}

AveMap.prototype.isPlayable = function(regionID)
{
    if (regionID <= LANDBODY_START) { return false;}
    if (regionID > WATERBODY_START) {return true} ;
    if (regionID > LANDBODY_START && getProperty(regionID, this.PROPERTY_KEY.PLAYABLE) == true)
      { return true;}
      
}



	//replaces every instance of 'old' in the map data with 'new'
AveMap.prototype.changeValue = function(old, n)
{
      for(var i = 0; i < this.mapdata.length; i++)
      {
	    if (this.mapdata[i] === old)
	    {
		this.mapdata[i] = n;;
	    }
      }

}



	
	
	
AveMap.prototype.deleteCountry = function(index)
{
      
      var i = index + 1
      var currentCountryCount = this.countryCount();
      for(var i = 0; i < this.mapdata.length; i++)
      {
	    var value = this.mapdata[i];
	    if (value > index && value <= currentCountryCount)
	    {
		this.mapdata[i] = value-1;
	    }
	    if (value === index)
	    {
	      this.mapdata[i] =TILE_WATER;
	    }
      }
      
      for(var i = index; i < currentCountryCount; i++)
      {
	  this.properties[i] = this.properties[i+1];
      }
      this.properties[i+1] = undefined;
      
    
}


	//is there at least 1 cell with value 'index'
AveMap.prototype.doesCountryExist = function(index)
{
   return this.include(index);
}

//this is where we create the world
function MapGenerator(setup,progressCallback)
{
   this.map = new AveMap(setup);
   var bInit = false;
   this.isInitialized = function() { return bInit;}
   this.setInitialized = function() { bInit=true;}
   this.progress = progressCallback;
   this.createMap();
}

MapGenerator.prototype.getFinishedMap = function()
{
    if (this.isInitialized()) { return this.map; }
    throw "map not initialized";
}

MapGenerator.prototype.createMap = function()
{
    if (this.isInitialized()) { return; }
   var lakeNum = this.map.WATERBODY_START + 1;
   var country = 0;
   if (this.progress) { this.progress(0,'creating countries...'); }
   var incProgressCountires = 60/this.map.setup.desiredNumCountries;//progress per country
    //looping to generate a specific number of countries
    while (country < this.map.setup.desiredNumCountries - 1  && this.roomForCountry() )
    {
       var makeCountryResult = this.createCountry(lakeNum,country);
       country = makeCountryResult.NextCountryID;
       lakeNum = makeCountryResult.NextLakeNum;
       var mi = country % 10;
       if (!mi && country && this.progress)
       {
	  this.progress(incProgressCountires * country,'creating countries...');
       }
    }
    if (this.progress) { this.progress(70,'creating oceans...'); }
    lakeNum = this.fillSpacesWithOceans( lakeNum);
    if (this.progress) { this.progress(80,'filling in too small lakes...'); }
    lakeNum = this.removeSmallWater( lakeNum);
    if (this.progress) { this.progress(90,'naming regions and lakes...'); }
    this.nameRegions();
    if (this.progress) { this.progress(100,'  done.'); }
     this.setInitialized();

}
	
	//Creates a single country on a map

//helper object to hold x y
function Point(x,y)
{
   this.x = x;
   this.y = y;
}

MapGenerator.prototype.createCountry = function(lakeNum,country)
{
		
  var madeCountry = false;

  //working on a particular country
  while (!madeCountry && this.roomForCountry() )
  {

          //find a starting position for the country, returns a point object
          var startCell = this.getStartCell();
          
          //tentative country block
          var tent = [startCell];
          //used to hold blocks which may still have blank space around them
          var possible = [startCell];

          //get the size in cells of the country
          var countrySize = this.getCountrySize();
          var newOrder = true;
          var countryDone = false;
          var validCountry = true;
          var useCell = 0;
          while ((tent.length < countrySize) && (! countryDone) )
          {

                  
            if (newOrder)
            {
                newOrder = false
                //set the first cell to try
                if (Math.floor(Math.random()*100) +1 < this.map.setup.countryShape)
                {
                        useCell = possible.length - 1;
                }
                else
                {
                    useCell  = Math.floor(Math.random()*(possible.length));     
                }           
            }
            
            var place = possible[useCell];
            var directionTry = Math.floor(Math.random()*4) ;
            var directionTryCount = 0
            while (directionTryCount < 4)
            {
                var nextPlace = this.getNextCoords(place, directionTry); 
                //if this cell is clear for use
                if (this.clearDirection(nextPlace, this.map.cell(nextPlace.x, nextPlace.y), tent) )
                {                          
                        tent.push(nextPlace);
                        possible.push(nextPlace);
                        if (tent.length >= countrySize)
                        {
                          countryDone = true;
                          madeCountry = true;
                        }
			break;
                }                        
                else
                {
                        //blocked - get new direction
                        directionTry += 1
                        if (directionTry == 4) {directionTry = 0; } 
                        directionTryCount += 1;
                }
            }     //end #while directionTry < 4 and not done   
            


            if (directionTryCount == 4)
            {
                //this block is boxed in, move to the next one in the list
            
              //  possible.splice(useCell,1); //delete position of array
	       //optimize this taking out of array, it does not need to be ordered
	      if (possible.length==0) {possible.length=0;}
	       else if (useCell== possible.length-1) {possible.pop();}
	       else {
		  possible[useCell] = possible.pop();
	       }
                newOrder = false;
                useCell += 1;
                if (useCell > possible.length - 1) {useCell = 0; } 

                //if we've tried every cell, unusable starting location
                if (0 == possible.length)
                {
                  //set every cell in this area to unusable (make a new lake)
                  this.map.setCells(tent, lakeNum)
                  lakeNum += 1;
                  countryDone = true;
                  validCountry = false;
                }
                else
                {
                     newOrder = true;
                }
            } //end if directionTryCount == 4
          }//end #tent.length < countrySize and !countryDone

        //#if the validCountry flag wasnt set to false at some point
        if (validCountry)
        {
               //#write country to map
                this.map.setCells(tent, country);
                this.map.setProperty(country, this.map.PROPERTY_KEY.PLAYABLE, true);
                this.outlineCountryCoasts( tent);
                country += 1;
        }
    }//end made country
    var ret = {};
    ret.NextCountryID =country;
    ret.NextLakeNum = lakeNum;
    return ret;
        
	
  }
 	
 	/*determines if there is room for another country
 	#given map
 	#returns true if there is water on it
 	#false otherwise
        */
MapGenerator.prototype.roomForCountry = function()
{
   var ret = this.map.doesMapHaveRoom();
    return ret;
 
}
 
MapGenerator.prototype.getNextCoords= function(p, direction)
{
   var x = p.x;
   var y = p.y;
   var nx, ny;
    switch( direction)
    {
            case 0: //UP
              {
                    nx =x;
                    ny = y-1;
                    break;
              }
            case 1: //DOWN
              {
                    nx =x;
                    ny = y+1;
                    break;
              }
              case 2: //left
              {
                    nx =x-1;
                    ny = y;
                    break;
              }
              case 3: //right
              {
                    nx =x+1;
                    ny = y;
                    break;
              }
              default:
                  throw "impropper use of getNextCoords";
    }
    
    return new Point(nx, ny);
		
}
 
MapGenerator.prototype.getStartCell = function()
{
  var mapWidth = this.map.setup.width;
  var mapHi = this.map.setup.height;

  var startX = Math.floor(Math.random()*(mapWidth));    
  var startY = Math.floor(Math.random()*(mapHi));   
  var startCell = this.map.cell(startX, startY);

  var islandStyle = this.map.setup.islandStyle;
  
  var getStartDone = false;
  while (!getStartDone)
  {
          if (islandStyle === this.map.ISLAND_STYLE_NONE && startCell === this.map.TILE_COASTLINE) {
                  getStartDone = true;
          }
          else if ( islandStyle === this.map.ISLAND_STYLE_LOTS &&
                   (startCell === this.map.TILE_COASTLINE || startCell === this.map.TILE_WATER)) {
                  getStartDone = true;
          }
          else if (
                   (startCell === this.map.TILE_COASTLINE &&
                   this.map.setup.coastPreserve >= Math.floor(Math.random()*(101)) )
                   ||
                   (startCell == this.map.TILE_WATER &&
                    this.map.setup.coastPreserve <= Math.floor(Math.random()*(101)) )
                  )
          {
                  getStartDone = true;
          }
          if (getStartDone) {break;}
          //this was added by will, trying to understand the code from ruby. I think this should have been here origonally
          //the ruby version did not break
          
          startX = startX+1;
          if (startX >= mapWidth)
          {
                  startY += 1
                  startX = 0
                  if (startY > mapHi) {startY = 0 ; } 
          }
          startCell = this.map.cell(startX, startY);

  }
		
  return new Point(startX, startY);
	
}
 
	
	/*#used to decide the size of a country
	#gets the size of a country. The formula should be:
	#countrySize +/- countrySize*(100-countryProportionality)/100*rand(0)
	#+/- is determined by a random number generator
        */
MapGenerator.prototype.getCountrySize = function()
{
		var proportionality = (100 - this.map.setup.sizeVariance);
		proportionality /= 100.0;
		proportionality *= ((Math.random()-0.5)*2.0);
		var countrySize = this.map.setup.countrySize;
		var ret =  Math.floor(countrySize+countrySize*proportionality);
                return ret;
}
 
 

 /*
	#x, y are coords, mapPoint is value at point, tent is array of 
	#'tentative' cells to use as a country
	#return false if mapPoint is not water or coastline
	#return false if tent includes [x, y]
	#return true otherwise
 */
MapGenerator.prototype.clearDirection = function(xyPlace, mapPoint, tent)
{
 
 		if (mapPoint != this.map.TILE_WATER && mapPoint != this.map.TILE_COASTLINE)
                {
 			return false;
                }
 
                for(var i=0; i < tent.length; i++)
                {
                   var o = tent[i];
                   if (o.x== xyPlace.x && o.y == xyPlace.y)
                   {
                      return false;
                   }
                }
 		
 		return true;
 
}
 /*
	#outlines a country's coast areas as TILE_COASTLINE
	#map is the map, and countryShape is a list of cells in a country
	#loops over elements, and for all cells surrounding it, if the 
	#value of that surrounding cell is TILE_WATER, or 
	#is > WATERBODY_START, then change it 
	#(the neighbour, not the original) to TILE_COASTLINE
 */
MapGenerator.prototype.outlineCountryCoasts = function( countryShape)
{
  for(var squareIndex=0; squareIndex < countryShape.length; squareIndex++)
  {
      var x = countryShape[squareIndex].x;
      var y = countryShape[squareIndex].y;

      var thisCell = this.map.cell(x + 1, y);
      if (thisCell == this.map.TILE_WATER || thisCell > this.map.WATERBODY_START) {
              this.map.setCell(x + 1, y, this.map.TILE_COASTLINE);
      }
      

      thisCell = this.map.cell(x - 1, y);
      if (thisCell == this.map.TILE_WATER || thisCell > this.map.WATERBODY_START) {
              this.map.setCell(x - 1, y, this.map.TILE_COASTLINE);
      }

      thisCell = this.map.cell(x, y + 1);
       if (thisCell == this.map.TILE_WATER || thisCell > this.map.WATERBODY_START) {
              this.map.setCell(x , y+1, this.map.TILE_COASTLINE);
      }

      thisCell = this.map.cell(x, y - 1)
       if (thisCell == this.map.TILE_WATER || thisCell > this.map.WATERBODY_START) {
              this.map.setCell(x , y-1, this.map.TILE_COASTLINE);
      }
  }
}
 
	//Removes bodies of water that are too small
MapGenerator.prototype.removeSmallWater = function(numLakes)
{
 
 		var n = this.map.WATERBODY_START + 1;

 		var remainingLakes = {};
 		for (var lakeIndex=n; lakeIndex<=numLakes;lakeIndex++) {
 			remainingLakes[lakeIndex] = true;
 		}
 		
 		
 		//#puts "remaining populated"
 
 		var lakeSizes = {};
		var MapWidth = this.map.setup.width;
		var MapHeight = this.map.setup.height;
		var a = this.map.mapdata;
		var WaterbodyStart = this.map.WATERBODY_START;
 		for (var x=0; x < a.length; x++) {
 			
		    var cellValue = a[x];
		    if (cellValue > WaterbodyStart) {
			    if (!lakeSizes[cellValue]) {lakeSizes[cellValue] = 0 ;}
			    lakeSizes[cellValue] ++;
		    }
			
		}
		var minSize = this.map.setup.minLakeSize;
 		while (n < numLakes ) {
 
 			if (lakeSizes[n] < minSize) {
 				delete remainingLakes[n];
 			}
 			
 			n ++;
		}
                
 		//remaining lakes cut down to only those larger than the minimum
 		var lakeMappings = {}
 		var mappingIndex = WaterbodyStart + 1;
		
		 for (key in remainingLakes) {
		    if (remainingLakes.hasOwnProperty(key)) 
		    {
		      lakeMappings[key] = mappingIndex;
		      mappingIndex++;
		    }
		}
 
 		
 
 		var unflippedWater = {};
		var uIndex = 0;
		for (x=0; x < MapWidth; x++) {
		  for(var y=0; y < MapHeight; y++) {	
		    var cellValue = a[x + (y * MapWidth)];
		    if (cellValue > WaterbodyStart && !lakeMappings[cellValue]) {
			    var newValue = this.getLandReplacement(x, y,false);
			    if (newValue==this.map.TILE_INVALID)
			    {
			      unflippedWater[uIndex++] = new Point(x,y);	      
			    } else {
			        this.map.setCell(x,y,newValue);
			    }
		    } else
		    {
		       if (cellValue > WaterbodyStart && lakeMappings[cellValue] )
		       {
			  this.map.setCell(x,y,lakeMappings[cellValue]);
			  
		       }
		    }
		  }
		}
 
 //sometimes a group of cell will get isolated from any land, in the fill process, see if any got deleted
 //in a cycle, and if not, tell the land replacement to flip them to a neighbor water.
 		
                var bAnyChange = true;
                var bFlipToWaterAlso = false;
                while(uIndex > 0) {
                  if (!bAnyChange) {bFlipToWaterAlso=true;} else {bFlipToWaterAlso=false;}
                  bAnyChange = false;
		  for (key in unflippedWater)
		  {
		    if (unflippedWater.hasOwnProperty(key)) {
		      var point = unflippedWater[key];
		       var newValue = this.getLandReplacement(point.x, point.y,bFlipToWaterAlso);
		       if (newValue!=this.map.TILE_INVALID)
			    {
			       delete unflippedWater[key];
			       this.map.setCell(x,y,newValue);
			       uIndex--;
                               bAnyChange = true;
			    }
		    }
		  }

		}
 
 		
 		//puts "cells flipped"
		var lakeCount = 0;
		for(key in remainingLakes)
		{
		   if (remainingLakes.hasOwnProperty(key))
		   {
		      lakeCount++;
		   }
		}
 
 		return lakeCount + WaterbodyStart;
 
}
 
	//#Get a country nearby a certain point
MapGenerator.prototype.getLandReplacement = function(x, y,bFlipToWaterAlso)
{
 
 		var step = Math.floor(Math.random()*(4));
 		var triesCount = 0;
 
 		var value = this.map.TILE_INVALID;
 
 		while (value == this.map.TILE_INVALID && triesCount < 4) {
 
 			switch (step)
			{
 
 				case 0:
 					if (y > 0) {value = this.map.cell(x, y-1) ; }
					break;
 				case 1:
 					if (y < this.map.setup.height - 1) {value = this.map.cell(x, y+1); } 
 					break;
 				case 2:
 					if (x > 0) {value = this.map.cell(x-1, y) ; }
 					break;
 				case 3:
 					if (x < this.map.setup.width) { value = this.map.cell(x+1, y) ;}
 					break;
				default: throw "error in get closest land ";
			}
 
 			if (value > this.map.LANDBODY_START &&
                            (bFlipToWaterAlso? true : value < this.map.WATERBODY_START) )
 			{
			    return value;
			}
 			else {
 				step += 1;
 				if (step == 4) {step = 0 ; }
 				value = this.map.TILE_INVALID;
 				triesCount += 1;
			} 
		}
 
 		return value
 
}
 

MapGenerator.prototype.fillSpacesWithOceans = function(numLakes)
{
  var MapWidth = this.map.setup.width;
  var MapHeight = this.map.setup.height;
  var TileWater = this.map.TILE_WATER;
  var TileCoastline = this.map.TILE_COASTLINE;
  var a = this.map.mapdata;
  for (var x=0; x < MapWidth; x++) {
      for(var y=0; y < MapHeight; y++) {	
	    var cellValue = a[x + (y * MapWidth)];
	    if (cellValue == TileWater || cellValue == TileCoastline)
	    {
	      this.fillRegion(x, y, numLakes);
 					numLakes ++ ;
	    }
      }
  }
 		
 
 		return numLakes;
 
}
 
MapGenerator.prototype.fillRegion = function(x, y,  numLakes)
{
  var MapWidth = this.map.setup.width;
  var MapHeight = this.map.setup.height;
  var TileWater = this.map.TILE_WATER;
  var TileCoastline = this.map.TILE_COASTLINE;
  var a = this.map.mapdata;
  var remaining = new Array(0);

 
  remaining.push ( new Point(x, y) );

  while (remaining.length > 0) {
	  var p = remaining.pop();
	  if (this.validForFilling(p.x,p.y) ) {
	    this.map.setCell(p.x, p.y, numLakes);
	    if (this.validForFilling(p.x,p.y+1)) { remaining.push ( new Point(p.x, p.y+1) );}
	    if (this.validForFilling(p.x,p.y-1)) { remaining.push ( new Point(p.x, p.y-1) );}
	    if (this.validForFilling(p.x+1,p.y)) { remaining.push ( new Point(p.x+1, p.y) );}
	    if (this.validForFilling(p.x-1,p.y)) { remaining.push ( new Point(p.x-1, p.y) );}
	  }
			
  }
 
}
 

MapGenerator.prototype.validForFilling = function(x, y)
{
    //let map filter invalid values
    var cell = this.map.cell(x, y);
    if (cell === this.map.TILE_COASTLINE || cell === this.map.TILE_WATER) { return true;}
    return false;
 		
}
 
 	
 	
MapGenerator.prototype.nameRegions = function()
{
 	
 		var countryNames = this.createNames(this.map.countryCount(), false)
 		var waterNames = this.createNames(this.map.lakeCount(), true);
		
		for(var key in countryNames)
		{
		   if (countryNames.hasOwnProperty(key))
		   {
		      
		      this.map.setProperty(key,this.map.PROPERTY_KEY.NAME,countryNames[key]);
		   }
		}
		
		for( key in waterNames)
		{
		   if (waterNames.hasOwnProperty(key))
		   {
		      var numberKey = parseInt(key);
		      var keyid = numberKey + 1 + this.map.WATERBODY_START;
		      this.map.setProperty(keyid,this.map.PROPERTY_KEY.NAME,waterNames[key]);
		   }
		}
 		
 	
}
 
 //make object with key of the 0 based index, and value of the country name
MapGenerator.prototype.createNames = function(number, water)
{
    var names = {};

    for (var x = 0; x < number; x++)
    {
	    names[x] =  this.createName(water);
    }

    return names;
 
}
 

MapGenerator.prototype.createName = function(useWater)
{
 
 		var starts = ["a", "e", "i", "o", "u"];
 		var vowels = ["a", "e", "i", "o", "u", "ia"];
 		var middle = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "ch", "sh", "cl", "vr", "st", "fr", "fl", "nd", "rk", "wr", "th"];
 		var consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "ch", "sh"];
 
 		var water = ["Bay", "Sea", "Ocean", "Lake"];
 
 		var name = "";
 
 		var usedVowel = false;
 		if (Math.floor(Math.random()*(2)) == 1) {
 
 			name += starts[Math.floor(Math.random()*5)];
 			usedVowel = true;
 
		}
		
 		var count = 0;
 
 		while ((Math.floor(Math.random()*(7-count)) < 4 || count < 1) && count < 2) {
 
 			count+= 1;
 
 			if (count > 1 || usedVowel) {
 				name += middle[Math.floor(Math.random()*(middle.length))];
 			}
 			else {
 				name += consonants[Math.floor(Math.random()*(consonants.length))]
 			}
 			
 
 			name += vowels[Math.floor(Math.random()*(vowels.length))];
 
		}
 
 		if (Math.floor(Math.random()*(2)) == 1) {
 			name += consonants[Math.floor(Math.random()*(consonants.length))];
		}
 
 		
 
 		if (useWater)
		{
 
 			name +=" ";
 			name += water[Math.floor(Math.random()*(water.length))];
 
		}  toTitleCase(name);
 
 		return name
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
 

MapGenerator.prototype.createTroopCounts = function(number, middle, maxVariance, chanceOfTroops )
 {
 		var values = [];
 
 
 		for(var x=0; x < number; x++)
		{
 			if (Math.floor(Math.random()*(100)) < chanceOfTroops) {
 				values.push(  createTroopCount(middle, maxVariance) );
 			}
 			else {
 				values.push(0);
 			}
 			
		}
 
 		return values
 
 }
 

MapGenerator.prototype.createTroopCount = function(middle, maxVariance)
{
 
 		var variance = Math.floor(maxVariance * Math.random()*100 / 100);
 
 		if (Math.floor(Math.random()*(2)==1) ) {
 			return (middle - variance > 0) ? middle - variance: 0;
 		}
 		else {
 			return (middle + variance > 0) ? middle + variance: 0;
 		}
 		 
}
