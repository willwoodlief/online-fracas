var startX = 5;
var startY = 5;
var cellSpacing = 60;
var a=new Array(100);
var WATER_ID = 1000000;

var mapColors = {0:'white',1:'orange',2:'yellow',3:'cyan',1000000:'green'};
var map = {};
var countryInfo = null;
 var rem = {};
 var lastPush = null;
 var regionID = WATER_ID;

 var lastBorderDrawn = null;
 var bCanEditMap = true;
 var prep = new prepDrawMap();

function testLogic()
{
     var canvas = document.getElementById("testme");
     for(var i=0; i < 100; i++)
     {
        a[i]=WATER_ID;
     }
     fillBackground(canvas);
     if (supports_html5_storage())
     {
        var stored = window.localStorage['testme.array']
        var saved = jQuery.parseJSON(stored);
        if (saved)
        {
            for(var x=0; x < 10; x++)
            {
                for(var y =0; y < 10; y++)
                {
                    var ind = x + 10 * y;
                    a[ind]=saved[ind];
                }
               
            
            }
            drawAllCells(canvas);
        }
     }
    
    $("#testme").click(function(e){
                            if (!bCanEditMap) { return;}
                            var canvas = document.getElementById('testme'),
                                x = e.pageX - canvas.offsetLeft,
                                y = e.pageY - canvas.offsetTop;
                                x = Math.floor((x-0)/cellSpacing);
                                y = Math.floor((y-0)/cellSpacing);
                                if (x >= 10 || y >= 10) {return;}
                                var index = x + y * 10;
                                a[index] = regionID ;
                                drawSquare(canvas,x,y);
                                if (supports_html5_storage())
                                {
                                    var json= JSON.stringify(a);
                                    window.localStorage['testme.array'] = json;
                                }
                            

   });
    
    drawGrid(canvas);
    
    $("#one-step").button();
    $("#one-step").click(function(e){
        
        while (!countryInfo[regionID])
           {
            regionID++;
            if (regionID>=4)
            {
                $("#instructions").html("<h3>finished all countries</h3>");
                if (!countryInfo[0].borderQuads) //test for quads
                {
                    prep.convertPathData(countryInfo,cellSpacing,startY,startX,map);
                    $("#draw-curves").button('option', 'disabled', false);
                    $("#one-step").button('option', 'disabled', true);
                }
                return;
            }
           }
                            
        lastPush = prep.testWalkWithBorders(map,countryInfo,regionID,lastPush,rem)    ;
        if (lastPush)
        {
            drawBorder(canvas,lastPush.x,lastPush.y,lastPush.hw);
        }
        else
        {
           $("#instructions").html("<h3>finished path</h3><br>For country "+regionID);
           
           rem = {};
           regionID++;
           while (!countryInfo[regionID])
           {
            regionID++;
            if (regionID>=4)
            {
                $("#instructions").html("<h3>finished all countries</h3>");
                
                return;
            }
           }
           
           
                            
        }

   });
    $("#one-step").button('option', 'disabled', true);
    
     $("#setup-country").button();
    $("#setup-country").click(function(e){
            //setup fake map object                
        map.mapdata = a;
        map.setup = {};
        map.setup.width = 10;
        map.setup.height = 10;
         
         map.WATERBODY_START = WATER_ID-2;
         countryInfo = null;
         rem = {};
         lastPush = null;
         regionID = 0;
         countryInfo= prep.setupCountryInfo(map);
         
         drawGrid(canvas);
         for(var key in countryInfo)
         {
            var country = countryInfo[key];
            var startDotX = country.topLeft.x;
            var startDotY = country.topLeft.y;
            drawStartDot(canvas,startDotX,startDotY);
         }
         
         
         $("#one-step").button('option', 'disabled', false);
         bCanEditMap = false;
         $("#instructions").html("Press Do One button to single step each border finding thing.Refresh to re-edit map or start again.");
         $("#setup-country").button('option', 'disabled', true);
         $( "#choose-which-country" ).buttonset('option', 'disabled', true);

   });
    
    $("#instructions").html("Click on the squares to make a country, then press Seetup Country");
    $("#setup-country").button('option', 'disabled', false);
    $( "#choose-which-country" ).buttonset();
    $( "#choose-which-country" ).buttonset('option', 'disabled', false);
    $( "#country-1" ).button()
			.click(function() {
				 regionID = 0;
                                 
			});
    $( "#country-2" ).button()
			.click(function() {
			    regionID = 1;
                                 
			});
    $( "#country-3" ).button()
			.click(function() {
                            regionID = 2;
                                	
			});
    $( "#country-4" ).button()
			.click(function() {
                            regionID = 3;
                                 
			});
    $( "#ocean" ).button()
			.click(function() {
                            regionID = WATER_ID;
                            
			});
    //drawStartDot(canvas,3,1);
   //drawBorder(canvas,10,9,'w');
   $("#ocean").attr("checked","checked").button('refresh');
   
   $("#draw-curves").button()
			.click(function() {
                            drawCurves(canvas);
                             $("#draw-counties").button('option', 'disabled', false);
                             $("#draw-curves").button('option', 'disabled', true);
                            
                        }).button('option', 'disabled', true);;

   
   
   $("#draw-counties").button()
			.click(function() {
                            drawShapes(canvas);    
                            
                        }).button('option', 'disabled', true);;
    
    
   
   
}



function supports_html5_storage()
{
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
}

function fillBackground(canvas)
{
    var canHeight = canvas.height;
    var canWidth = canvas.width;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "green";
    ctx.fillRect(0,0,canWidth,canHeight);
    
      
    
}

