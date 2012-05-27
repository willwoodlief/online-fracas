OpenFracas-in-Javascript
========================

Based on the open-source game named OpenFracas build in Ruby.

I started this project after I realized that javascript, html5 and modern browsers could make the same game that only a few years ago could not have been played in the browser. For many years I have enjoyed playing the game Fracas, and even did a partial port to c++ a long time ago; now I want to help this wonderful game by making it universally playable again. The progress of this game might be slow at times because I have to do things in my outside life, but I hope eventually that this will be a fully playable, multi-player, online game.

Credits:
I am basing this javascript version of OpenFracas, on the open source game written in Ruby, based on this site
http://www.openfracas.org/ 
and whatever is created here will have the same license 

Version 0.1

This is the initial start of the re-write of the ruby code. The goal here is to be able to draw the map, and save it to a stream of characters (base 32) that can be copied and pasted in to recreate the map. Map generation variables will be supported when creating new map.

The basic format of the save string is designed to allow many things to be saved, not just the map, and to not crash the script if it has some element saved it does not understand.The save stream will be able to have add ons that if the program will not recognize, it will ignore and go the the next item in the stream. This way, we can have save games that will always be able to open, even after we add (hopefully) lots of items in other milestones. There will be options for the map like in the earlier game; but in this milestones only the options that changes the look and feel of the empty countries and the lakes.

