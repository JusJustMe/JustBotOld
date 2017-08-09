(function() {

    API.getWaitListPosition = function(id) {
        if (typeof id === 'undefined' || id === null) {
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for (var i = 0; i < wl.length; i++) {
            if (wl[i].id === id) {
                return i;
            }
        }
        return -1;
    };

    var kill = function() {
        clearInterval(justbot.room.autodisableInterval);
        clearInterval(justbot.room.afkInterval);
        justbot.status = false;
    };

    var storeToStorage = function() {
        localStorage.setItem('justbotsettings', JSON.stringify(justbot.settings));
        localStorage.setItem('justbotRoom', JSON.stringify(justbot.room));
        var justbotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: justbot.version
        };
        localStorage.setItem('justbotStorageInfo', JSON.stringify(justbotStorageInfo));
    };

    var subChat = function(chat, obj) {
        if (typeof chat === 'undefined') {
            API.chatLog('There is a chat text missing.');
            console.log('There is a chat text missing.');
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
        $.get('https://rawgit.com/mini500/JustMiniBot/Bot.js/lang/en.json', function(json) {
            var link = justbot.chatLink;
            if (json !== null && typeof json !== 'undefined') {
                langIndex = json;
                link = langIndex[justbot.settings.language.toLowerCase()];
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
        });
    };

    var retrieveSettings = function() {
        var settings = JSON.parse(localStorage.getItem('justbotsettings'));
        if (settings !== null) {
            for (var prop in settings) {
                justbot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function() {
        var info = localStorage.getItem('justbotStorageInfo');
        if (info === null) API.chatLog(justbot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem('justbotsettings'));
            var room = JSON.parse(localStorage.getItem('justbotRoom'));
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
                justbot.room.roomstats = room.roomstats;
                justbot.room.messages = room.messages;
                justbot.room.queue = room.queue;
                justbot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(justbot.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById('room-settings');
        info = roominfo.textContent;
        var ref_bot = '@justbot=';
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(' ') < link.indexOf('\n')) ind_space = link.indexOf(' ');
            else ind_space = link.indexOf('\n');
            link = link.substring(0, ind_space);
            $.get(link, function(json) {
                if (json !== null && typeof json !== 'undefined') {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        justbot.settings[prop] = json_sett[prop];
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
        return this.substring(0, str.length) === str;
    };

    function linkFixer(msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    function decodeEntities(s) {
        var str, temp = document.createElement('p');
        temp.innerHTML = s;
        str = temp.textContent || temp.innerText;
        temp = null;
        return str;
    };

    var botCreator = 'mini500';
    var botMaintainer = 'JustJustMe';
    var botCreatorIDs = ['4878561', '16498004'];

    var justbot = {
        version: '0.1',
        status: false,
        name: 'נยรtჩ๏t',
        loggedInID: null,
        scriptLink: 'https://rawgit.com/mini500/JustMiniBot/Bot.js/justbot.js',
        cmdLink: 'https://github.com/mini500/JustMiniBot/blob/Bot.js/commands.md',
        chatLink: 'https://rawgit.com/mini500/JustMiniBot/Bot.js/lang/en.json',
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: 'justbot',
            language: 'english',
            chatLink: 'https://rawgit.com/mini500/JustMiniBot/Bot.js/lang/en.json',
            scriptLink: 'https://rawgit.com/mini500/JustMiniBot/Bot.js/justbot.js',
            roomLock: false, // Requires an extension to re-load the script
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: true, // true or false
            autowoot: true,
            autoskip: false,
            smartSkip: true,
            cmdDeletion: true,
            maximumAfk: 120,
            afkRemoval: false,
            maximumDc: 60,
            bouncerPlus: true,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: true,
            voteSkipLimit: 3,
            historySkip: true,
            timeGuard: true,
            maximumSongLength: 10,
            autodisable: false,
            commandCooldown: 30,
            usercommandsEnabled: true,
            thorCommand: false,
            thorCooldown: 10,
            skipPosition: 1,
            skipReasons: [
                ['theme', 'This song does not fit the room theme. '],
                ['op', 'This song is on the OP list. '],
                ['history', 'This song is in the history. '],
                ['mix', 'You played a mix, which is against the rules. '],
                ['sound', 'The song you played had bad sound quality or no sound. '],
                ['nsfw', 'The song you contained was NSFW (image or sound). '],
                ['unavailable', 'The song you played was not available for some users. ']
            ],
            afkpositionCheck: 15,
            afkRankCheck: 'ambassador',
            motdEnabled: false,
            motdInterval: 5,
            motd: 'i hope that everybody have good day! ;3',
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: null,
            intervalMessages: [],
            messageInterval: 5,
            songstats: true,
            commandLiteral: '$',
            blacklists: {
                NSFW: 'https://rawgit.com/mini500/JustMiniBot/Bot.js/NSFW.json',
                OP: 'https://rawgit.com/mini500/JustMiniBot/Bot.js/op.json',
                Banned: 'https://rawgit.com/mini500/JustMiniBot/Bot.js/Banned.json'
            }
        },
        room: {
            name: null,
            chatMessages: [],
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            //autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function() {
                if (justbot.status && justbot.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function() {}, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function() {
                    justbot.room.roulette.rouletteStatus = true;
                    justbot.room.roulette.countdown = setTimeout(function() {
                        justbot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(justbot.chat.isopen);
                },
                endRoulette: function() {
                    justbot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * justbot.room.roulette.participants.length);
                    var winner = justbot.room.roulette.participants[ind];
                    justbot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = justbot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(justbot.chat.winnerpicked, {
                        name: name,
                        position: pos
                    }));
                    setTimeout(function(winner, pos) {
                        justbot.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            },
            usersUsedThor: []
        },
        User: function(id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function(user) {
                return user.jointime;
            },
            getUser: function(user) {
                return API.getUser(user.id);
            },
            updatePosition: function(user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function(user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = justbot.room.roomstats.songCount;
            },
            setLastActivity: function(user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function(user) {
                return user.lastActivity;
            },
            getWarningCount: function(user) {
                return user.afkWarningCount;
            },
            setWarningCount: function(user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function(id) {
                for (var i = 0; i < justbot.room.users.length; i++) {
                    if (justbot.room.users[i].id === id) {
                        return justbot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function(name) {
                for (var i = 0; i < justbot.room.users.length; i++) {
                    var match = justbot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return justbot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function(id) {
                var user = justbot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function(obj) { //1 requests
                var u;
                if (typeof obj === 'object') u = obj;
                else u = API.getUser(obj);
                for (var i = 0; i < botCreatorIDs.length; i++) {
                    if (botCreatorIDs[i].indexOf(u.id) > -1) return 10;
                }
                if (u.gRole < 2) return u.role;
                else {
                    switch (u.gRole) {
                        case 2:
                            return 7;
                        case 3:
                            return 8;
                        case 4:
                            return 9;
                        case 5:
                            return 10;
                    }
                }
                return 0;
            },
            moveUser: function(id, pos, priority) {
                var user = justbot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function(id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    } else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < justbot.room.queue.id.length; i++) {
                            if (justbot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            justbot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(justbot.chat.alreadyadding, {
                                position: justbot.room.queue.position[alreadyQueued]
                            }));
                        }
                        justbot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            justbot.room.queue.id.unshift(id);
                            justbot.room.queue.position.unshift(pos);
                        } else {
                            justbot.room.queue.id.push(id);
                            justbot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(justbot.chat.adding, {
                            name: name,
                            position: justbot.room.queue.position.length
                        }));
                    }
                } else API.moderateMoveDJ(id, pos);
            },
            dclookup: function(id) {
                var user = justbot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return justbot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(justbot.chat.notdisconnected, {
                    name: name
                });
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return justbot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (justbot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = justbot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(justbot.chat.toolongago, {
                    name: justbot.userUtilities.getUser(user).username,
                    time: time
                }));
                var songsPassed = justbot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = justbot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) return subChat(justbot.chat.notdisconnected, {
                    name: name
                });
                var msg = subChat(justbot.chat.valid, {
                    name: justbot.userUtilities.getUser(user).username,
                    time: time,
                    position: newPosition
                });
                justbot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function(rankString) {
                var rankInt = null;
                switch (rankString) {
                    case 'admin':
                        rankInt = 10;
                        break;
                    case 'ambassador':
                        rankInt = 7;
                        break;
                    case 'host':
                        rankInt = 5;
                        break;
                    case 'cohost':
                        rankInt = 4;
                        break;
                    case 'manager':
                        rankInt = 3;
                        break;
                    case 'bouncer':
                        rankInt = 2;
                        break;
                    case 'residentdj':
                        rankInt = 1;
                        break;
                    case 'user':
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function(msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function() {}, 1000),
                locked: false,
                lockBooth: function() {
                    API.moderateLockWaitList(!justbot.roomUtilities.booth.locked);
                    justbot.roomUtilities.booth.locked = false;
                    if (justbot.settings.lockGuard) {
                        justbot.roomUtilities.booth.lockTimer = setTimeout(function() {
                            API.moderateLockWaitList(justbot.roomUtilities.booth.locked);
                        }, justbot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function() {
                    API.moderateLockWaitList(justbot.roomUtilities.booth.locked);
                    clearTimeout(justbot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function() {
                if (!justbot.status || !justbot.settings.afkRemoval) return void(0);
                var rank = justbot.roomUtilities.rankToNumber(justbot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, justbot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void(0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = justbot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = justbot.userUtilities.getUser(user);
                            if (rank !== null && justbot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = justbot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = justbot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > justbot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(justbot.chat.warning1, {
                                            name: name,
                                            time: time
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    } else if (warncount === 1) {
                                        API.sendChat(subChat(justbot.chat.warning2, {
                                            name: name
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    } else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            justbot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(justbot.chat.afkremove, {
                                                name: name,
                                                time: time,
                                                position: pos,
                                                maximumafk: justbot.settings.maximumAfk
                                            }));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            smartSkip: function(reason) {
                var dj = API.getDJ();
                var id = dj.id;
                var waitlistlength = API.getWaitList().length;
                var locked = false;
                justbot.room.queueable = false;

                if (waitlistlength == 50) {
                    justbot.roomUtilities.booth.lockBooth();
                    locked = true;
                }
                setTimeout(function(id) {
                    API.moderateForceSkip();
                    setTimeout(function() {
                        if (typeof reason !== 'undefined') {
                            API.sendChat(reason);
                        }
                    }, 500);
                    justbot.room.skippable = false;
                    setTimeout(function() {
                        justbot.room.skippable = true
                    }, 5 * 1000);
                    setTimeout(function(id) {
                        justbot.userUtilities.moveUser(id, justbot.settings.skipPosition, false);
                        justbot.room.queueable = true;
                        if (locked) {
                            setTimeout(function() {
                                justbot.roomUtilities.booth.unlockBooth();
                            }, 1000);
                        }
                    }, 1500, id);
                }, 1000, id);
            },
            changeDJCycle: function() {
                $.getJSON('/_/rooms/state', function(data) {
                    if (data.data[0].booth.shouldCycle) { // checks if shouldCycle is true
                        API.moderateDJCycle(false); // Disables the DJ Cycle
                        clearTimeout(justbot.room.cycleTimer); // Clear the cycleguard timer
                    } else { // If cycle is already disable; enable it
                        if (justbot.settings.cycleGuard) { // Is cycle guard on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                            justbot.room.cycleTimer = setTimeout(function() { // Start timer
                                API.moderateDJCycle(false); // Disable cycle
                            }, justbot.settings.maximumCycletime * 60 * 1000); // The time
                        } else { // So cycleguard is not on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                        }
                    };
                });
            },
            intervalMessage: function() {
                var interval;
                if (justbot.settings.motdEnabled) interval = justbot.settings.motdInterval;
                else interval = justbot.settings.messageInterval;
                if ((justbot.room.roomstats.songCount % interval) === 0 && justbot.status) {
                    var msg;
                    if (justbot.settings.motdEnabled) {
                        msg = justbot.settings.motd;
                    } else {
                        if (justbot.settings.intervalMessages.length === 0) return void(0);
                        var messageNumber = justbot.room.roomstats.songCount % justbot.settings.intervalMessages.length;
                        msg = justbot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function() {
                for (var bl in justbot.settings.blacklists) {
                    justbot.room.blacklists[bl] = [];
                    if (typeof justbot.settings.blacklists[bl] === 'function') {
                        justbot.room.blacklists[bl] = justbot.settings.blacklists();
                    } else if (typeof justbot.settings.blacklists[bl] === 'string') {
                        if (justbot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function(l) {
                                $.get(justbot.settings.blacklists[l], function(data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    justbot.room.blacklists[l] = list;
                                })
                            })(bl);
                        } catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function() {
                if (typeof console.table !== 'undefined') {
                    console.table(justbot.room.newBlacklisted);
                } else {
                    console.log(justbot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function() {
                var list = {};
                for (var i = 0; i < justbot.room.newBlacklisted.length; i++) {
                    var track = justbot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function(chat) {
            chat.message = linkFixer(chat.message);
            chat.message = decodeEntities(chat.message);
            chat.message = chat.message.trim();

            justbot.room.chatMessages.push([chat.cid, chat.message, chat.sub, chat.timestamp, chat.type, chat.uid, chat.un]);

            for (var i = 0; i < justbot.room.users.length; i++) {
                if (justbot.room.users[i].id === chat.uid) {
                    justbot.userUtilities.setLastActivity(justbot.room.users[i]);
                    if (justbot.room.users[i].username !== chat.un) {
                        justbot.room.users[i].username = chat.un;
                    }
                }
            }
            if (justbot.chatUtilities.chatFilter(chat)) return void(0);
            if (!justbot.chatUtilities.commandCheck(chat))
                justbot.chatUtilities.action(chat);
        },
        eventUserjoin: function(user) {
            var known = false;
            var index = null;
            for (var i = 0; i < justbot.room.users.length; i++) {
                if (justbot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                justbot.room.users[index].inRoom = true;
                var u = justbot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            } else {
                justbot.room.users.push(new justbot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < justbot.room.users.length; j++) {
                if (justbot.userUtilities.getUser(justbot.room.users[j]).id === user.id) {
                    justbot.userUtilities.setLastActivity(justbot.room.users[j]);
                    justbot.room.users[j].jointime = Date.now();
                }

            }
            if (justbot.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function(user) {
                        API.sendChat(subChat(justbot.chat.welcomeback, {
                            name: user.username
                        }));
                    }, 1 * 1000, user) :
                    setTimeout(function(user) {
                        API.sendChat(subChat(justbot.chat.welcome, {
                            name: user.username
                        }));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function(user) {
            var lastDJ = API.getHistory()[0].user.id;
            for (var i = 0; i < justbot.room.users.length; i++) {
                if (justbot.room.users[i].id === user.id) {
                    justbot.userUtilities.updateDC(justbot.room.users[i]);
                    justbot.room.users[i].inRoom = false;
                    if (lastDJ == user.id) {
                        var user = justbot.userUtilities.lookupUser(justbot.room.users[i].id);
                        justbot.userUtilities.updatePosition(user, 0);
                        user.lastDC.time = null;
                        user.lastDC.position = user.lastKnownPosition;
                    }
                }
            }
        },
        eventVoteupdate: function(obj) {
            for (var i = 0; i < justbot.room.users.length; i++) {
                if (justbot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        justbot.room.users[i].votes.woot++;
                    } else {
                        justbot.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();
            var timeLeft = API.getTimeRemaining();
            var timeElapsed = API.getTimeElapsed();

            if (justbot.settings.voteSkip) {
                if ((mehs - woots) >= (justbot.settings.voteSkipLimit)) {
                    API.sendChat(subChat(justbot.chat.voteskipexceededlimit, {
                        name: dj.username,
                        limit: justbot.settings.voteSkipLimit
                    }));
                    if (justbot.settings.smartSkip && timeLeft > timeElapsed) {
                        justbot.roomUtilities.smartSkip();
                    } else {
                        API.moderateForceSkip();
                    }
                }
            }

        },
        eventCurateupdate: function(obj) {
            for (var i = 0; i < justbot.room.users.length; i++) {
                if (justbot.room.users[i].id === obj.user.id) {
                    justbot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function(obj) {
            if (justbot.settings.autowoot) {
                $('#woot').click(); // autowoot
            }

            var user = justbot.userUtilities.lookupUser(obj.dj.id)
            for (var i = 0; i < justbot.room.users.length; i++) {
                if (justbot.room.users[i].id === user.id) {
                    justbot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (justbot.settings.songstats) {
                if (typeof justbot.chat.songstatistics === 'undefined') {
                    API.sendChat('/me ' + lastplay.media.author + ' - ' + lastplay.media.title + ': ' + lastplay.score.positive + 'W/' + lastplay.score.grabs + 'G/' + lastplay.score.negative + 'M.')
                } else {
                    API.sendChat(subChat(justbot.chat.songstatistics, {
                        artist: lastplay.media.author,
                        title: lastplay.media.title,
                        woots: lastplay.score.positive,
                        grabs: lastplay.score.grabs,
                        mehs: lastplay.score.negative
                    }))
                }
            }
            justbot.room.roomstats.totalWoots += lastplay.score.positive;
            justbot.room.roomstats.totalMehs += lastplay.score.negative;
            justbot.room.roomstats.totalCurates += lastplay.score.grabs;
            justbot.room.roomstats.songCount++;
            justbot.roomUtilities.intervalMessage();
            justbot.room.currentDJID = obj.dj.id;

            var blacklistSkip = setTimeout(function() {
                var mid = obj.media.format + ':' + obj.media.cid;
                for (var bl in justbot.room.blacklists) {
                    if (justbot.settings.blacklistEnabled) {
                        if (justbot.room.blacklists[bl].indexOf(mid) > -1) {
                            API.sendChat(subChat(justbot.chat.isblacklisted, {
                                blacklist: bl
                            }));
                            if (justbot.settings.smartSkip) {
                                return justbot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                }
            }, 2000);
            var newMedia = obj.media;
            var timeLimitSkip = setTimeout(function() {
                if (justbot.settings.timeGuard && newMedia.duration > justbot.settings.maximumSongLength * 60 && !justbot.room.roomevent) {
                    var name = obj.dj.username;
                    API.sendChat(subChat(justbot.chat.timelimit, {
                        name: name,
                        maxlength: justbot.settings.maximumSongLength
                    }));
                    if (justbot.settings.smartSkip) {
                        return justbot.roomUtilities.smartSkip();
                    } else {
                        return API.moderateForceSkip();
                    }
                }
            }, 2000);
            var format = obj.media.format;
            var cid = obj.media.cid;
            var naSkip = setTimeout(function() {
                if (format == 1) {
                    $.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + cid + '&key=AIzaSyDcfWu9cGaDnTjPKhg_dy9mUh6H7i4ePZ0&part=snippet&callback=?', function(track) {
                        if (typeof(track.items[0]) === 'undefined') {
                            var name = obj.dj.username;
                            API.sendChat(subChat(justbot.chat.notavailable, {
                                name: name
                            }));
                            if (justbot.settings.smartSkip) {
                                return justbot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                } else {
                    var checkSong = SC.get('/tracks/' + cid, function(track) {
                        if (typeof track.title === 'undefined') {
                            var name = obj.dj.username;
                            API.sendChat(subChat(justbot.chat.notavailable, {
                                name: name
                            }));
                            if (justbot.settings.smartSkip) {
                                return justbot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                }
            }, 2000);
            clearTimeout(historySkip);
            if (justbot.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function() {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            justbot.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                            API.sendChat(subChat(justbot.chat.songknown, {
                                name: name
                            }));
                            if (justbot.settings.smartSkip) {
                                return justbot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                    if (!alreadyPlayed) {
                        justbot.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            if (user.ownSong) {
                API.sendChat(subChat(justbot.chat.permissionownsong, {
                    name: user.username
                }));
                user.ownSong = false;
            }
            clearTimeout(justbot.room.autoskipTimer);
            if (justbot.settings.autoskip) {
                var remaining = obj.media.duration * 1000;
                var startcid = API.getMedia().cid;
                justbot.room.autoskipTimer = setTimeout(function() {
                    var endcid = API.getMedia().cid;
                    if (startcid === endcid) {
                        //API.sendChat('Song stuck, skipping...');
                        API.moderateForceSkip();
                    }
                }, remaining + 5000);
            }
            storeToStorage();
            //sendToSocket();
        },
        eventWaitlistupdate: function(users) {
            if (users.length < 50) {
                if (justbot.room.queue.id.length > 0 && justbot.room.queueable) {
                    justbot.room.queueable = false;
                    setTimeout(function() {
                        justbot.room.queueable = true;
                    }, 500);
                    justbot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function() {
                            id = justbot.room.queue.id.splice(0, 1)[0];
                            pos = justbot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function(id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    justbot.room.queueing--;
                                    if (justbot.room.queue.id.length === 0) setTimeout(function() {
                                        justbot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + justbot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = justbot.userUtilities.lookupUser(users[i].id);
                justbot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function(chat) {
            if (!justbot.settings.filterChat) return false;
            if (justbot.userUtilities.getPermission(chat.uid) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(justbot.chat.caps, {
                    name: chat.un
                }));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(justbot.chat.askskip, {
                    name: chat.un
                }));
                return true;
            }
            for (var j = 0; j < justbot.chatUtilities.spam.length; j++) {
                if (msg === justbot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(justbot.chat.spam, {
                        name: chat.un
                    }));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function(chat) {
                var msg = chat.message;
                var perm = justbot.userUtilities.getPermission(chat.uid);
                var user = justbot.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < justbot.room.mutedUsers.length; i++) {
                    if (justbot.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (justbot.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (justbot.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (justbot.settings.cmdDeletion && msg.startsWith(justbot.settings.commandLiteral)) {
                    API.moderateDeleteChat(chat.cid);
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(justbot.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(justbot.chat.adfly, {
                        name: chat.un
                    }));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = justbot.chat.roulettejoin;
                var rlLeaveChat = justbot.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === justbot.loggedInID) {
                    setTimeout(function(id) {
                        API.moderateDeleteChat(id);
                    }, 5 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function(chat) {
                var cmd;
                if (chat.message.charAt(0) === justbot.settings.commandLiteral) {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    } else cmd = chat.message.substring(0, space);
                } else return false;
                var userPerm = justbot.userUtilities.getPermission(chat.uid);
                //console.log('name: ' + chat.un + ', perm: ' + userPerm);
                if (chat.message !== justbot.settings.commandLiteral + 'join' && chat.message !== justbot.settings.commandLiteral + 'leave') {
                    if (userPerm === 0 && !justbot.room.usercommand) return void(0);
                    if (!justbot.room.allcommand) return void(0);
                }
                if (chat.message === justbot.settings.commandLiteral + 'eta' && justbot.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = justbot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void(0);
                        } else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in justbot.commands) {
                    var cmdCall = justbot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (justbot.settings.commandLiteral + cmdCall[i] === cmd) {
                            justbot.commands[comm].functionality(chat, justbot.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    justbot.room.usercommand = false;
                    setTimeout(function() {
                        justbot.room.usercommand = true;
                    }, justbot.settings.commandCooldown * 1000);
                }
                if (executed) {
                    /*if (justbot.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                    }*/

                    //justbot.room.allcommand = false;
                    //setTimeout(function () {
                    justbot.room.allcommand = true;
                    //}, 5 * 1000);
                }
                return executed;
            },
            action: function(chat) {
                var user = justbot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < justbot.room.users.length; j++) {
                        if (justbot.userUtilities.getUser(justbot.room.users[j]).id === chat.uid) {
                            justbot.userUtilities.setLastActivity(justbot.room.users[j]);
                        }

                    }
                }
                justbot.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function() {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                //eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function() {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function() {
            var u = API.getUser();
            if (justbot.userUtilities.getPermission(u) < 2) return API.chatLog(justbot.chat.greyuser);
            if (justbot.userUtilities.getPermission(u) === 2) API.chatLog(justbot.chat.bouncer);
            justbot.connectAPI();
            API.moderateDeleteChat = function(cid) {
                $.ajax({
                    url: '/_/chat/' + cid,
                    type: 'DELETE'
                })
            };

            justbot.room.name = window.location.pathname;
            var Check;

            console.log(justbot.room.name);

            var detect = function() {
                if (justbot.room.name != window.location.pathname) {
                    console.log('Killing bot after room change.');
                    storeToStorage();
                    justbot.disconnectAPI();
                    setTimeout(function() {
                        kill();
                    }, 1000);
                    if (justbot.settings.roomLock) {
                        window.location = justbot.room.name;
                    } else {
                        clearInterval(Check);
                    }
                }
            };

            Check = setInterval(function() {
                detect()
            }, 2000);

            retrieveSettings();
            retrieveFromStorage();
            window.bot = justbot;
            justbot.roomUtilities.updateBlacklists();
            setInterval(justbot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            justbot.getNewBlacklistedSongs = justbot.roomUtilities.exportNewBlacklistedSongs;
            justbot.logNewBlacklistedSongs = justbot.roomUtilities.logNewBlacklistedSongs;
            if (justbot.room.roomstats.launchTime === null) {
                justbot.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < justbot.room.users.length; j++) {
                justbot.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < justbot.room.users.length; j++) {
                    if (justbot.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    justbot.room.users[ind].inRoom = true;
                } else {
                    justbot.room.users.push(new justbot.User(userlist[i].id, userlist[i].username));
                    ind = justbot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(justbot.room.users[ind].id) + 1;
                justbot.userUtilities.updatePosition(justbot.room.users[ind], wlIndex);
            }
            justbot.room.afkInterval = setInterval(function() {
                justbot.roomUtilities.afkCheck()
            }, 10 * 1000);
            justbot.room.autodisableInterval = setInterval(function() {
                justbot.room.autodisableFunc();
            }, 60 * 60 * 1000);
            justbot.loggedInID = API.getUser().id;
            justbot.status = true;
            API.sendChat('/cap ' + justbot.settings.startupCap);
            API.setVolume(justbot.settings.startupVolume);
            if (justbot.settings.autowoot) {
                $('#woot').click();
            }
            if (justbot.settings.startupEmoji) {
                var emojibuttonoff = $('.icon-emoji-off');
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emojis enabled.');
            } else {
                var emojibuttonon = $('.icon-emoji-on');
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Avatars capped at ' + justbot.settings.startupCap);
            API.chatLog('Volume set to ' + justbot.settings.startupVolume);
            //socket();
            loadChat(API.sendChat(subChat(justbot.chat.online, {
                botname: justbot.settings.botName,
                version: justbot.version
            })));
        },
        commands: {
            executable: function(minRank, chat) {
                var id = chat.uid;
                var perm = justbot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = 10;
                        break;
                    case 'ambassador':
                        minPerm = 7;
                        break;
                    case 'host':
                        minPerm = 5;
                        break;
                    case 'cohost':
                        minPerm = 4;
                        break;
                    case 'manager':
                        minPerm = 3;
                        break;
                    case 'mod':
                        if (justbot.settings.bouncerPlus) {
                            minPerm = 2;
                        } else {
                            minPerm = 3;
                        }
                        break;
                    case 'bouncer':
                        minPerm = 2;
                        break;
                    case 'residentdj':
                        minPerm = 1;
                        break;
                    case 'user':
                        minPerm = 0;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },

            /*
            command: {
                command: 'cmd',
                rank: 'user/bouncer/mod/manager',
                type: 'startsWith/exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {

                    }
                }
            },
            */

            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;

                        var launchT = justbot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = durationOnline / 1000;

                        if (msg.length === cmd.length) time = since;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(justbot.chat.invalidtime, {
                                name: chat.un
                            }));
                        }
                        for (var i = 0; i < justbot.room.users.length; i++) {
                            userTime = justbot.userUtilities.getLastActivity(justbot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(justbot.chat.activeusersintime, {
                            name: chat.un,
                            amount: chatters,
                            time: time
                        }));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substr(cmd.length + 2);
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (justbot.room.roomevent) {
                                    justbot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(justbot.chat.invaliduserspecified, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nolimitspecified, {
                            name: chat.un
                        }));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            justbot.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(justbot.chat.maximumafktimeset, {
                                name: chat.un,
                                time: justbot.settings.maximumAfk
                            }));
                        } else API.sendChat(subChat(justbot.chat.invalidlimitspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.afkRemoval) {
                            justbot.settings.afkRemoval = !justbot.settings.afkRemoval;
                            clearInterval(justbot.room.afkInterval);
                            API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.afkremoval
                            }));
                        } else {
                            justbot.settings.afkRemoval = !justbot.settings.afkRemoval;
                            justbot.room.afkInterval = setInterval(function() {
                                justbot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.afkremoval
                            }));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(justbot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        justbot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(justbot.chat.afkstatusreset, {
                            name: chat.un,
                            username: name
                        }));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(justbot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var lastActive = justbot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = justbot.roomUtilities.msToStr(inactivity);

                        var launchT = justbot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline) {
                            API.sendChat(subChat(justbot.chat.inactivelonger, {
                                botname: justbot.settings.botName,
                                name: chat.un,
                                username: name
                            }));
                        } else {
                            API.sendChat(subChat(justbot.chat.inactivefor, {
                                name: chat.un,
                                username: name,
                                time: time
                            }));
                        }
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.autodisable) {
                            justbot.settings.autodisable = !justbot.settings.autodisable;
                            return API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.autodisable
                            }));
                        } else {
                            justbot.settings.autodisable = !justbot.settings.autodisable;
                            return API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.autodisable
                            }));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.autoskip) {
                            justbot.settings.autoskip = !justbot.settings.autoskip;
                            clearTimeout(justbot.room.autoskipTimer);
                            return API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.autoskip
                            }));
                        } else {
                            justbot.settings.autoskip = !justbot.settings.autoskip;
                            return API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.autoskip
                            }));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(justbot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(justbot.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: ['8ball', 'ask'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var crowd = API.getUsers();
                        var msg = chat.message;
                        var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                        var randomUser = Math.floor(Math.random() * crowd.length);
                        var randomBall = Math.floor(Math.random() * justbot.chat.balls.length);
                        var randomSentence = Math.floor(Math.random() * 1);
                        API.sendChat(subChat(justbot.chat.ball, {
                            name: chat.un,
                            botname: justbot.settings.botName,
                            question: argument,
                            response: justbot.chat.balls[randomBall]
                        }));
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substr(cmd.length + 2);
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(justbot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var permFrom = justbot.userUtilities.getPermission(chat.uid);
                        var permUser = justbot.userUtilities.getPermission(user.id);
                        if (permUser >= permFrom) return void(0);
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nolistspecified, {
                            name: chat.un
                        }));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof justbot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(justbot.chat.invalidlistspecified, {
                            name: chat.un
                        }));
                        else {
                            var media = API.getMedia();
                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            justbot.room.newBlacklisted.push(track);
                            justbot.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(justbot.chat.newblacklisted, {
                                name: chat.un,
                                blacklist: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            }));
                            if (justbot.settings.smartSkip && timeLeft > timeElapsed) {
                                justbot.roomUtilities.smartSkip();
                            } else {
                                API.moderateForceSkip();
                            }
                            if (typeof justbot.room.newBlacklistedSongFunction === 'function') {
                                justbot.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ':' + cid;

                        API.sendChat(subChat(justbot.chat.blinfo, {
                            name: name,
                            author: author,
                            title: title,
                            songid: songid
                        }));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (justbot.settings.bouncerPlus) {
                            justbot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': 'Bouncer+'
                            }));
                        } else {
                            if (!justbot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = justbot.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    justbot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(justbot.chat.toggleon, {
                                        name: chat.un,
                                        'function': 'Bouncer+'
                                    }));
                                }
                            } else return API.sendChat(subChat(justbot.chat.bouncerplusrank, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(justbot.chat.currentbotname, {
                            botname: justbot.settings.botName
                        }));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            justbot.settings.botName = argument;
                            API.sendChat(subChat(justbot.chat.botnameset, {
                                botName: justbot.settings.botName
                            }));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute('data-cid'));
                        }
                        return API.sendChat(subChat(justbot.chat.chatcleared, {
                            name: chat.un
                        }));
                    }
                }
            },

            clearlocalstorageCommand: {
                command: 'clearlocalstorage',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        localStorage.clear();
                        API.chatLog('Cleared localstorage, please refresh the page!');
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.cmdDeletion) {
                            justbot.settings.cmdDeletion = !justbot.settings.cmdDeletion;
                            API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.cmddeletion
                            }));
                        } else {
                            justbot.settings.cmdDeletion = !justbot.settings.cmdDeletion;
                            API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.cmddeletion
                            }));
                        }
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(justbot.chat.commandslink, {
                            botname: justbot.settings.botName,
                            link: justbot.cmdLink
                        }));
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                getCookie: function(chat) {
                    var c = Math.floor(Math.random() * justbot.chat.cookies.length);
                    return justbot.chat.cookies[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(justbot.chat.eatcookie);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = justbot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(justbot.chat.nousercookie, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(justbot.chat.selfcookie, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(justbot.chat.cookie, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    cookie: this.getCookie()
                                }));
                            }
                        }
                    }
                }
            },
            hugCommand: {
                command: 'hug',
                rank: 'user',
                type: 'startsWith',
                getCookie: function(chat) {
                    var c = Math.floor(Math.random() * justbot.chat.hug.length);
                    return justbot.chat.hug[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(justbot.chat.hug);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = justbot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(justbot.chat.nouserhug, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(justbot.chat.selfhug, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(justbot.chat.hug, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    hug: this.gethug()
                                }));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        justbot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.cycleGuard) {
                            justbot.settings.cycleGuard = !justbot.settings.cycleGuard;
                            return API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.cycleguard
                            }));
                        } else {
                            justbot.settings.cycleGuard = !justbot.settings.cycleGuard;
                            return API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.cycleguard
                            }));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== '') {
                            justbot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(justbot.chat.cycleguardtime, {
                                name: chat.un,
                                time: justbot.settings.maximumCycletime
                            }));
                        } else return API.sendChat(subChat(justbot.chat.invalidtime, {
                            name: chat.un
                        }));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = justbot.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(justbot.chat.dclookuprank, {
                                name: chat.un
                            }));
                        }
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(justbot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var toChat = justbot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            /*
            // This does not work anymore.
            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!justbot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(justbot.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        var message = $('.message');
                        var emote = $('.emote');
                        var from = $('.un.clickable');
                        for (var i = 0; i < chats.length; i++) {
                            var n = from[i].textContent;
                            if (name.trim() === n.trim()) {

                                // var messagecid = $(message)[i].getAttribute('data-cid');
                                // var emotecid = $(emote)[i].getAttribute('data-cid');
                                // API.moderateDeleteChat(messagecid);

                                // try {
                                //     API.moderateDeleteChat(messagecid);
                                // }
                                // finally {
                                //     API.moderateDeleteChat(emotecid);
                                // }

                                if (typeof $(message)[i].getAttribute('data-cid') == 'undefined'){
                                    API.moderateDeleteChat($(emote)[i].getAttribute('data-cid')); // works well with normal messages but not with emotes due to emotes and messages are seperate.
                                } else {
                                    API.moderateDeleteChat($(message)[i].getAttribute('data-cid'));
                                }
                            }
                        }
                        API.sendChat(subChat(justbot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },
            */

            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(justbot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        for (var i = 1; i < justbot.room.chatMessages.length; i++) {
                            if (justbot.room.chatMessages[i].indexOf(user.id) > -1) {
                                API.moderateDeleteChat(justbot.room.chatMessages[i][0]);
                                justbot.room.chatMessages[i].splice(0);
                            }
                        }
                        API.sendChat(subChat(justbot.chat.deletechat, {
                            name: chat.un,
                            username: name
                        }));
                    }
                }
            },

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(justbot.chat.emojilist, {
                            link: link
                        }));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = justbot.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch (lang) {
                            case 'en':
                                break;
                            case 'da':
                                ch += 'Vær venlig at tale engelsk.';
                                break;
                            case 'de':
                                ch += 'Bitte sprechen Sie Englisch.';
                                break;
                            case 'es':
                                ch += 'Por favor, hable Inglés.';
                                break;
                            case 'fr':
                                ch += 'Parlez anglais, s\'il vous plaît.';
                                break;
                            case 'nl':
                                ch += 'Spreek Engels, alstublieft.';
                                break;
                            case 'pl':
                                ch += 'Proszę mówić po angielsku.';
                                break;
                            case 'pt':
                                ch += 'Por favor, fale Inglês.';
                                break;
                            case 'sk':
                                ch += 'Hovorte po anglicky, prosím.';
                                break;
                            case 'cs':
                                ch += 'Mluvte prosím anglicky.';
                                break;
                            case 'sr':
                                ch += 'Молим Вас, говорите енглески.';
                                break;
                        }
                        ch += ' English please.';
                        API.sendChat(ch);
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var perm = justbot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var dj = API.getDJ().username;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void(0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(justbot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var pos = API.getWaitListPosition(user.id);
                        var realpos = pos + 1;
                        if (name == dj) return API.sendChat(subChat(justbot.chat.youaredj, {
                            name: name
                        }));
                        if (pos < 0) return API.sendChat(subChat(justbot.chat.notinwaitlist, {
                            name: name
                        }));
                        if (pos == 0) return API.sendChat(subChat(justbot.chat.youarenext, {
                            name: name
                        }));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = justbot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(justbot.chat.eta, {
                            name: name,
                            time: estimateString,
                            position: realpos
                        }));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof justbot.settings.fbLink === 'string')
                            API.sendChat(subChat(justbot.chat.facebook, {
                                link: justbot.settings.fbLink
                            }));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.filterChat) {
                            justbot.settings.filterChat = !justbot.settings.filterChat;
                            return API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.chatfilter
                            }));
                        } else {
                            justbot.settings.filterChat = !justbot.settings.filterChat;
                            return API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.chatfilter
                            }));
                        }
                    }
                }
            },

            forceskipCommand: {
                command: ['forceskip', 'fs'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(justbot.chat.forceskip, {
                            name: chat.un
                        }));
                        API.moderateForceSkip();
                        justbot.room.skippable = false;
                        setTimeout(function() {
                            justbot.room.skippable = true
                        }, 5 * 1000);
                    }
                }
            },

            ghostbusterCommand: {
                command: 'ghostbuster',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(justbot.chat.ghosting, {
                                name1: chat.un,
                                name2: name
                            }));
                        } else API.sendChat(subChat(justbot.chat.notghosting, {
                            name1: chat.un,
                            name2: name
                        }));
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func) {
                                $.getJSON(
                                    'https://tv.giphy.com/v1/gifs/random?', {
                                        'format': 'json',
                                        'api_key': api_key,
                                        'rating': rating,
                                        'tag': fixedtag
                                    },
                                    function(response) {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = 'dc6zaTOxFJmzC'; // public beta key
                            var rating = 'pg-13'; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g, '+');
                            var commatag = tag.replace(/ /g, ', ');
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(justbot.chat.validgiftags, {
                                        name: chat.un,
                                        id: id,
                                        tags: commatag
                                    }));
                                } else {
                                    API.sendChat(subChat(justbot.chat.invalidgiftags, {
                                        name: chat.un,
                                        tags: commatag
                                    }));
                                }
                            });
                        } else {
                            function get_random_id(api_key, func) {
                                $.getJSON(
                                    'https://tv.giphy.com/v1/gifs/random?', {
                                        'format': 'json',
                                        'api_key': api_key,
                                        'rating': rating
                                    },
                                    function(response) {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = 'dc6zaTOxFJmzC'; // public beta key
                            var rating = 'pg-13'; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(justbot.chat.validgifrandom, {
                                        name: chat.un,
                                        id: id
                                    }));
                                } else {
                                    API.sendChat(subChat(justbot.chat.invalidgifrandom, {
                                        name: chat.un
                                    }));
                                }
                            });
                        }
                    }
                }
            },
			
            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.historySkip) {
                            justbot.settings.historySkip = !justbot.settings.historySkip;
                            API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.historyskip
                            }));
                        } else {
                            justbot.settings.historySkip = !justbot.settings.historySkip;
                            API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.historyskip
                            }));
                        }
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.room.roulette.rouletteStatus && justbot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            justbot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(justbot.chat.roulettejoin, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(justbot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var join = justbot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = justbot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(justbot.chat.jointime, {
                            namefrom: chat.un,
                            username: name,
                            time: timeString
                        }));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = justbot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));

                        var permFrom = justbot.userUtilities.getPermission(chat.uid);
                        var permTokick = justbot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(justbot.chat.kickrank, {
                                name: chat.un
                            }));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(justbot.chat.kick, {
                                name: chat.un,
                                username: name,
                                time: time
                            }));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function(id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        } else API.sendChat(subChat(justbot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        storeToStorage();
                        //sendToSocket();
                        API.sendChat(justbot.chat.kill);
                        justbot.disconnectAPI();
                        setTimeout(function() {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'language',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(justbot.chat.currentlang, {
                            language: justbot.settings.language
                        }));
                        var argument = msg.substring(cmd.length + 1);

                        $.get('https://rawgit.com/justbot/source/master/lang/langIndex.json', function(json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === 'undefined') {
                                API.sendChat(subChat(justbot.chat.langerror, {
                                    link: 'http://git.io/vJ9nI'
                                }));
                            } else {
                                justbot.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(justbot.chat.langset, {
                                    language: justbot.settings.language
                                }));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var ind = justbot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            justbot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(justbot.chat.rouletteleave, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = justbot.userUtilities.lookupUser(chat.uid);
                        var perm = justbot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = 'https://youtu.be/' + media.cid;
                                API.sendChat(subChat(justbot.chat.songlink, {
                                    name: from,
                                    link: linkToSong
                                }));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function(sound) {
                                    API.sendChat(subChat(justbot.chat.songlink, {
                                        name: from,
                                        link: sound.permalink_url
                                    }));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        justbot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var temp = justbot.settings.lockdownEnabled;
                        justbot.settings.lockdownEnabled = !temp;
                        if (justbot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.lockdown
                            }));
                        } else return API.sendChat(subChat(justbot.chat.toggleoff, {
                            name: chat.un,
                            'function': justbot.chat.lockdown
                        }));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.lockGuard) {
                            justbot.settings.lockGuard = !justbot.settings.lockGuard;
                            return API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.lockguard
                            }));
                        } else {
                            justbot.settings.lockGuard = !justbot.settings.lockGuard;
                            return API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.lockguard
                            }));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            justbot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(justbot.chat.usedlockskip, {
                                    name: chat.un
                                }));
                                justbot.roomUtilities.booth.lockBooth();
                                setTimeout(function(id) {
                                    API.moderateForceSkip();
                                    justbot.room.skippable = false;
                                    setTimeout(function() {
                                        justbot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function(id) {
                                        justbot.userUtilities.moveUser(id, justbot.settings.lockskipPosition, false);
                                        justbot.room.queueable = true;
                                        setTimeout(function() {
                                            justbot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void(0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < justbot.settings.lockskipReasons.length; i++) {
                                var r = justbot.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += justbot.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(justbot.chat.usedlockskip, {
                                    name: chat.un
                                }));
                                justbot.roomUtilities.booth.lockBooth();
                                setTimeout(function(id) {
                                    API.moderateForceSkip();
                                    justbot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function() {
                                        justbot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function(id) {
                                        justbot.userUtilities.moveUser(id, justbot.settings.lockskipPosition, false);
                                        justbot.room.queueable = true;
                                        setTimeout(function() {
                                            justbot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void(0);
                            }
                        }
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== '') {
                            justbot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(justbot.chat.lockguardtime, {
                                name: chat.un,
                                time: justbot.settings.maximumLocktime
                            }));
                        } else return API.sendChat(subChat(justbot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            logoutCommand: {
                command: 'logout',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(justbot.chat.logout, {
                            name: chat.un,
                            botname: justbot.settings.botName
                        }));
                        setTimeout(function() {
                            $('.logout').mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            justbot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(justbot.chat.maxlengthtime, {
                                name: chat.un,
                                time: justbot.settings.maximumSongLength
                            }));
                        } else return API.sendChat(subChat(justbot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            mehCommand: {
                command: 'meh',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $('#meh').click();
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + justbot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!justbot.settings.motdEnabled) justbot.settings.motdEnabled = !justbot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            justbot.settings.motd = argument;
                            API.sendChat(subChat(justbot.chat.motdset, {
                                msg: justbot.settings.motd
                            }));
                        } else {
                            justbot.settings.motdInterval = argument;
                            API.sendChat(subChat(justbot.chat.motdintervalset, {
                                interval: justbot.settings.motdInterval
                            }));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(justbot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        if (user.id === justbot.loggedInID) return API.sendChat(subChat(justbot.chat.addbotwaitlist, {
                            name: chat.un
                        }));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(justbot.chat.move, {
                                name: chat.un
                            }));
                            justbot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(justbot.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        } else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == '' || time == null || typeof time == 'undefined') {
                                return API.sendChat(subChat(justbot.chat.invalidtime, {
                                    name: chat.un
                                }));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(justbot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var permFrom = justbot.userUtilities.getPermission(chat.uid);
                        var permUser = justbot.userUtilities.getPermission(user.id);
                        if (permUser == 0) {
                            if (time > 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(justbot.chat.mutedmaxtime, {
                                    name: chat.un,
                                    time: '45'
                                }));
                            } else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(justbot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(justbot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(justbot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(justbot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            }
                        } else API.sendChat(subChat(justbot.chat.muterank, {
                            name: chat.un
                        }));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof justbot.settings.opLink === 'string')
                            return API.sendChat(subChat(justbot.chat.oplist, {
                                link: justbot.settings.opLink
                            }));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(justbot.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        //sendToSocket();
                        storeToStorage();
                        justbot.disconnectAPI();
                        setTimeout(function() {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(justbot.chat.reload);
                        //sendToSocket();
                        storeToStorage();
                        justbot.disconnectAPI();
                        kill();
                        setTimeout(function() {
                            $.getScript(justbot.settings.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = justbot.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                } else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(justbot.chat.removenotinwl, {
                                name: chat.un,
                                username: name
                            }));
                        } else API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.etaRestriction) {
                            justbot.settings.etaRestriction = !justbot.settings.etaRestriction;
                            return API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.etarestriction
                            }));
                        } else {
                            justbot.settings.etaRestriction = !justbot.settings.etaRestriction;
                            return API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.etarestriction
                            }));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (!justbot.room.roulette.rouletteStatus) {
                            justbot.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof justbot.settings.rulesLink === 'string')
                            return API.sendChat(subChat(justbot.chat.roomrules, {
                                link: justbot.settings.rulesLink
                            }));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var woots = justbot.room.roomstats.totalWoots;
                        var mehs = justbot.room.roomstats.totalMehs;
                        var grabs = justbot.room.roomstats.totalCurates;
                        API.sendChat(subChat(justbot.chat.sessionstats, {
                            name: from,
                            woots: woots,
                            mehs: mehs,
                            grabs: grabs
                        }));
                    }
                }
            },

            skipCommand: {
                command: ['skip', 'smartskip'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.room.skippable) {

                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var dj = API.getDJ();
                            var name = dj.username;
                            var msgSend = '@' + name + ', ';

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(justbot.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (justbot.settings.smartSkip && timeLeft > timeElapsed) {
                                    justbot.roomUtilities.smartSkip();
                                } else {
                                    API.moderateForceSkip();
                                }
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < justbot.settings.skipReasons.length; i++) {
                                var r = justbot.settings.skipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += justbot.settings.skipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(justbot.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (justbot.settings.smartSkip && timeLeft > timeElapsed) {
                                    justbot.roomUtilities.smartSkip(msgSend);
                                } else {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.sendChat(msgSend);
                                    }, 500);
                                }
                            }
                        }
                    }
                }
            },

            skipposCommand: {
                command: 'skippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            justbot.settings.skipPosition = pos;
                            return API.sendChat(subChat(justbot.chat.skippos, {
                                name: chat.un,
                                position: justbot.settings.skipPosition
                            }));
                        } else return API.sendChat(subChat(justbot.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.songstats) {
                            justbot.settings.songstats = !justbot.settings.songstats;
                            return API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.songstats
                            }));
                        } else {
                            justbot.settings.songstats = !justbot.settings.songstats;
                            return API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.songstats
                            }));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat('/me justbot is an open-source bot for plug.dj. More info can be found here: https://github.com/justbot/source');
                    }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var msg = '[@' + from + '] ';

                        msg += justbot.chat.afkremoval + ': ';
                        if (justbot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += justbot.chat.afksremoved + ': ' + justbot.room.afkList.length + '. ';
                        msg += justbot.chat.afklimit + ': ' + justbot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (justbot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += justbot.chat.blacklist + ': ';
                        if (justbot.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += justbot.chat.lockguard + ': ';
                        if (justbot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += justbot.chat.cycleguard + ': ';
                        if (justbot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += justbot.chat.timeguard + ': ';
                        if (justbot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += justbot.chat.chatfilter + ': ';
                        if (justbot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += justbot.chat.historyskip + ': ';
                        if (justbot.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += justbot.chat.voteskip + ': ';
                        if (justbot.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += justbot.chat.cmddeletion + ': ';
                        if (justbot.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += justbot.chat.autoskip + ': ';
                        if (justbot.settings.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        // TODO: Display more toggleable bot settings.

                        var launchT = justbot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = justbot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(justbot.chat.activefor, {
                            time: since
                        });

                        /*
                        // least efficient way to go about this, but it works :)
                        if (msg.length > 250){
                            firstpart = msg.substr(0, 250);
                            secondpart = msg.substr(250);
                            API.sendChat(firstpart);
                            setTimeout(function () {
                                API.sendChat(secondpart);
                            }, 300);
                        }
                        else {
                            API.sendChat(msg);
                        }
                        */

                        // This is a more efficient solution
                        if (msg.length > 250) {
                            var split = msg.match(/.{1,250}/g);
                            for (var i = 0; i < split.length; i++) {
                                var func = function(index) {
                                    setTimeout(function() {
                                        API.sendChat('/me ' + split[index]);
                                    }, 500 * index);
                                }
                                func(i);
                            }
                        } else {
                            return API.sendChat(msg);
                        }
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.split('@')[1].trim();
                        var name2 = msg.split('@')[2].trim();
                        var user1 = justbot.userUtilities.lookupUserName(name1);
                        var user2 = justbot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(justbot.chat.swapinvalid, {
                            name: chat.un
                        }));
                        if (user1.id === justbot.loggedInID || user2.id === justbot.loggedInID) return API.sendChat(subChat(justbot.chat.addbottowaitlist, {
                            name: chat.un
                        }));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 && p2 < 0) return API.sendChat(subChat(justbot.chat.swapwlonly, {
                            name: chat.un
                        }));
                        API.sendChat(subChat(justbot.chat.swapping, {
                            'name1': name1,
                            'name2': name2
                        }));
                        if (p1 === -1) {
                            API.moderateRemoveDJ(user2.id);
                            setTimeout(function(user1, p2) {
                                justbot.userUtilities.moveUser(user1.id, p2, true);
                            }, 2000, user1, p2);
                        } else if (p2 === -1) {
                            API.moderateRemoveDJ(user1.id);
                            setTimeout(function(user2, p1) {
                                justbot.userUtilities.moveUser(user2.id, p1, true);
                            }, 2000, user2, p1);
                        } else if (p1 < p2) {
                            justbot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function(user1, p2) {
                                justbot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        } else {
                            justbot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function(user2, p1) {
                                justbot.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof justbot.settings.themeLink === 'string')
                            API.sendChat(subChat(justbot.chat.genres, {
                                link: justbot.settings.themeLink
                            }));
                    }
                }
            },

            thorCommand: {
                command: 'thor',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.thorCommand) {
                            var id = chat.uid,
                                isDj = API.getDJ().id == id ? true : false,
                                from = chat.un,
                                djlist = API.getWaitList(),
                                inDjList = false,
                                oldTime = 0,
                                usedThor = false,
                                indexArrUsedThor,
                                thorCd = false,
                                timeInMinutes = 0,
                                worthyAlg = Math.floor(Math.random() * 10) + 1,
                                worthy = worthyAlg == 10 ? true : false;

                            for (var i = 0; i < djlist.length; i++) {
                                if (djlist[i].id == id)
                                    inDjList = true;
                            }

                            if (inDjList) {
                                for (var i = 0; i < justbot.room.usersUsedThor.length; i++) {
                                    if (justbot.room.usersUsedThor[i].id == id) {
                                        oldTime = justbot.room.usersUsedThor[i].time;
                                        usedThor = true;
                                        indexArrUsedThor = i;
                                    }
                                }

                                if (usedThor) {
                                    timeInMinutes = (justbot.settings.thorCooldown + 1) - (Math.floor((oldTime - Date.now()) * Math.pow(10, -5)) * -1);
                                    thorCd = timeInMinutes > 0 ? true : false;
                                    if (thorCd == false)
                                        justbot.room.usersUsedThor.splice(indexArrUsedThor, 1);
                                }

                                if (thorCd == false || usedThor == false) {
                                    var user = {
                                        id: id,
                                        time: Date.now()
                                    };
                                    justbot.room.usersUsedThor.push(user);
                                }
                            }

                            if (!inDjList) {
                                return API.sendChat(subChat(justbot.chat.thorNotClose, {
                                    name: from
                                }));
                            } else if (thorCd) {
                                return API.sendChat(subChat(justbot.chat.thorcd, {
                                    name: from,
                                    time: timeInMinutes
                                }));
                            }

                            if (worthy) {
                                if (API.getWaitListPosition(id) != 0)
                                    justbot.userUtilities.moveUser(id, 1, false);
                                API.sendChat(subChat(justbot.chat.thorWorthy, {
                                    name: from
                                }));
                            } else {
                                if (API.getWaitListPosition(id) != djlist.length - 1)
                                    justbot.userUtilities.moveUser(id, djlist.length, false);
                                API.sendChat(subChat(justbot.chat.thorNotWorthy, {
                                    name: from
                                }));
                            }
                        }
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.timeGuard) {
                            justbot.settings.timeGuard = !justbot.settings.timeGuard;
                            return API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.timeguard
                            }));
                        } else {
                            justbot.settings.timeGuard = !justbot.settings.timeGuard;
                            return API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.timeguard
                            }));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var temp = justbot.settings.blacklistEnabled;
                        justbot.settings.blacklistEnabled = !temp;
                        if (justbot.settings.blacklistEnabled) {
                            return API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.blacklist
                            }));
                        } else return API.sendChat(subChat(justbot.chat.toggleoff, {
                            name: chat.un,
                            'function': justbot.chat.blacklist
                        }));
                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.motdEnabled) {
                            justbot.settings.motdEnabled = !justbot.settings.motdEnabled;
                            API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.motd
                            }));
                        } else {
                            justbot.settings.motdEnabled = !justbot.settings.motdEnabled;
                            API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.motd
                            }));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.voteSkip) {
                            justbot.settings.voteSkip = !justbot.settings.voteSkip;
                            API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.voteskip
                            }));
                        } else {
                            justbot.settings.voteSkip = !justbot.settings.voteSkip;
                            API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.voteskip
                            }));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/bans', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = json.data;
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) return API.sendChat(subChat(justbot.chat.notbanned, {
                                name: chat.un
                            }));
                            API.moderateUnbanUser(bannedUser.id);
                            console.log('Unbanned:', name);
                        });
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        justbot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/mutes', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var arg = msg.substring(cmd.length + 1);
                            var mutedUsers = json.data;
                            var found = false;
                            var mutedUser = null;
                            var permFrom = justbot.userUtilities.getPermission(chat.uid);
                            if (msg.indexOf('@') === -1 && arg === 'all') {
                                if (permFrom > 2) {
                                    for (var i = 0; i < mutedUsers.length; i++) {
                                        API.moderateUnmuteUser(mutedUsers[i].id);
                                    }
                                    API.sendChat(subChat(justbot.chat.unmutedeveryone, {
                                        name: chat.un
                                    }));
                                } else API.sendChat(subChat(justbot.chat.unmuteeveryonerank, {
                                    name: chat.un
                                }));
                            } else {
                                for (var i = 0; i < mutedUsers.length; i++) {
                                    var user = mutedUsers[i];
                                    if (user.username === name) {
                                        mutedUser = user;
                                        found = true;
                                    }
                                }
                                if (!found) return API.sendChat(subChat(justbot.chat.notbanned, {
                                    name: chat.un
                                }));
                                API.moderateUnmuteUser(mutedUser.id);
                                console.log('Unmuted:', name);
                            }
                        });
                    }
                }
            },

            uptimeCommand: {
                command: 'uptime',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var launchT = justbot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = justbot.roomUtilities.msToStr(durationOnline);
                        API.sendChat(subChat(justbot.chat.activefor, {
                            time: since
                        }));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            justbot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(justbot.chat.commandscd, {
                                name: chat.un,
                                time: justbot.settings.commandCooldown
                            }));
                        } else return API.sendChat(subChat(justbot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.usercommands
                            }));
                            justbot.settings.usercommandsEnabled = !justbot.settings.usercommandsEnabled;
                        } else {
                            API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.usercommands
                            }));
                            justbot.settings.usercommandsEnabled = !justbot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(justbot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = justbot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(justbot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(justbot.chat.voteratio, {
                            name: chat.un,
                            username: name,
                            woot: vratio.woot,
                            mehs: vratio.meh,
                            ratio: ratio.toFixed(2)
                        }));
                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(justbot.chat.voteskiplimit, {
                            name: chat.un,
                            limit: justbot.settings.voteSkipLimit
                        }));
                        var argument = msg.substring(cmd.length + 1);
                        if (!justbot.settings.voteSkip) justbot.settings.voteSkip = !justbot.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(justbot.chat.voteskipinvalidlimit, {
                                name: chat.un
                            }));
                        } else {
                            justbot.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(justbot.chat.voteskipsetlimit, {
                                name: chat.un,
                                limit: justbot.settings.voteSkipLimit
                            }));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'website',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof justbot.settings.website === 'string')
                            API.sendChat(subChat(justbot.chat.website, {
                                link: justbot.settings.website
                            }));
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (justbot.settings.welcome) {
                            justbot.settings.welcome = !justbot.settings.welcome;
                            return API.sendChat(subChat(justbot.chat.toggleoff, {
                                name: chat.un,
                                'function': justbot.chat.welcomemsg
                            }));
                        } else {
                            justbot.settings.welcome = !justbot.settings.welcome;
                            return API.sendChat(subChat(justbot.chat.toggleon, {
                                name: chat.un,
                                'function': justbot.chat.welcomemsg
                            }));
                        }
                    }
                }
            },

            whoisCommand: {
                command: 'whois',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i) {
                            if (users[i].username == name) {
                                var id = users[i].id;
                                var avatar = API.getUser(id).avatarID;
                                var level = API.getUser(id).level;
                                var rawjoined = API.getUser(id).joined;
                                var joined = rawjoined.substr(0, 10);
                                var rawlang = API.getUser(id).language;
                                if (rawlang == 'en') {
                                    var language = 'English';
                                } else if (rawlang == 'bg') {
                                    var language = 'Bulgarian';
                                } else if (rawlang == 'cs') {
                                    var language = 'Czech';
                                } else if (rawlang == 'fi') {
                                    var language = 'Finnish'
                                } else if (rawlang == 'fr') {
                                    var language = 'French'
                                } else if (rawlang == 'pt') {
                                    var language = 'Portuguese'
                                } else if (rawlang == 'zh') {
                                    var language = 'Chinese'
                                } else if (rawlang == 'sk') {
                                    var language = 'Slovak'
                                } else if (rawlang == 'nl') {
                                    var language = 'Dutch'
                                } else if (rawlang == 'ms') {
                                    var language = 'Malay'
                                }
                                var rawrank = API.getUser(id).role;
                                if (rawrank == '0') {
                                    var rank = 'User';
                                } else if (rawrank == '1') {
                                    var rank = 'Resident DJ';
                                } else if (rawrank == '2') {
                                    var rank = 'Bouncer';
                                } else if (rawrank == '3') {
                                    var rank = 'Manager'
                                } else if (rawrank == '4') {
                                    var rank = 'Co-Host'
                                } else if (rawrank == '5') {
                                    var rank = 'Host'
                                } else if (rawrank == '7') {
                                    var rank = 'Brand Ambassador'
                                } else if (rawrank == '10') {
                                    var rank = 'Admin'
                                }
                                var slug = API.getUser(id).slug;
                                if (typeof slug !== 'undefined') {
                                    var profile = 'https://plug.dj/@/' + slug;
                                } else {
                                    var profile = '~';
                                }

                                API.sendChat(subChat(justbot.chat.whois, {
                                    name1: chat.un,
                                    name2: name,
                                    id: id,
                                    avatar: avatar,
                                    profile: profile,
                                    language: language,
                                    level: level,
                                    joined: joined,
                                    rank: rank
                                }));
                            }
                        }
                    }
                }
            },

            wootCommand: {
                command: 'woot',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $('#woot').click();
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!justbot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof justbot.settings.youtubeLink === 'string')
                            API.sendChat(subChat(justbot.chat.youtube, {
                                name: chat.un,
                                link: justbot.settings.youtubeLink
                            }));
                    }
                }
            }
        }
    };
	

    loadChat(justbot.startup);
}).call(this);