function drawStartDot(canvas,x,y)
{
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "purple";
    var cellStartX = x * cellSpacing + 2*startX +20;
    var cellStartY = y * cellSpacing + 2*startY + 20;
    var radius = 10;
    ctx.beginPath();
    ctx.arc(cellStartX, cellStartY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = "purple";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "purple";
    ctx.stroke();
}

function drawSquare(canvas,x,y)
{
    var index = x + y * 10;
    var id = a[index];
    var color = mapColors[id];
    if (!color) {throw "unknown color";}
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
   
    var cellStartX = x * cellSpacing + 2*startX ;
    var cellStartY = y * cellSpacing + 2*startY;
    
    ctx.fillRect(cellStartX,cellStartY,cellSpacing - 2*startX,cellSpacing - 2*startY);
}

function drawAllCells(canvas)
{
    for(var x=0; x < 10; x++)
    {
        for(var y =0; y < 10; y++)
        {
            drawSquare(canvas,x,y);
        }
       
    
    }
}

function drawGrid(canvas)
{
    var canHeight = canvas.height;
    var canWidth = canvas.width;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.lineWidth = 10;
    ctx.beginPath();
    //draw a ten by ten grid (600/10 = 60)
    for(var i = 0; i <= 10; i++)
    {
        ctx.moveTo(startX + (i*cellSpacing),0);
        ctx.lineTo(startX + (i*cellSpacing),canHeight);
    }
    
    for( i = 0; i <= 10; i++)
    {
        ctx.moveTo(0,startY + (i*cellSpacing));
        ctx.lineTo(canWidth,startY + (i*cellSpacing));
    }
    ctx.strokeStyle = 'RGB(200,200,200)';
    ctx.lineJoin = "round";
    ctx.stroke();
}

function drawBorder(canvas,x,y,hw)
{
    function internalDrawBorder(x,y,hw,color)
    {
        var ctx = canvas.getContext("2d");
        ctx.lineWidth = 10;
        var cellStartX = x * cellSpacing + startX;
        var cellStartY = y * cellSpacing + startY;
        if (hw=='w')
        {
            //draw left side of cell
            //draw a line from startx,starty to startx,starty + cellspacing
            ctx.beginPath();
            ctx.moveTo(cellStartX,cellStartY);
            ctx.lineTo(cellStartX,cellStartY + cellSpacing);
            ctx.strokeStyle = color;
            ctx.lineJoin = "round";
            ctx.lineCap = 'round'
            ctx.stroke();
            return;
        }
        
        if (hw=='h')
        {
            //draw top side of cell
            //draw a line from startx,starty to startx,starty + cellspacing
            ctx.beginPath();
            ctx.moveTo(cellStartX,cellStartY);
            ctx.lineTo(cellStartX+ cellSpacing,cellStartY );
            ctx.strokeStyle = color;
            ctx.lineJoin = "round";
            ctx.lineCap = 'round'
            ctx.stroke();
            return;
        }
        
         throw "is not w or h";
    }
    
    internalDrawBorder(x,y,hw,'red');
    
    var remMeNow = {x:x,y:y,hw:hw};
    
    if (lastBorderDrawn)
    {
        x = lastBorderDrawn.x;
        y = lastBorderDrawn.y;
        hw = lastBorderDrawn.hw;
        internalDrawBorder(x,y,hw,'blue');
    }
    
    lastBorderDrawn = remMeNow;
    
   
}

function drawCurves(canvas)
{
     for(var i = 0; i < countryInfo.length; i++)
    {
        if (!countryInfo[i]) {continue;}
        drawCurvesForCountry(canvas,i);
    }
}

function drawCurvesForCountry(canvas,id)
{
    if (! countryInfo[id].borderQuads) {throw "could not find quads for id " + id}
    var quads = countryInfo[id].borderQuads;
    
    
    var ctx = canvas.getContext("2d");
    
    ctx.strokeStyle = "pink";
    ctx.lineWidth = 4;
     var radius = 5;
    //context.moveTo(188, 150);
        //context.quadraticCurveTo(288, 0, 388, 150);
        
        //draw a pink dot for each start point
     for(var i = 0; i < quads.length; i++)
     {
        var q = quads[i];
        var start = q.start;
        var control = q.control;
        var end = q.finish;
        
        ctx.beginPath();
        
        ctx.moveTo(start.x,start.y);
        ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        
        ctx.beginPath();
        ctx.fillStyle = "pink";
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI, false);
        
       
        ctx.fill();
        
        
        ctx.beginPath();
        ctx.fillStyle = "brown";
        ctx.arc(control.x, control.y, radius, 0, 2 * Math.PI, false);
         ctx.fill();
     }
        
}

function drawShapes(canvas)
{
   
    //fill out
    fillBackground(canvas);
     for(var i = 0; i < countryInfo.length; i++)
    {
        if (!countryInfo[i]) {continue;}
        drawShapeForCountry(canvas,i);
    }
    
}

function drawShapeForCountry(canvas,id)
{
    if (! countryInfo[id].borderQuads) {throw "could not find quads for id " + id}
    var quads = countryInfo[id].borderQuads;
    
    
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    
    for(var i = 0; i < quads.length; i++)
    {
       
        var q = quads[i];
        var start = q.start;
        var control = q.control;
        var end = q.finish;
        
        
        if (i===0)
        {
            ctx.moveTo(start.x,start.y);
        }
        ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
    
    }
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.fillStyle = mapColors[id];
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
    
    
    

      
}

