(function() {
	if (typeof id === 'undefined')
	API.GetWaitListPostitons = function (id) {
		id = API.getUser().id;
	}
	var wl = API.getWaitList();
	for (var i = 0; i <wl.length; i++) {
		if (wl[i].id === id) {
			return i;
		}
		return -1;
	};

   var storeToStorage = function() {
   		localstorage.setItem('justbotsettings', JSON.stringify(justbot.settings));
   		localstorage.setItem('justbotRoom', JSON.stringify(justbot.room));
   		var justbotStorageInfo = {
   			time: Date.now();
   			stored: true,
   			version: justbot.version
   		}
   };

  var subChat = function(chat, obf) {
  	if (typeof chat === 'undefined') {
  		API.chatLog('there is a chat text missing.')
  		console.log('there is a chat text missing.')
  		return '[Error] No text message found.';
  	} 
  	var lit = '%%';
  	for (var prop in obj) {
  		chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
  	}
  	return chat;
  };
  
  var loadChat = function(cb) {
  	if (!cb) cb = function() {};
        $.get('https://raw.githubusercontent.com/mini500/JustMiniBot/Bot.js/lang/langIndex.json', function(json) {
            var link = justbot.chatLink;
            if (json !== null && typeof json !== 'undefined') {
                langIndex = json;
                link = langIndex[justcBot.settings.language.toLowerCase()];
                if (justbot.settings.chatLink !== justbot.chatLink) {
                    link = justbot.settings.chatLink;
                } else {
                    if (typeof link === 'undefined') {
                        link = justbot.chatLink;
                    }
                }
                $.get(link, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        justbot.chat = json;
                        cb();
                    }
                });
            } else {
                $.get(justbot.chatLink, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        justbot.chat = json;
                        cb();
                    }
                });
            }
        })
  };

  var retrieveSettings = function() {
  	var settings = JSON.parse(localstorage.getItem('justbotsettings')
  	if (settings !== null) {
		for (var prop in settings) {
			justbot.settings[prop] = settings[prop];
		}
	}
  };
  
  var retrieveFromStorage = function() {
	  var info = localstorage.getItem('justbotStorageInfo');
	  if (info === null) API.chatLog(justbot.chat.nodatafound);
	  else {
		  var settings = JSON.parse(localstorage.getItem('justbotsettings'));
		  var room = JSON.parse(localstorage.getItem('justbotRoom'));
		  var elapsed = Date.now() - JSON.parse(info).time;
		  if ((elapsed < 1 * 60 * 60 * 1000)) {
			  API.chatLog(justbot.chat.retrievingdata);
			  for (var prop in settings) {
				  justbot.settings[prop] = settings[prop];
			  }
			  justbot.room.users = room.users;
			  justbot.room.afkList = room.afkList;
			  justbot.room.historyList = room.historyList;
			  justbot.room.mutedUsers = room.mutedUsers;
			  //justbot.room.autoskip = room.autoskip;
			  justbot.room.roomstats = room.stats;
			  justbot.room.messages = room.messages;
			  justbot.room.queue = room.queue;
			  justbot. room.newBlacklisted = room.newBlacklisted;
			  API.chatLog(justbot.chat.datarestored);
		  }
	  }
	  var json_sett =null
	  var roominfo = document.getElementbyId('room-settings');
	  info = roominfo.textContent;
	  var ref_bot = '@Justbot=';
	  var ind_ref = info.indexOf(ref_bot);
	  if (inf_ref > 0) {
		  var link = info.substring(ind_ref + ref_bot.length, info.length)
		  var ind_space = null;
		  if (link.indexOf(' ') < link.indexOf ('\n')) ind_space = link.indexOf(' ');
		  else ind_space = link.indexOf('\n');
		  link = link.substring(0, ind_space);
		  $.get(link, function(json) {
			  if (json !== null && typeof json !== 'undefined') {
				  json_sett = JSON.parse(json);
				  for (var prop in json_sett) {
					  justbot.settings[prop] = json_sett[prop]
				  }
			  }
		  });
	  }
  };
  
    String.prototype.splitBetween = function(a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            } else arr.push(self[i]);
        }
        return arr;
    };
	
	String.prototype.startsWith = function(str) {
		return this.substring(0, str,length) === str;
	};
	
	function LinkFixer(msg) {
		var parts =msg.splitBetween('<a herf="', '<\/a');
		for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
			parts[i] =link;
		}
		var m = '';
		for (var i = 0; i < parts.length; i = i + 2) {
			m += parts[i];
		}
		return m;
	};
	
	function decodeenities(s) {
		var str, temp = document.createElement('p');
		temp.innerHTML = s;
		str = temp.textContent || temp.innerText
		temp = null;
		return str;
	};
	
	var botCreator = 'mini500';
	var botMaintainer = 'JustJustMe';
	var botCreatorIDS = ['4878561', '16498004'];
	
	var justbot = {
		version: '0.1',
		status: false,
		name: 'justbot',
		loggedInID: "29284865",
	}
	
//© mini500 ©
//i'am Dum!
//#foreveralone

