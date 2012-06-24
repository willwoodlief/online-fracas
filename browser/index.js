/*
 don't forget to save the map when events are unloading the window
 function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

for (var key in localStorage){
   console.log(key, " = ", localStorage[key]);
}

 RangeError
 ReferenceError
 TypeError
*/

//the one and only global variable
var mainObj = null;

function moveTroopsInterface()
{
   this.troops; //total number of troops to move
   this.show= function(troops){} ; //it will show with the troops to move
   this.hide= function() {}; //hides the control
}

//base class for the map drawing class

function drawMapInterface()
{
            //the html5 canvas we are drawing on
   this.canvas  = null;
   //game will control the map
   this.game = null;
   //a click handler will be called with the params id of the country or water, and bool true if left click
   this.clickHandler = null;
   
   //the drawing class
    this.drawingClass = null;
    this.setDrawingClass = function(draw)
    {
        this.drawingClass = draw;
    }
    
    this.setGame = function(game)
    {
        this.game = game;
        this.drawingClass.setGame(game);
        
    }
    
    this.setMap = function(map) {} //for doing the minimap in setting preview
    
    this.setCanvas = function(canvas)
    {
        this.canvas = canvas;
        this.drawingClass.setCanvas(canvas);
    }
   
   //used to draw the whole map for initial or refresh, if scale is true, streches map to fit
   this.drawMap = function()/*{scale:boolean default false}*/
   {
        this.drawingClass.game = this.game;
        this.drawingClass.canvas = this.canvas;
        this.drawingClass.drawMap();
    }
    
    this.setBorderSize=function(size) {}
   this.flashCountry =function (countryID){}
   this.flashCountryAndNeighbors =function (countryID){}
   this.updateCountry = function(countryID) {}
   this.changeCountryColor = function(regionID,color)
   {
       this.drawingClass.changeCountryColor(regionID,color);
   }
   
   this.unsetGame = function()
   {
      this.drawingClass.drawBlank();
      this.drawingClass.game = null;
      
      this.clickHandler=null;
      this.game=null;
      $(this.canvas).off('click');
      $(this.canvas).off('contextmenu');
      
      this.canvas = null;
   }
}

function drawCountryInfo()
{
    this.canvas  = null;
    //game will control the map
    this.game = null;
    
    
    //shows the info
    this.showInfo =function (regionID){}//regionID null will blank it out (0 is a valid region id)
    this.initialize = function() {}
}


/*
  the way to access the gui, this is not an interface or mixin, but the actual way to do it
  params is an object {mapcanvas: the canvas to the main map,
                        drawMapInterface: the object that draws the map, also does the effects
                        playerCanvas: the canvas to the players,
                        infoCanvas: the canvas to the info pane,
                        drawCountryInfo: the object that draws the info gui
                        infoGUI : the object that draws the info
                        troopMoveControl: the interface to the troop movement,
                        commands: an array of objects for doing the command button
                                    {internal command name,external name,function callback},
                        
                        }
                        the chat control is not controlled or used by the game gui
*/
function guiHandler(params)
{
            //draws the map on to the canvas
  this.gui = params;
  this.game = null;
  this.setGame= function(game)
  {
        this.game = game;
        this.gui.drawMapInterface.setCanvas(this.gui.mapcanvas);
        this.gui.drawMapInterface.setGame(this.game);
        this.gui.drawMapInterface.drawingClass.clickHandler = this.gui.drawMapInterface.clickHandler;
        this.gui.drawMapInterface.drawMap();
       // this.gui.drawCountryInfo.canvas = this.gui.infoCanvas;
       // this.gui.drawCountryInfo.game = this.game;
       // this.gui.drawCountryInfo.initialize();
  }
  
  this.unsetGame = function()
  {
    this.gui.drawMapInterface.unsetGame();
  }
  
  
  
  
}


  /*
 basic implementation of the game controller class,
 it knows enough to save the game setup information and to call the right
 descendant when the game starts. 
*/


