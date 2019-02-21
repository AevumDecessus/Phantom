/*
 *
 * @author Aevum Decessus
 * REQUIRED LIBARY BELOW
 * ./scripts/lang/english/custom/custom-TeamDonate.js 
 *
 */

(function() {

    /**
     * @event command
     */  
    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            username = (args[0] ? args[0].toLowerCase() : false);

        if (command.equalsIgnoreCase('setteam')) {
            if (args.length == 0) {
                $.say($.lang.get('teamdonate.team_required'));
                return;
            }
            team = args[0].replace('!', '').toLowerCase();
            if (!$.commandExists(team)) {
                $.say($.lang.get('teamdonate.missing_command', team));
                return
            }
            $.inidb.set('teamdonate', 'team', team);
            $.say($.lang.get('teamdonate.team_set', team));
        } else if (command.equalsIgnoreCase('getteam')) {
            if (!$.inidb.exists('teamdonate', 'team')) {
                $.say($.lang.get('teamdonate.no_team_set'));
                return
            }
            team = $.inidb.get('teamdonate', 'team');
            $.say($.lang.get('teamdonate.current_team', team));
        } else if (command.equalsIgnoreCase('donate')) {
            if (!$.inidb.exists('teamdonate', 'team')) {
                $.say($.lang.get('teamdonate.no_team_set'));
                return
            }
            team = $.inidb.get('teamdonate', 'team');
            if (!$.commandExists(team)) {
                $.say($.lang.get('teamdonate.missing_command', team));
                return
            }
            $.say($.inidb.get('command', team));
        }


    });

    /**
     * @event initReady
     */
    $.bind('initReady', function() {
        if ($.bot.isModuleEnabled('./custom/teamDonate.js')) {
            $.registerChatCommand('./custom/teamDonate.js', 'donate', 7);
            $.registerChatCommand('./custom/teamDonate.js', 'getteam', 2);
            $.registerChatCommand('./custom/teamDonate.js', 'setteam', 2);
        }
    });


})();
