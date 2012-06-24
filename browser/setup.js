function SetupDialog(mainClass)
{
    this.map = null;
    this.mainClass = mainClass;
    this.typegame = 'solo';
    this.initSetupForm();
    this.showMiniMapFromSettings(); 
}


SetupDialog.prototype.initSetupForm = function()
{
    $( "#game-setup-form" ).dialog({
			autoOpen: false,
			height: 600,
			width: 780,
			modal: true,
			buttons: {
				"Create Game": function() {
					
                                        mainObj.setup.startGameFromSettings();
                                        $( this ).dialog( "close" );
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			},
			close: function() {
				
			}
		});
    
    $('#setup-tabs').tabs( {
                        create: function(event, ui) {  }
                        });

    
    $( "#click-for-setup" )
			.button()
			.click(function() {
				$( "#game-setup-form" ).dialog( "open" );
			});
                        
                        
                        
    $( "#map-generate_button" )
			.button()
			.click(function() {
                              mainObj.setup.showMiniMapFromSettings();  
			});
                        

    
    $('#file-load-div').toggleClass('ui-state-disabled',.3);
    $('#file-load-div :input').prop('disabled', true);
    
     $( "#load-list-setup" )
			.button()
			.click(function() {
			    $('#string-load-div').addClass('ui-state-disabled',.3);
                            $('#file-load-div').removeClass('ui-state-disabled',.3);
                            
                            $('#file-load-div :input').prop("disabled", false);
                            $('#string-load-div :input').prop('disabled', true);
			});
                        
    $( "#load-string-setup" ).button()
			.click(function() {
				$('#file-load-div').addClass('ui-state-disabled',.3);
                                $('#string-load-div').removeClass('ui-state-disabled',.3);
                                $('#string-load-div :input').prop("disabled", false);
                                $('#file-load-div :input').prop('disabled', true);
			});
                        
    $( "#setup-load-options" ).buttonset();
			
                        
   
                        
    $( "#load-setttings" ).button()
			.click(function() {
				//test to see if load coming from zip string in text area
				var whatType = $( 'input:[name="choose-load"]checked' );
				var radioID = whatType[0].id;
				if (radioID=='load-string-setup')
				{
				    var stringy = $("#game-setup-string").val();
				    mainObj.setup.loadSettingsFromString(stringy);
				}
				else
				{
				    var listy = $( "#saved_game_list" ).val();
				    mainObj.setup.loadSettingsFromList(listy);
				}
			}
			);
			
    
    $( "#mini-map-progress" ).progressbar({
			value: 37
		});
    
    
    
    
    
    
                        
                        
                        
    $( "#map-percentage-land" ).slider({
			value:50,
			min: 0,
			max: 100,
			step: 1,
			slide: function( event, ui ) {
				$( "#map-percentage-land-amount" ).text(ui.value );
			}
		});
    $( "#map-percentage-land-amount" ).text( $( "#map-percentage-land" ).slider( "value" ) );
    
    
    
    $( "#map-min-lake-size" ).slider({
			value:125,
			min: 0,
			max: 250,
			step: 1,
			slide: function( event, ui ) {
				$( "#map-min-lake-size-amount" ).text(ui.value );
			}
		});
    $( "#map-min-lake-size-amount" ).text( $( "#map-min-lake-size" ).slider( "value" ) );
    
    $('[name="choose-load"]').val( "string");
    
    
    this.putLoadNamesInDialog();

    
   
}

SetupDialog.prototype.putLoadNamesInDialog = function()
{
    var objDir = this.mainClass.savedGameDir;
    if (objDir.length > 0)
    {
	var line = "<option value='' selected='selected'>Select a Saved Game</option>\r\n";
	for(var i=0; i < objDir.length; i++)
	{
	    var oo = objDir[i];
	    line += "<option value='"+oo.name+"' >"+oo.name+"</option>";
	}
	$("#saved_game_list").html(line);
    }
    
}

SetupDialog.prototype.showMiniMapFromSettings = function()
{
       var settings = this.getSetupClassFromSettings();	
       var genMap = new MapGenerator(settings,this.updateMiniMapProgress);
       this.map = genMap.getFinishedMap();
       this.showMiniMap();
   
}
     
SetupDialog.prototype.showMiniMap = function()
{
       
       var draw = this.mainClass.getDrawingClass();
       
       var canvas = document.getElementById("mini-map-canvas");
       draw.setCanvas(canvas);
       draw.setMap(this.map);
       draw.drawMap();
}
     
SetupDialog.prototype.startGameFromSettings = function()
{
      	
       this.mainClass.initNewGame(this.map,this.typegame);
}
     
SetupDialog.prototype.getSetupClassFromSettings = function()
{
   var h = $('#map-hi').val();
   var w = $('#map-wide').val();
   var countrySizeIndex = $('#map-country-size').val();
   var percentLand = $( "#map-percentage-land" ).slider( "value" );
   var islandSyle = $('#map-islands').val();
   var sizeCountryVariance = $('#map-country-variance').val();
   var coastAmount = $('#map-coast').val();
   var countryShape = $('#map-country-shapes').val();
   var minLake = $( "#map-min-lake-size" ).slider( "value" );
   var settings =  new MapSetup(w,h,countrySizeIndex,percentLand,
				islandSyle,sizeCountryVariance,
				coastAmount,countryShape,minLake);
   return settings;

}

SetupDialog.prototype.updateMiniMapProgress = function(percentage, message)
{
    //does nothing for now
		    
}
    
SetupDialog.prototype.loadSettingsFromString = function(data)
{
    var obj = this.mainClass.gameStorage.stringToGameState(data);
    if (!obj) { return; }
    var game = this.mainClass.gameStorage.setUpGameObject(obj);
    this.setupImportedMap(game);
    this.showMiniMap();
}
    
SetupDialog.prototype.loadSettingsFromList= function(name)
{
    if (!name) {return;}
    var game = this.mainClass.gameStorage.getGameFromName(name);
    this.setupImportedMap(game);
    this.showMiniMap();
    
}

SetupDialog.prototype.setupImportedMap = function(game)
{
    this.map = game.map;
}