
function prepDrawMap()
{
    


this.setupCountryInfo = function(map)
{
    this.closeOceanChanels(map);
    
    var a = map.mapdata;
    var width = map.setup.width;
    var height = map.setup.height;
    this.OUT_OF_MAP = -100;
    var outOfMap = this.OUT_OF_MAP;
    var that = this;
    var countryInfo = [];
    
    
    
    //setup the country info enough to do the next batch
    for(var x = 0; x < width; x ++)
    {
        for(var y=0; y < height; y++)
        {
            var index = x + y * width;
            var regionID = a[index];
            if (regionID < 0 || regionID > map.WATERBODY_START -1) {continue;}
            
            if (!countryInfo[regionID])
            {
                var node = {};
                node.topLeft = {x:1000000, y:100000};
                
                node.borders = [];
                node.fill = {};
                node.regionID = regionID;
                countryInfo[regionID] = node;              
            }
            if (y<countryInfo[regionID].topLeft.y) {countryInfo[regionID].topLeft.y = y;countryInfo[regionID].topLeft.x = x;}
            if (x<countryInfo[regionID].topLeft.x) {countryInfo[regionID].topLeft.x = x;countryInfo[regionID].topLeft.y = y;}
           
            var key = "x"+x+"y"+y;
            countryInfo[regionID].fill[key] = {x:x, y:y,flag:false};
           
            
        }  //end y part of for loop
    } //end x part
    return countryInfo;
}

this.closeOceanChanels = function(map)
{
    var a = map.mapdata;
    var width = map.setup.width;
    var height = map.setup.height;
    for(var x = 0; x < width; x++)
    {
        for(var y=0; y < height; y++)
        {
            //going through, if there is a block
            /*
               with the pattern xw      wx
                                wx or   xw
                where w is water and x is any country, change both waters to random country code
                
            */
            var index = x + y * width;
            var code = a[index];
            //test the squares (x,y)(x+1,y),(x,y+1), (x+1,y+1)
            if (code >= map.WATERBODY_START-1)//its water
            {
                if (x+1 < width && y+1 < height ) {
                    var t1i = x+1 +  y * width;
                    var t1 = a[t1i];
                    if (t1 <= map.WATERBODY_START-1) { //land
                        t2i = x + (y+1) * width;
                        t2 = a[t2i];
                        if (t2 <= map.WATERBODY_START-1) { //land
                            t3i = x +1 + (y+1) * width;
                            t3 = a[t3i];
                            if (t3 > map.WATERBODY_START-1){ //water
                                //fill in water squares, so fill in index and t3i
                                a[index] = t2;
                                a[t3i] = t2;
                            }
                        }
                    }
                }
            }
            //test the oposite pattern
            if (code < map.WATERBODY_START-1)//its land
            {
                if (x+1 < width && y+1 < height ) {
                    var t1i = x+1 +  y * width;
                    var t1 = a[t1i];
                    if (t1 > map.WATERBODY_START-1) { //water
                        t2i = x + (y+1) * width;
                        t2 = a[t2i];
                        if (t2 > map.WATERBODY_START-1) { //water
                            t3i = x +1 + (y+1) * width;
                            t3 = a[t3i];
                            if (t3 <= map.WATERBODY_START-1){ //land
                                //fill in water squares, so fill in index and t3i
                                a[t1i] = code;
                                a[t2i] = code;
                            }
                        }
                    }
                }
            }
        }
    }
}

this.testWalkWithBorders = function(map,countryInfo,regionID,lastPush,rem)
{
    var a = map.mapdata;
    var width = map.setup.width;
    var height = map.setup.height;
    if (!countryInfo[regionID]) {throw "invalid country id";}
    var country = countryInfo[regionID];
    if (!lastPush)
    {
        var x = country.topLeft.x;
        var y = country.topLeft.y;
        var hw = null;//null value tells it to start looking at fresh path
    }
    else
    {
        var x = lastPush.x;
        var y = lastPush.y;
        var hw = lastPush.hw;
    }
    lastPush = this.getBorderValue(a,width,height,regionID,x,y,hw,rem);
       
       if (lastPush)
       {
            country.borders.push(lastPush);
       }
            
    return lastPush;
        
   
}

this.walkWithBorders = function(map,countryInfo)
{
    var a = map.mapdata;
    var width = map.setup.width;
    var height = map.setup.height;
    //now walk through boundaries
    for(var i=0; i < countryInfo.length; i++)
    {
        if (!countryInfo[i]) {continue;}
        var country = countryInfo[i];
        var x = country.topLeft.x;
        var y = country.topLeft.y;
        var hw = null;//null value tells it to start looking at fresh path
        regionID = i;
        var rem = {};
        
        while(true)//break when can't find more borders
        {
            var border = this.getBorderValue(a,width,height,regionID,x,y,hw,rem);
            if (!border){break;}
            country.borders.push(border);
            
            y = border.y;
            x = border.x;
            hw = border.hw;
        }
        //we now have the borders
        
        
    }//going through all countries loop
}
    
    
    /*
     //returns object {x,y,hw},
     //this function finds the next boundary segment given the last one, it starts at hw=null
     hw is the thing that converts a coordinate system for storing squares to a true xy coordinate system
     other function will convert the x,y,hw to true x,y for plotting curves and lines
     
     explanation of how x,y,wh is figured
     *top boundary is x,y,h
      bottom boundary is x,y+1,h
      left boundary is x,y,w
      right boundary is x+1,y,w
      
      example
      |0,0,h|-----|-----|
      |     |     |     |
      0,0,w 1,1,w |     |
      |     |     |     |
      |0,1,h|-----|-----|
      |     |     |     |
      |     |     |     |
      |     |     |     |
      |-----|-----|-----|
      |     |     |     |
      |     |     2,2,w |
      |     |     |     |
      |-----|-----|2,3,h|
      rem is an object which remembers past matches so not to backtrack on path
      x and y is the current position, along with hw
      widht and height is that of the map
      
      This function craws along the boundary, looking at squares based on current position
      
      if hw is h, then it will search these (with p as present position), and return the first match found
      |-----|-----|-----|
      |     |     |     |
      |     3     5     |
      |     |     |     |
      |--1--|--P--|--2--|
      |     |     |     |
      |     4     6     |
      |     |     |     |
      |-----|-----|-----|
      
      
      
      if hw is w, then it will search these (with p as present position), and return the first thing found
      |-----|-----|-----|
      |     |     |     |
      |     1     |     |
      |     |     |     |
      |--5--|--3--|-----|
      |     |     |     |
      |     P     |     |
      |     |     |     |
      |--6--|--4--|-----|
      |     |     |     |
      |     2     |     |
      |     |     |     |
      |-----|-----|-----|
    */
    this.getBorderValue = function(a,width,height,regionID,x,y,hw,rem)
    {
        var index = 0;
        var code = -1;
        var ret = null;
        var key = null;
        var codeHere = null;
        var codeThere = null;
        var otherCountry = null;
        if (x===null || y===null) { return null;}
       
        //looks aournd at cx, cy,
        if (hw===null)//first time for this country, choose first boundary seen
        {
             //sanity check, make sure x,y is regionID
            index = x + (y) * width;
            code = a[index];//only place this var is used
            if (code != regionID) {throw 'code not = to region id in start of border search';}
        
            //look up
            codeHere = -1;
            if (y-1 >= 0 && y-1 < height && x >=0 && x < width)
            {
                index = x + (y-1) * width;
                codeHere = a[index];
            }
                //is there a boundary for this country at this line
            codeThere = -1;
            if (y >= 0 && y < height && x >=0 && x < width)
            {
                index = x  + (y) * width;
                codeThere = a[index];
            }
            if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
            {
                //its a boundary for the region
                otherCountry = (codeThere===regionID)?codeHere:codeThere;
                ret =  {x:x,y:y,hw:'h',c:otherCountry};
                key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                if (!rem[key])//only if not previously noted
                {
                    rem[key]=true;
                    return ret;
                }
                
            }
            //look down
            codeHere = -1;
            if (y+1 >= 0 && y+1 < height && x >=0 && x < width)
            {
                index = x + (y+1) * width;
                codeHere = a[index];
            }
                //is there a boundary for this country at this line
            codeThere = -1;
            if (y >= 0 && y < height && x >=0 && x < width)
            {
                index = x  + (y) * width;
                codeThere = a[index];
            }
            if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
            {
                //its a boundary for the region
               otherCountry = (codeThere===regionID)?codeHere:codeThere;
                ret =  {x:x,y:y+1,hw:'h',c:otherCountry};
                key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                if (!rem[key])//only if not previously noted
                {
                    rem[key]=true;
                    return ret;
                }
                
            }
            
            //look left
            codeHere = -1;
            if (y >= 0 && y < height && x-1 >=0 && x-1 < width)
            {
                index = x-1 + (y) * width;
                codeHere = a[index];
            }
                //is there a boundary for this country at this line
            codeThere = -1;
            if (y >= 0 && y < height && x >=0 && x < width)
            {
                index = x  + (y) * width;
                codeThere = a[index];
            }
            if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
            {
                //its a boundary for the region
               otherCountry = (codeThere===regionID)?codeHere:codeThere;
                ret =  {x:x,y:y,hw:'w',c:otherCountry};
                key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                if (!rem[key])//only if not previously noted
                {
                    rem[key]=true;
                    return ret;
                }
                
            }
            
            //look right
            codeHere = -1;
            if (y >= 0 && y < height && x+1 >=0 && x+1 < width)
            {
                index = x+1 + (y) * width;
                codeHere = a[index];
            }
                //is there a boundary for this country at this line
            codeThere = -1;
            if (y >= 0 && y < height && x >=0 && x < width)
            {
                index = x  + (y) * width;
                codeThere = a[index];
            }
            if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
            {
                //its a boundary for the region
               otherCountry = (codeThere===regionID)?codeHere:codeThere;
                ret =  {x:x+1,y:y,hw:'w',c:otherCountry};
                key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                if (!rem[key])//only if not previously noted
                {
                    rem[key]=true;
                    return ret;
                }
                
            }
            
            throw "cannot find start of path";
            
        }
        else
        {
            //here, x and y does not need to be on the country, it could be beside it
            if (hw==='w')//boundary is on the left side
            {
                /*
                 options to find next boundary is left sides on the squares down and up
                 top side on this square, and the square below
                 top sides on the square to the left, and the square below that
                */
                //left side square down (2)
                codeHere = -1;
                if (y+1 >= 0 && y+1 < height && x >=0 && x < width)
                {
                    index = x + (y+1) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y+1 >= 0 && y+1 < height && x-1 >=0 && x-1 < width)
                {
                    index = x -1 + (y+1) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x,y:y+1,hw:'w',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
                
                
                //left side square up (1)
                codeHere = -1;
                if (y-1 >= 0 && y-1 < height && x >=0 && x < width)
                {
                    index = x + (y-1) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y-1 >= 0 && y-1 < height && x-1 >=0 && x-1 < width)
                {
                    index = x -1 + (y-1) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x,y:y-1,hw:'w',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
                
                //top side of this square (3)
                
                codeHere = -1;
                if (y >= 0 && y < height && x >=0 && x < width)
                {
                    index = x + (y) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y-1 >= 0 && y-1 < height && x >=0 && x < width)
                {
                    index = x + (y-1) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x,y:y,hw:'h',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
                
                
                //top side of square below this one (4)
                
                codeHere = -1;
                if (y >= 0 && y < height && x >=0 && x < width)
                {
                    index = x + (y) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y+1 >= 0 && y+1 < height && x >=0 && x < width)
                {
                    index = x + (y+1) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x,y:y+1,hw:'h',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
                
                //top side of square to the left (5)
                 codeHere = -1;
                if (y >= 0 && y < height && x-1 >=0 && x-1 < width)
                {
                    index = x-1 + (y) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y-1 >= 0 && y-1 < height && x-1 >=0 && x-1 < width)
                {
                    index = x - 1+ (y-1) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x-1,y:y,hw:'h',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
                
                //top side of square to the bottom left (6)
                  codeHere = -1;
                if (y+1 >= 0 && y+1 < height && x-1 >=0 && x-1 < width)
                {
                    index = x-1 + (y+1) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y >= 0 && y < height && x-1 >=0 && x-1 < width)
                {
                    index = x - 1 +(y) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x-1,y:y+1,hw:'h',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
               //nothing found, end of path
                    return null;
                
            }
            if (hw ==='h')
            {
                /*
                 options to find next boundary is top sides on the squares to the left and right
                 left sides on this square the the one above it
                 left sides on the square to the right and the one above it
                 
                */
                
                //cell to left top (1)
                codeHere = -1;
                if (y >= 0 && y < height && x-1 >=0 && x-1 < width)
                {
                    index = x-1 + (y) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y-1 >= 0 && y-1 < height && x-1 >=0 && x-1 < width)
                {
                    index = x - 1 +(y-1) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x-1,y:y,hw:'h',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
                
                //cell to right top (2)
                codeHere = -1;
                if (y >= 0 && y < height && x+1 >=0 && x+1 < width)
                {
                    index = x+1 + (y) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y-1 >= 0 && y-1 < height && x+1 >=0 && x+1 < width)
                {
                    index = x + 1 +(y-1) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x+1,y:y,hw:'h',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
                
                //left side of the cell up (3)
                 codeHere = -1;
                if (y -1>= 0 && y -1< height && x >=0 && x < width)
                {
                    index = x + (y-1) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y-1 >= 0 && y-1 < height && x-1 >=0 && x-1 < width)
                {
                    index = x - 1 + (y-1) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x,y:y-1,hw:'w',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
                
                
                //this cell left (4)
                 codeHere = -1;
                if (y >= 0 && y < height && x >=0 && x < width)
                {
                    index = x + (y) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y >= 0 && y < height && x-1 >=0 && x-1 < width)
                {
                    index = x - 1 + (y) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x,y:y,hw:'w',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
                
                //cell up and right, on the lett (5)
                 codeHere = -1;
                if (y-1 >= 0 && y-1 < height && x+1 >=0 && x+1 < width)
                {
                    index = x+1 + (y-1) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y-1 >= 0 && y-1 < height && x >=0 && x < width)
                {
                    index = x  + (y-1) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x+1,y:y-1,hw:'w',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
                
                //cell to the right, left side of it
                codeHere = -1;
                if (y >= 0 && y < height && x+1 >=0 && x+1 < width)
                {
                    index = x+1 + (y) * width;
                    codeHere = a[index];
                }
                    //is there a boundary for this country at this line
                codeThere = -1;
                if (y >= 0 && y < height && x >=0 && x < width)
                {
                    index = x  + (y) * width;
                    codeThere = a[index];
                }
                if (codeHere!=codeThere && (codeHere===regionID ||codeThere=== regionID))
                {
                    //its a boundary for the region
                   otherCountry = (codeThere===regionID)?codeHere:codeThere;
                    ret =  {x:x+1,y:y,hw:'w',c:otherCountry};
                    key = "x"+ret.x+"y"+ret.y+":"+ret.hw;
                    if (!rem[key])//only if not previously noted
                    {
                        rem[key]=true;
                        return ret;
                    }
                    
                }
                
                
               //nothing found, end of path
                return null; 
                
            }//end h
           throw "last arg is not w or h"; 
        
        }//end else test for w or h
        throw "should never get here";
    }//end of function
    
    
    this.convertPathData= function(countryInfo,cellSpacing,startY,startX)
    {
        
        for(var key = 0; key < countryInfo.length; key++)
        {
            
            if (!countryInfo[key]) {continue;}
            var country = countryInfo[key];
            var pathData = country.borders;
            var convertedPathData = [];
            //convert data to quadratic curves,
            //each data make midpoint of its segment
            //control point is corner of square between the two points
            for(var i=0; i <pathData.length; i++)
            {
                var node = pathData[i];
                if (i === pathData.length -1)//if last one
                {
                    var nodeNext = pathData[0];
                }
                else
                {
                    var nodeNext = pathData[i+1]
                }
                //convert each node to a real point
                var x = node.x;
                var y = node.y;
                var hw = node.hw;
                var xNode = x * cellSpacing + startX;
                var yNode = y * cellSpacing + startY;
                xNode += hw==='h'? Math.floor(cellSpacing/2):0;
                yNode += hw==='w'? Math.floor(cellSpacing/2):0;
                hwNode = hw;
                
                 x = nodeNext.x;
                 y = nodeNext.y;
                 hw = nodeNext.hw;
                var xNextNode = x * cellSpacing + startX;
                var yNextNode = y * cellSpacing + startY;
                xNextNode += hw==='h'? Math.floor(cellSpacing/2):0;
                yNextNode += hw==='w'? Math.floor(cellSpacing/2):0;
                hwNextNode = hw;
                
                var xDiff = nodeNext.x - node.x;
                var yDiff = nodeNext.y - node.y;
                var control = null;
                var TL = {x:node.x * cellSpacing + startX,y: node.y * cellSpacing + startY};
                var TR = {x:(node.x+1) * cellSpacing + startX,y: node.y * cellSpacing + startY};
                var BL = {x:node.x * cellSpacing + startX,y:( node.y+1) * cellSpacing + startY};
                if (hwNode=='w')
                {
                   if(xDiff ===0 & yDiff===0 && hwNextNode==='h'){ control = TL;}
                   if(xDiff ===0 & yDiff===1 && hwNextNode==='h'){ control = BL;}
                   if(xDiff ===-1 & yDiff===0 && hwNextNode==='h'){ control = TL;}
                   if(xDiff ===-1 & yDiff===1 && hwNextNode==='h'){ control = BL;}
                   if(xDiff ===0 & yDiff===1 && hwNextNode==='w'){ control = BL;}
                   if(xDiff ===0 & yDiff===-1 && hwNextNode==='w'){ control = TL;}
                }
                if (hwNode=='h')
                {
                    if(xDiff ===0 & yDiff===0 && hwNextNode==='w'){ control = TL;}
                    if(xDiff ===1 & yDiff===0 && hwNextNode==='w'){ control = TR;}
                    if(xDiff ===0 & yDiff===-1 && hwNextNode==='w'){ control = TL;}
                    if(xDiff ===1 & yDiff===-1 && hwNextNode==='w'){ control = TR;}
                    if(xDiff ===-1 & yDiff===0 && hwNextNode==='h'){ control = TL;}
                    if(xDiff ===1 & yDiff===0 && hwNextNode==='h'){ control = TR;}
                }
                if (!control)
                {
                    throw "could not find control pint";
                }
                var curve = {};
                curve.start = {x:xNode,y:yNode};
                curve.finish = {x:xNextNode,y:yNextNode};
                curve.control = control;
                curve.border = node.c; //what it is bordering
                
                
                convertedPathData.push(curve);
                
            }
            country.borderQuads = convertedPathData;
        }
    }
    

 }   
   
    