function GameControllerInterface()
{
            /*starts the game by calling and initializing and returning
            the right type of game controller
            */
     this.startGame = function()
     {
            if (this.gameType == 'solo')
            {
                var gamer= new SoloGameController(this.game,this.gui);
                gamer.startGame();
                return gamer;
            }
            throw new SyntaxError('invalid type of game. got '+gameType);
     }
     this.gameType = 'none'; //none,solo,rankedSolo,multiplayer
      
     //set game to be used
      this.game = null;
      //sets the gui interface
      this.gui = null;
      
}

function SoloGameController(game,gui) //uses GameControllerInterface
{
      //set game to be used
      this.game = game;
      //sets the gui interface
      this.gui = gui;
      var that = this;
      this.onClickCountry = function(regionID,bLeftClick)
     {
            if (!bLeftClick && that.gui.drawCountryInfo)
            {
               that.gui.drawCountryInfo.showInfo(regionID);
            }
            else
            {
                if ( bLeftClick)
                {
                    that.gui.gui.drawMapInterface.changeCountryColor(regionID, {r:128,g:0,b:0});
                }
            }
     }
     
     this.startGame = function()
     {
            //starts the gui
            if (this.gui.gui.drawMapInterface) {
                this.gui.gui.drawMapInterface.clickHandler = this.onClickCountry;
            }
            this.gui.setGame(this.game);
     }
     this.gameType = 'basic'; //basic,singlePlayer,rankedSolo,multiplayer
      
     
     
     this.currentCommand = function()
     {
        alert('the current command for the controller');
     }
     
     this.saveGameAs = function()
     {
        mainObj.SaveGameAs();
     }
     
     this.saveGame = function()
     {
        mainObj.SaveGame();
     }
     
     this.restartGame = function()
     {
        alert('controller restarting game');
     }
     
     
     this.endGame = function()
     {
        this.gui.unsetGame();
        this.game = null;
     }
}

/*the game object, holds all data for the game, but does not do anything else
*/
function game()
{
   this.map = null;
   this.type='online fracas';
   this.playing = 'playing not set';
   this.version = 0.1;
   this.saveInfo = {};
   this.saveInfo.name = '';
   this.saveInfo.comments = '';
   this.saveInfo.date = null;
   this.meta = {};
   this.meta.created = new Date();
}

/*the load and store object,
 local storage structure facas.games.game name
*/

function gameStorage()
{
            this.game = null;
            this.currentName = '';
            this.currentComments = '';
            this.htmlDialog = '';
            this.saveNameEditBox='';
            this.saveCommentsEditBox='';
            
            
            
}



gameStorage.prototype.supports_html5_storage=function ()
{
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
}

gameStorage.prototype.setupDialogBox=function ()
{
     if (!this.htmlDialog || !this.saveNameEditBox || !this.saveCommentsEditBox) {
        throw new TypeError('save as dialog box not set');
    }
    this.htmlDialog.dialog({
            autoOpen: false,
            height: 350,
            width: 500,
            modal: true,
            buttons: {
                    "Save Game": function() {
                            $( this ).dialog( "close" );
                            
                            var name = mainObj.gameStorage.saveNameEditBox.val();
                            var comments = mainObj.gameStorage.saveCommentsEditBox.val();
                            mainObj.gameStorage.saveGame(name,comments);
                            mainObj.loadGameList();
                            mainObj.setup.putLoadNamesInDialog();
                            
                    },
                    Cancel: function() {
                            $( this ).dialog( "close" );
                    }
            },
            close: function() {
                    
            }
    });
}

gameStorage.prototype.save =function ()
{
    if (!this.currentName) {//show dialog box
        this.saveAs();
    }
    else {
        this.saveGame(this.currentName,this.currentComments);
    }
}

gameStorage.prototype.saveAs = function () {
    if (!this.htmlDialog) {
        throw new TypeError('save as dialog box not set');
    }
    this.htmlDialog.dialog( "open" );
    
}

//returns an empty array if no list, else returns array of objects
//name, comments, date saved
gameStorage.prototype.getListOfSavedGames = function ()
{
    if (!this.supports_html5_storage()) {return [];}
    
    //get directory of locally stored games
    var directoryjson = window.localStorage["fracas.saved"];
    var dir = [];
    if (directoryjson) {
        var dir = jQuery.parseJSON(directoryjson);
    }
    return dir;
}

