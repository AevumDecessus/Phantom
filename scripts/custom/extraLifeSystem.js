/*
 * This is an unsupported module for retrieving data from Extra Life.
 * As Extra Life does not officially provide an API, this module may
 * stop working or may not work as expected at any time. If there are
 * connectivity issues or if the data is not coming back as expected,
 * there is a good chance that something changed on the Extra Life side.
 *
 * No warranty is implied or provided.
 *
 * @author illusionaryone
 * Modded by Willkillyaquick
 * Rewritten by AevumDecessus
 * REQUIRED LIBARY BELOW
 * ./scripts/lang/english/custom/custom-ExtraLife.js 
 *
 */

(function() {

    /**
     * NOTICE: YOU MUST MANUALLY CONFIGURE THESE VARIABLE FROM CHAT. 
     */
     
    var extraLifeID = $.inidb.get('extralife','id');
    var extraLifeTeamID = $.inidb.get('extralife','teamid');
    var extraLifeURL = 'https://www.extra-life.org/index.cfm?fuseaction=donate.participant&participantID=' + extraLifeID;
    var extraLifeAPIBase = 'https://www.extra-life.org/api/'
    var nickName = $.inidb.get('extralife','nick');
    var emoteLove = $.inidb.get('extralife','emote');
    var hospital = $.inidb.get('extralife','hospital');
    var teamOnly = $.getIniDbBoolean('extralife', 'teamonly', false);
    var DEBUG = $.getIniDbBoolean('extralife', 'debug', false);
    var enableGifAlert = $.getIniDbBoolean('extralife', 'gifalert', false);
    var customCommand = 'els';

    /**
     * @function isSetUp
     * @return {boolean} setupBoolean
     * @param {string} sender
     */
    
    function isSetUp(sender){
        var str = $.whisperPrefix(sender);
        var check= true;
        // Set some defaults if they are not set
        if (!$.inidb.exists('extralife','hospital')) {
            $.inidb.set('extralife','hospital','Local Childrens Hospitals');
            hospital = 'Local Childrens Hospital';
        }
        if (!$.inidb.exists('extralife','emote')) {
            $.inidb.set('extralife','emote','<3');
            emote = '<3';
        }
        if (!$.inidb.exists('extralife','teamonly')) {
            $.setIniDbBoolean('extralife','teamonly',false);
            teamOnly = false;
        }
        if (!$.inidb.exists('extralife','gifalert')) {
            $.setIniDbBoolean('extralife','gifalert',false);
            enableGifAlert = false;
        }
        if (teamOnly) {
            if (!$.inidb.exists('extralife', 'teamid')) {
                str = str + ' Team ID is not setup. (!extralife teamid #) | ';
                check = false;
            }
        } else {
            if (!$.inidb.exists('extralife','id')) {
                str = str + ' ID is not setup. (!extralife id #) | ';
                check = false;
            }
            if (!$.inidb.exists('extralife','nick')) {
                str = str + ' Name is not setup. (!extralife nick ___) | ';
                check = false;
            }
        }
        if (!check) {
            $.say(str);
        }
        return check;
    }
    
    /**
     * @function isTeamSetup
     * @return {boolean} isTeamSetup
     * @param {string} sender
     */
    function isTeamSetup(sender) {
        if (!$.inidb.exists('extralife','teamonly')) {
            $.setIniDbBoolean('extralife','teamonly',false);
            teamOnly = false;
        }
        if (!$.inidb.exists('extralife','gifalert')) {
            $.setIniDbBoolean('extralife','gifalert',false);
            enableGifAlert = false;
        }
        if (teamOnly) {
            if (!$.inidb.exists('extralife','teamid')) {
                $.say($.whisperPrefix(sender) + ' Team id is not setup. (!extralife teamid #)');
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
    
    /**
     * @function displayGiftAlert
     * @param {string} Alert Text
     */
    function displayGifAlert(gifText) {
        if (enableGifAlert) {
            $.panelsocketserver.alertImage($.lang.get('extralifesystem.gifalert', gifText));
        }
    }

    /**
     * @function pullJSONData
     * @param {string} url
     * @return {JSON} requestedJSON
     */
    function pullJSONData(url) {
        var HttpResponse = Packages.com.gmt2001.HttpResponse;
        var HttpRequest = Packages.com.gmt2001.HttpRequest;
        var HashMap = Packages.java.util.HashMap;
        var responseData = HttpRequest.getData(HttpRequest.RequestType.GET, extraLifeAPIBase + url, "", new HashMap());
        return JSON.parse(responseData.content);
    }

    /**
     * @function pullExtraLifeTotalGoal
     * @return {String} userInformation
     */
    function pullExtraLifeTotalGoal() {
        var jsonObj = pullJSONData('participants/' + extraLifeID);
        var totalRaised = jsonObj['sumDonations'];
        var fundRaisingGoal = jsonObj['fundraisingGoal'];
        return $.lang.get('extralifesystem.pullextragoal.goal', nickName, totalRaised , fundRaisingGoal);
    }

    /**
     * @function pullExtraLifeTeamTotalGoal
     * @return {string} teamInformation
     */
    function pullExtraLifeTeamTotalGoal() {
        var jsonObj = pullJSONData('teams/' + extraLifeTeamID);
        var totalRaised = jsonObj['sumDonations'];
        var fundRaisingGoal = jsonObj['fundraisingGoal'];
        var teamName = jsonObj['name'];
        return $.lang.get('extralifesystem.pullextrateam.goal', nickName, teamName , totalRaised, fundRaisingGoal);
    }

    /**
     * @function pullExtraLifeLastDonation
     * @return {String} donationInformation
     * 
     */
    function pullExtraLifeLastDonation() {
        var jsonObj = pullJSONData('participants/' + extraLifeID + '/donations');
        if (jsonObj[0] === undefined) {
            return 'No recent donations found!';
        }
        
        var message = jsonObj[0].message;
        var donorName = jsonObj[0].displayName;
        var donationAmount = jsonObj[0].amount;
        return sayLastDonation(donationAmount , donorName, message, false);
    }

    /**
     * @function pullExtraLifeLastDonation
     * @return {String} donationInformation
     * 
     */
    function pullExtraLifeLastTeamDonation() {
        var jsonObj = pullJSONData('teams/' + extraLifeTeamID + '/donations');
        if (jsonObj[0] === undefined) {
            return 'No recent donations found!';
        }
        
        var message = jsonObj[0].message;
        var donorName = jsonObj[0].displayName;
        var donationAmount = jsonObj[0].amount;
        return sayLastDonation(donationAmount , donorName, message, true);
    }

     /**
     * @function pullExtraLifeDonations
     */
    function pullExtraLifeDonationsInterval() {
        if (teamOnly) {
            return;
        }
        var jsonObj = pullJSONData('participants/' + extraLifeID + '/donations');

        if (jsonObj[0] === undefined) {
            return;
        }

        for (var i = 0; i < jsonObj.length; i++) {
            var message = jsonObj[i].message;
            var donorName = jsonObj[i].displayName;
            var donationAmount = jsonObj[i].amount;
            var donorID = jsonObj[i].donorID;
            if ($.inidb.exists('extralife', donorID)) {
                continue;
            } else {
                if (DEBUG) {
                    $.consoleLn('NewDonation: ' + donorID + '::' + donationAmount);
                }
            }
            
            $.setIniDbString('extralife', donorID, String(donationAmount));
            data = sayDonation(donationAmount, donorName, message, teamOnly);
            $.say(data);
            displayGifAlert(data);
        }
    }

     /**
     * @function pullExtraLifeTeamDonations
     */
    function pullExtraLifeTeamDonationsInterval() {
        if (!teamOnly) {
            return;
        }
        var jsonObj = pullJSONData('teams/' + extraLifeTeamID + '/donations');

        if (jsonObj[0] === undefined) {
            return;
        }

        for (var i = 0; i < jsonObj.length; i++) {
            var message = jsonObj[i].message;
            var donorName = jsonObj[i].displayName;
            var donationAmount = jsonObj[i].amount;
            var donorID = jsonObj[i].donorID;

            if ($.inidb.exists('extralife', donorID)) {
                continue;
            } else {
                if (DEBUG) {
                    $.consoleLn('NewTeamDonation: ' + donorID + '::' + donationAmount);
                }
            }
            
            $.setIniDbString('extralife', donorID, String(donationAmount));
            data = sayDonation(donationAmount, donorName, message, teamOnly);
            $.say(data);
            displayGifAlert(data);
        }
    }

    /**
    * @function sayDonation
    * @param {string} donationAmount
    * @param {string} donorName
    * @param {string} message
    * @param {boolean} isTeamDonation
    */
    function sayDonation(donationAmount, donorName, message, isTeamDonation) {
        mask = getMessageMask(donationAmount, donorName, message);
        if (DEBUG) {
            $.consoleLn('Mask:' + mask + ' donationAmount:' + donationAmount + ' donorName:' + donorName + ' message:' + message);
        }
        prefix = "";
        if (isTeamDonation) {
            prefix = "The team";
        } else {
            prefix = nickName;
        }
        switch(mask) {
            case 0:
                return $.lang.get('extralifesystem.donation.0', prefix);
                break;
            case 1:
                return $.lang.get('extralifesystem.donation.1', prefix, String(donationAmount));
                break;
            case 2:
                return $.lang.get('extralifesystem.donation.2', prefix, String(donorName));
                break;
            case 3:
                return $.lang.get('extralifesystem.donation.3', prefix, String(donationAmount), String(donorName));
                break;
            case 4:
                return $.lang.get('extralifesystem.donation.4', prefix, String(message));
                break;
            case 5:
                return $.lang.get('extralifesystem.donation.5', prefix, donationAmount, message);
                break;
            case 6:
                return $.lang.get('extralifesystem.donation.6', prefix, donorName, message);
                break;
            case 7:
                return $.lang.get('extralifesystem.donation.7', prefix, donationAmount, donorName, message);
                break;
            default:
                return $.lang.get('extralifesystem.donation.7', prefix, donationAmount, donorName, message);
                break;
        }
    }

    /**
    * @function sayDonation
    * @param {string} donationAmount
    * @param {string} donorName
    * @param {string} message
    * @param {boolean} isTeamDonation
    */
    function sayLastDonation(donationAmount, donorName, message, isTeamDonation) {
        mask = getMessageMask(donationAmount, donorName, message);
        if (DEBUG) {
            $.consoleLn('Mask:' + mask + ' donationAmount:' + donationAmount + ' donorName:' + donorName + ' message:' + message);
        }
        prefix = "";
        if (isTeamDonation) {
            prefix = "the team";
        } else {
            prefix = nickName;
        }
        switch(mask) {
            case 0:
                return $.lang.get('extralifesystem.lastdonation.0', prefix);
                break;
            case 1:
                return $.lang.get('extralifesystem.lastdonation.1', prefix, donationAmount);
                break;
            case 2:
                return $.lang.get('extralifesystem.lastdonation.2', prefix, donorName);
                break;
            case 3:
                return $.lang.get('extralifesystem.lastdonation.3', prefix, donationAmount, donorName);
                break;
            case 4:
                return $.lang.get('extralifesystem.lastdonation.4', prefix, message);
                break;
            case 5:
                return $.lang.get('extralifesystem.lastdonation.5', prefix, donationAmount, message);
                break;
            case 6:
                return $.lang.get('extralifesystem.lastdonation.6', prefix, donorName, message);
                break;
            case 7:
                return $.lang.get('extralifesystem.lastdonation.7', prefix, donationAmount, donorName, message);
                break;
            default:
                return $.lang.get('extralifesystem.lastdonation.7', prefix, donationAmount, donorName, message);
                break;
        }
    }

    /**
    * @function getMessageMask
    * @param {string} donationAmount
    * @param {string} donorName
    * @param {string} message
    */
    function getMessageMask(donationAmount, donorName, message)
    {
        mask = 0
        if (donationAmount != '$null' && donationAmount != null) {
            mask += 1;
        }
        if (donorName != 'Anonymous') {
            mask += 2;
        }
        if (message != 'null' && message != null && message != "") {
            mask += 4;
        }
        return mask;
    }
       
    /**
    * @setExtraLifeID
    * @return statusOfIDMessage
    * @param {string} setdb
    * @param {integer} id
    * @param {string} sender
    */
    function setID(setdb, id, sender) {
        if (!isNaN(id)) {
                $.inidb.set('extralife', setdb, id)
                return $.lang.get('extralifesystem.setid.updated', $.whisperPrefix(sender));
            } else {
                return $.lang.get('extralifesystem.setid.error', $.whisperPrefix(sender));
            }
    }
    
    /**
     * @event command
     */  
    $.bind('command', function(event) {
        var sender = event.getSender().toLowerCase(),
            command = event.getCommand(),
            args = event.getArgs(),
            username = (args[0] ? args[0].toLowerCase() : false);

        if (command.equalsIgnoreCase(customCommand)) {        
            
            if (args.length == 0 && isSetUp(sender)) {
                $.say($.lang.get('extralifesystem.extralife.say',nickName, hospital, extraLifeURL, emoteLove)); 
                return;
            } else if (args.length == 0){
                return;
            }
            
            if (args[0].equalsIgnoreCase('goal') && isSetUp(sender) && !teamOnly) {
                $.say(pullExtraLifeTotalGoal());
                return;
            }
            if (args[0].equalsIgnoreCase('goal') && isSetUp(sender) && teamOnly) {
                $.say(pullExtraLifeTeamTotalGoal());
                return;
            }

            if (args[0].equalsIgnoreCase('last') && isSetUp(sender) && !teamOnly) {
                data = pullExtraLifeLastDonation();
                $.consoleLn(data);
                $.say(data);
                return;
            }

            if (args[0].equalsIgnoreCase('last') && isTeamSetup(sender) && teamOnly) {
                data = pullExtraLifeLastTeamDonation();
                $.consoleLn("Last data::" + data);
                $.say(data);
                return;
            }

            if (args[0].equalsIgnoreCase('team') && isTeamSetup(sender)) {
                $.say(pullExtraLifeTeamTotalGoal());
                return;
            } else if (args[0].equalsIgnoreCase('team')){
                return;
            }
            
            //Setup Area
            if (args[0].equalsIgnoreCase('id')) {
                $.say(setID('id', args[1], sender));
                extraLifeID = $.inidb.get('extralife','id');
                extraLifeURL = 'https://www.extra-life.org/index.cfm?fuseaction=donate.participant&participantID=' + extraLifeID;
                return;
            }
            
            if (args[0].equalsIgnoreCase('teamid')) {
                $.say(setID('teamid', args[1], sender));
                extraLifeTeamID = $.inidb.get('extralife', 'teamid');
                return;
            }
            
            if (args[0].equalsIgnoreCase('emote')) {
                $.inidb.set('extralife', 'emote', args[1]);
                emoteLove = $.inidb.get('extralife','emote');
                $.say($.lang.get('extralifesystem.emote.set',$.whisperPrefix(sender)));
                return;
            }
            
            if (args[0].equalsIgnoreCase('hospital')) {
                $.inidb.set('extralife', 'hospital', args.slice(1, args.length).toString().replace(/\,/g," "));
                hospital = $.inidb.get('extralife','hospital');
                $.say($.lang.get('extralifesystem.hospital.set',$.whisperPrefix(sender)));
                return;
            }
            
            if (args[0].equalsIgnoreCase('nick')) {
                $.inidb.set('extralife', 'nick', args.slice(1, args.length).toString().replace(/\,/g," "));
                nickName = $.inidb.get('extralife','nick');
                $.say($.lang.get('extralifesystem.nick.set',$.whisperPrefix(sender)));
                return;
            }

            if (args[0].equalsIgnoreCase('teamonly')) {
                teamOnly = $.getIniDbBoolean('extralife','teamonly', false);
                $.say($.lang.get('extralifesystem.teamonly.set',$.whisperPrefix(sender),teamOnly));
                return;
            }

            if (args[0].equalsIgnoreCase('toggleteamonly')) {
                teamOnly = !teamOnly
                $.setIniDbBoolean('extralife','teamonly',teamOnly)
                $.say($.lang.get('extralifesystem.teamonly.set',$.whisperPrefix(sender),teamOnly));
                return;
            }

            if (args[0].equalsIgnoreCase('toggledebug')) {
                DEBUG = !DEBUG
                $.setIniDbBoolean('extralife','debug',DEBUG)
                $.say($.lang.get('extralifesystem.debug.set',$.whisperPrefix(sender),DEBUG));
                return;
            }
            if (args[0].equalsIgnoreCase('togglegifalert')) {
                enableGifAlert = !enableGifAlert
                $.setIniDbBoolean('extralife','gifalert',enableGifAlert)
                $.say($.lang.get('extralifesystem.gifalert.set',$.whisperPrefix(sender),enableGifAlert));
                return;
            }
        }

    });

    /**
     * @event initReady
     */
    $.bind('initReady', function() {
        if ($.bot.isModuleEnabled('./custom/extraLifeSystem.js')) {
            //$.inidb.RemoveFile('extralife');
            $.registerChatCommand('./custom/extraLifeSystem.js', customCommand, 7);
            $.registerChatSubcommand(customCommand, 'team', 7);
            $.registerChatSubcommand(customCommand, 'goal', 7);
            $.registerChatSubcommand(customCommand, 'teamid', 0);
            $.registerChatSubcommand(customCommand, 'id', 0);
            $.registerChatSubcommand(customCommand, 'teamid', 0);
            $.registerChatSubcommand(customCommand, 'emote', 0);
            $.registerChatSubcommand(customCommand, 'hospital', 0);
            $.registerChatSubcommand(customCommand, 'teamonly', 0);
            $.registerChatSubcommand(customCommand, 'toggleteamonly', 0);
            $.registerChatSubcommand(customCommand, 'toggledebug', 0);
            $.registerChatSubcommand(customCommand, 'togglegifalert', 0);

            setInterval(function() { pullExtraLifeDonationsInterval(); }, 15e3);
            setInterval(function() { pullExtraLifeTeamDonationsInterval(); }, 15e3);
        }
    });


})();