gameStorage.prototype.writeListOfSavedGames = function(dir)
{
    var dirs = JSON.stringify(dir);
    window.localStorage["fracas.saved"]= dirs;
}

gameStorage.prototype.deleteSavedGame= function(name)
{
    var zip = window.localStorage["fracas.games."+name];
    if (!zip) {return;}//nothing ventured, nothing gamed ! heeheh
    //delete game from local storage
    window.localStorage.removeItem("fracas.games."+name);
    //remove game from directory
    var dir = this.getListOfSavedGames();
    var newDir = [];
    for(var i=0; i < dir.length; i++)
    {
        var entry = dir[i];
        if (entry.name != name)
        {
           newDir.push(entry); 
        }
    }
    
    
    this.writeListOfSavedGames(newDir);
}

gameStorage.prototype.gameStateToString= function()
{
    var json= JSON.stringify(this.game);
    var zip = new JSZip();
    zip.file('fracas', json);
    
    content = zip.generate({compression:"DEFLATE"});/**/
    return content; //returns the json as a base64 zip 
}

//same name will be saved over itself
gameStorage.prototype.saveGame = function(name,comments)                                        
{
    var re = /<[^>]*>?/g;
    var r2 = /["']/g;
    name = name.replace(re,' ');
    name = name.replace(r2,' ');
    comments = comments.replace(re,' ');
    comments = comments.replace(r2,' ');
    
    this.currentName = name;
    this.currentComments = comments;
    this.game.saveInfo = {}
    this.game.saveInfo.name = name;
    this.game.saveInfo.comments = comments;
    var date = new Date();
    this.game.saveInfo.date = date;
    
    this.game.saveInfo.zip  = this.gameStateToString();
    
    //store to local storage
    if (!this.supports_html5_storage()) {return;}
    window.localStorage["fracas.games."+name]=this.game.saveInfo.zip;
    //update directory of locally stored games
    
    var dir = this.getListOfSavedGames();
    var newDir = [];
    for(var i=0; i < dir.length; i++)
    {
        var entry = dir[i];
        if (entry.name != name)
        {
           newDir.push(entry); 
        }
    }
    
    var dob = {name:name, comments:comments, date:date};
    newDir.push(dob);
    this.writeListOfSavedGames(newDir);
    
}

gameStorage.prototype.getGameFromString = function (zip)
{
    
    if (!zip) { throw new ReferenceError('empty string for loading game');}
    var obj = this.stringToGameState(zip);
    var newGame = this.setUpGameObject(obj);
    return newGame;
}

gameStorage.prototype.getGameFromName = function (name)
{
    var zip = window.localStorage["fracas.games."+name];
    if (!zip) { throw new RangeError('game is not saved under '+name);}
    
    var newGame = this.getGameFromString(zip);
    return newGame;
}

gameStorage.prototype.setUpGameObject = function(obj)
{
    //restore functions
    
    //restore map
    var map = new AveMap(false);
    map.attachData(obj.map);
    obj.map = map;
    
    return obj;
}

//expects a base64 encoded zip of json format
gameStorage.prototype.stringToGameState= function(data)
{
            try
            {
                        var zip = new JSZip(data,{base64:true,checkCRC32:true });
            }
            catch(e)
            {
                        alert('cannot load file: '+e.message);
                        return null;
            }
        
        var golums = zip.file("fracas").asText();
        var obj = jQuery.parseJSON(golums);
        //limit name and comments to 100 each, for safety
        obj.saveInfo.name = obj.saveInfo.name.substring(0,100);
        obj.saveInfo.comments = obj.saveInfo.comments.substring(0,100);
        return obj;

}


function mainClass()
{
    //setup html things
      //game storage
    this.gameStorage = new gameStorage();
    
    this.gameStorage.htmlDialog = $("#dialog-save-game");
    this.gameStorage.saveNameEditBox=$("#save-name");
    this.gameStorage.saveCommentsEditBox=$("#save-comments");
    this.gameStorage.setupDialogBox();
    //this is for the load dialog box so it can save state
    this.savedLoadName = {};
    //stores all of the saved games,refreshed every time title screen is seen or dialog box is refreshed
    this.loadObj = {};
    //another way of saving the directory of saved games, so other objects can build thier own lists
    this.savedGameDir = {};
    
    
    
   //this is where the game class is set and reset, all creatues get the game from this
   this.theGame = null;
   
   //the game controller is the heart after the game starts
   this.gameController = null;
   
   
   
   //sets the drawing class for the whole game
    
    
    this.getDrawMapInterface = function()
    {
        var draw = this.getDrawingClass();
        var ii= new drawMapInterface();
        ii.setDrawingClass(draw);
        return ii;
    }
    
    //setup the gui interface
    this.drawMapInterface = this.getDrawMapInterface(); 
    var links = {mapcanvas: document.getElementById("gamemap"), drawMapInterface:this.drawMapInterface};
    this.gui = new guiHandler(links);
    
    //starts a new game
    this.initNewGame= function(map,typegame)
    {
        
        var agame = new game();
        
        agame.map = map;
        agame.playing = typegame;
        this.beginGame(agame);
        
    }
    
    this.beginGame = function(game)
    {
        this.theGame = game;
        $("#intro").hide();
        $("#game").show();
        this.gameStorage.game = game;
        
    
        if (game.saveInfo.name)
        {
            this.gameStorage.currentName = game.saveInfo.name;
            this.gameStorage.currentComments = game.saveInfo.comments;
        }
        
        var controller = new GameControllerInterface();
        controller.game = game;
        controller.gameType = game.playing;
        controller.gui = this.gui;
        this.gameController = controller.startGame();
        
    }
    
    this.SaveGame = function ()
    {
        this.gameStorage.save();    
    }

    this.SaveGameAs = function()
    {
        this.gameStorage.saveAs();
    }

    this.NewGame = function()
    {
       $( "#dialog-confirm-new-game" ).dialog( "open" );         
                          
    }

    
    
    this.endGame = function ()
    {
        $("#game").hide();
        this.gameController.endGame();
        this.gameController = null;
        this.theGame = null;
        this.gameStorage.game = null;
        this.gameStorage.currentName = '';
        this.gameStorage.currentComments = '';
        
            
        $("#intro").show();
        this.loadGameList();
        this.setup.putLoadNamesInDialog();
    }
    
    this.getMessageString = function(lookup)
    {
        var t = $(".translation > span[id="+lookup+"]").attr('title');
        return t;
    }
    
    this.loadSavedGame = function(name)
    {
        var game = this.gameStorage.getGameFromName(name);
        if (!game) { return; }
        
        this.beginGame(game);
        
    }
    
    
    
    this.ShowSaveString = function()
    {
        
        if (this.theGame.saveInfo.name)
        {
            //try to make string most recent
            this.gameController.saveGame();
        }
        else
        {
            alert(this.getMessageString("save-first"));
            this.gameController.saveGame();
            return;
            
        }
        if (this.theGame.saveInfo.zip) {
            $( "#dialog-did-save" ).dialog("open");
        }
    }
    
    this.hideRestartOption = function(value) { !value ? $("#restart-option").show() : $("#restart-option").hide() }
    
    this.setupMain = function()
    {
            
        $("#click-for-load-dialog").button().click(function() {
				$( "#dialog-load-manager" ).dialog("open");;
			})
        $( "#game-command" )
			.button()
			.click(function() {
				mainObj.gameController.currentCommand();
			})
			.next()
				.button( {
					text: false,
					icons: {
						primary: "ui-icon-triangle-1-s"
					}
				})
				.click(function() {
				    $('#btnSaveExtraOptions').toggle();

                                    var btnLeft = $('#my-button-holder').offset().left-$('#game-buttons').offset().left
                                   - $('#my-button-holder').css('padding-left');
                                    var btnTop = $('#my-button-holder').offset().top + $('#divSaveButton').outerHeight()
                                    - $('#my-button-holder').css('padding-top');
                                    var btnWidth = $('#my-button-holder').outerWidth();
                                    $('#btnSaveExtraOptions').css('left', btnLeft).css('top', btnTop);
				});
				
				$(".buttonset").buttonset();
                                
       $('#btnSaveExtraOptions li').addClass('ui-corner-all ui-widget');
        $('#btnSaveExtraOptions li').hover(
            function () { $(this).addClass('ui-state-default'); },
            function () { $(this).removeClass('ui-state-default'); }
        );
        $('#btnSaveExtraOptions li').mousedown(function () { $(this).addClass('ui-state-active'); });
        $('#btnSaveExtraOptions li').mouseup(function () { $(this).removeClass('ui-state-active'); });

           this.hideRestartOption(false);
           
           $( "#dialog-confirm-new-game" ).dialog({
			autoOpen: false,
			height: 200,
			width: 320,
			modal: true,
			buttons: {
				"Start New Game": function() {
					$( this ).dialog( "close" );
                                        
                                        mainObj.endGame();
                                        
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			},
			close: function() {
				
			}
		});
           
           
           
           
           
           $( "#dialog-did-save" ).dialog({
			autoOpen: false,
			height: 400,
			width: 400,
			modal: true,
			buttons: {
				
				Ok: function() {
					$( this ).dialog( "close" );
				}
			},
			close: function() {
				
			},
                        open: function(event, ui){
                          $("#save-string-show").text(mainObj.theGame.saveInfo.zip);
                        }
		});
           
           
           
           
           $( "#dialog-load-manager" ).dialog({
			autoOpen: false,
			height: 400,
			width: 400,
			modal: true,
			buttons: {
				"Delete": function() {
                                       // mainObj.deleteSave();
                                        if (mainObj.savedLoadName.p && !mainObj.savedLoadName.paste)
                                        {
                                                mainObj.gameStorage.deleteSavedGame(mainObj.savedLoadName.name);
                                                mainObj.savedLoadName.p.remove();
                                                mainObj.loadGameList();
                                                mainObj.setup.putLoadNamesInDialog();
                                        };
                                        
				},
                                "Load": function() {
                                       // mainObj.deleteSave();
                                       if (mainObj.savedLoadName.p )
                                       {
                                           $( this ).dialog( "close" );
                                           if (!mainObj.savedLoadName.paste)
                                           {
                                              mainObj.loadSavedGame(mainObj.savedLoadName.name);
                                           }
                                           else
                                           {
                                              var t = $("#zip-show-saved-game").val();
                                              
                                              var game = mainObj.gameStorage.getGameFromString(t);
                                              mainObj.beginGame(game);
                                              
                                           }
                                       }
                                        
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			},
			close: function() {
				
			},
                        open: function() {
                                    
                        }
		});
           
           /* add list of these to div,
             have loadObj to store the zips,comments and date to under the key name
             loadObj has key for string-custom-load-123 where the comments are the instructions
             <p title='string-custom-load-123' id="generate-load" class='load'>Paste Text To Load</p>
            <p title='avery and will' class='load'>Avery</p>
	  <p title='will' class='load'>Will</p>
           */
           $("#list-saved-games").on("click", "p", mainObj.loadObj,function(){
                        if (mainObj.savedLoadName.p) {mainObj.savedLoadName.p.toggleClass("hilite");}
                        $(this).toggleClass("hilite");
                        mainObj.savedLoadName.p = $(this);
                        mainObj.savedLoadName.name = $(this).attr("title");
                        var id = $(this).attr("id");
                        if (id==="generate-load" )
                        {
                            mainObj.savedLoadName.name = 'load zip direct';
                             $("#zip-show-saved-game").removeAttr('readonly');
                             if (!mainObj.savedLoadName.paste)
                             {
                                $("#zip-show-saved-game").toggleClass("textarea-active");
                             }
                             mainObj.savedLoadName.paste = true;
                             
                        }
                        else
                        {
                            
                            $("#zip-show-saved-game").attr('readonly','readonly');
                            if (mainObj.savedLoadName.paste)
                             {
                                $("#zip-show-saved-game").toggleClass("textarea-active");
                             }
                             mainObj.savedLoadName.paste = false;
                             
                        }
                        
                        //put in comments and date and zip
                        var comments = mainObj.loadObj[mainObj.savedLoadName.name].comments;
                        var mils = mainObj.loadObj[mainObj.savedLoadName.name].mils;
                        if (mils > 0)
                        {
                        var aDate = new Date(mils);
                        var dateString = aDate.toLocaleDateString() + " " + aDate.toLocaleTimeString();
                        }
                        else
                        {
                            dateString="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                        }
                        
                       $("#date-save").html(dateString);
                       $("#comment-save").text(comments);
                       
                        
    });
           
           //setup load list
            this.loadGameList();
            //init the setup dialog
            this.setup = new SetupDialog(this);
        
    }
    
    
    
    
}

mainClass.prototype.getDrawingClass = function()
{
    var draw = new Draw2();
    return draw;
}

/*
 this.savedLoadName = {};
    //stores all of the saved games,refreshed every time title screen is seen or dialog box is refreshed
    this.loadObj = {};
*/
mainClass.prototype.loadGameList = function()
{
    this.savedLoadName = {};
    this.loadObj = {};
    this.loadObj['load zip direct'] = {}
    this.loadObj['load zip direct'].date = '';
    this.loadObj['load zip direct'].comments = "Paste the text of the save game to load a game not stored in this browser";
    this.loadObj['load zip direct'].mils = 0;
    var objDir = this.gameStorage.getListOfSavedGames();
    
    var line = "No games saved yet";
    var dia = "<p title='string-custom-load-123' id='generate-load' class='load'>Paste Text To Load</p>\r\n";
     
    if (objDir.length > 0)
    {
        //make all dates into objects
        for(var y=0; y < objDir.length; y++)
	{
	    var o = objDir[y];
            var mil = Date.parse(o.date);
            
            o.mils = mil;
        }
        
        //sort the array by date
        function compare(a,b) {
            if (a.mils < b.mils)
               return 1;
            if (a.mils > b.mils)
              return -1;
            return 0;
          }

        objDir.sort(compare);
	 line = "<table>";
         dia = "<p title='string-custom-load-123' id='generate-load' class='load'>Paste Text To Load</p>\r\n";
	for(var i=0; i < objDir.length; i++)
	{
           
	    var oo = objDir[i];
            
             //set the look up object
            
            //the following block of code is designed to make it harder for malicious code
            //to be inserted into someone else's web page though game file sharing
                oo.name = oo.name.substring(0,100);
                oo.comments.comments = oo.comments.substring(0,100);
                var re = /<[^>]*>?/g;
                var r2 = /["']/g;
                oo.name = oo.name.replace(re,' ');
                oo.name = oo.name.replace(r2,' ');
                
                if (!oo.name) {oo.name="[unnamed] "+1;}
                this.loadObj[oo.name] = oo;
                
                oo.comments = oo.comments.replace(re, ' ');
                oo.comments = oo.comments.replace(r2, ' ');
                if (!oo.comments) {oo.comments=" ";}
            
            dia += "<p title='"+oo.name+"' class='load'>"+oo.name+"</p>\r\n";
            
            //set the title screen hotlinks
            var param = '"'+oo.name+'"';
	    line += "<tr><td class='saved'><p onclick='mainObj.loadSavedGame("+param+");' class='load-link-class'>"+oo.name+
            "</p></td><td class='saved'><p class='load-comment-class'>  "+ oo.comments+"</p></td></tr>\r\n";
            
            //set the load dialog paragraphs
	}
        line +="</table>";
	$("#saved-link-list").html(line);
        
        $("#list-saved-games").html(dia);
    
    }
    else
    {
        $("#saved-link-list").html(line);
        
        $("#list-saved-games").html(dia);
    }
    
    this.savedGameDir = objDir;
}



jQuery(function(){ 
	    $("#game").hide();
            
            mainObj = new mainClass();
            mainObj.setupMain();
            
           
	});


function BrowserNotSupported()
{
    
}


