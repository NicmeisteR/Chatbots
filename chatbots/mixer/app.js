import {mixer, halo} from '../config.js';

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Mixer = require('@mixer/client-node');
const ws = require('ws');

console.log("mixer");

let userInfo;

const client = new Mixer.Client(new Mixer.DefaultRequestRunner());

// With OAuth we don't need to log in. The OAuth Provider will attach
// the required information to all of our requests after this call.
client.use(new Mixer.OAuthProvider(client, {
    mixer,
}));

// Gets the user that the Access Token we provided above belongs to.
client.request('GET', 'users/current')
.then(response => {
    userInfo = response.body;
    console.log(userInfo);
	// return new Mixer.ChatService(client).join(206711);
	return new Mixer.ChatService(client).join(response.body.channel.id);
})
.then(response => {
    const body = response.body;
    return createChatSocket(userInfo.id, userInfo.channel.id, body.endpoints, body.authkey);
})
.catch(error => {
    console.error('Something went wrong.');
    console.error(error);
});

/**
* Creates a Mixer chat socket and sets up listeners to various chat events.
* @param {number} userId The user to authenticate as
* @param {number} channelId The channel id to join
* @param {string[]} endpoints An array of endpoints to connect to
* @param {string} authkey An authentication key to connect with
* @returns {Promise.<>}
*/



function createChatSocket (userId, channelId, endpoints, authkey) {
    // Chat connection
    const socket = new Mixer.Socket(ws, endpoints).boot();

    // Greet a joined user
    socket.on('UserJoin', data => {
        socket.call('msg', [`Hi ${data.username}! I'm BotmeisteR! Welcome to the stream!`]);
    });

    // React to our !pong command
    socket.on('ChatMessage', data => {
        if (data.message.message[0].data.toLowerCase().startsWith('!halostats')) {

            var gamertag = data.message.message[0].data.toLowerCase();
            gamertag = gamertag.split("!halostats for ").pop();
            gamertag = gamertag.trim();

            var userIdName = data.user_name;
            Halo5Stats(gamertag, socket,userIdName );
        }
    });

    socket.on('ChatMessage', data => {
        if (data.message.message[0].data.toLowerCase().startsWith('!haloranks')) {

            var gamertag = data.message.message[0].data.toLowerCase();
            gamertag = gamertag.split("!haloranks for ").pop();
            gamertag = gamertag.trim();
            // console.log(gamertag);

            var userIdName = data.user_name;
            getCsrCode(gamertag, socket,userIdName );
        }
    });

    // Handle errors
    socket.on('error', error => {
        console.error('Socket error');
        console.error(error);
    });

    return socket.auth(channelId, userId, authkey)
    .then(() => {
        console.log('Login successful');
        return socket.call('msg', ['Hi! I\'m BotmeisteR! Welcome to the stream!']);
    });
}

function Halo5Stats(ReadGamertag, socket, userIdName){
    // API Call for Halo Starts Here
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {

            // Here the Thing begins
            var stats = JSON.parse(this.responseText)

            // Logs normal stats
            var gamertag =  stats.Results[0].Result.PlayerId.Gamertag;
    
            //build our reply object
            var person = gamertag+"'s Xp Breakdown: \n\n";
            var spartanRank = stats.Results[0].Result.SpartanRank;
            
            //XP
            var xpCur = stats.Results[0].Result.Xp;
            var xpCurrent = numberFormat(stats.Results[0].Result.Xp);

            //Xp functions
            var goal = numberFormat(50000000);
            var percentage = ((xpCur/50000000)*100).toFixed(0) +"%";

            var sr = "SR: "+spartanRank+"\n"+"Percentage: " + percentage +"\n"+"\n";

            function numberFormat(x) {
                return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }

            function numDecFormat(x) {
                var reformat = x.toFixed(0);
                var parts = reformat.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                return parts.join(".");
            }
            
            var left = numberFormat(50000000 - xpCur); 
            var warzone = numDecFormat((50000000 - xpCur)/15000);
            var arena = numDecFormat((50000000 - xpCur)/3000);
            var infection = numDecFormat((50000000 - xpCur)/7000);

            var breakdown = "Target Xp: "+ goal + '\n' + "Current Xp: " + xpCurrent + "\n\n" + "Left: " + left + "\n\n";
            var matches = "Warzone Matches: " + warzone + "\n" + "Arena Matches: " + arena + "\n" + "Infection Matches: " + infection;
            // var normalStats = person+sr+breakdown+matches;
            var normalStats = person+sr+breakdown;

            // console.log(messages);
            // var msgLenght = messages.length;
            var statusObj = normalStats ;
            socket.call('msg', [`@${userIdName} `+statusObj]);
            console.log(`Ponged ${userIdName}`);
        }
    });
    xhr.open("GET", "https://www.haloapi.com/stats/h5/servicerecords/arena?players="+ReadGamertag);
    xhr.setRequestHeader("ocp-apim-subscription-key", halo.key);
    xhr.send(data);
}


function getCsrCode(ReadGamertag, socket, userIdName) {
	var data = null;
	var xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === this.DONE) {

			// Commented out but used to work so keep it here if it breaks again
			var csrObject = JSON.parse(this.responseText);
			// var csrObject = this.responseText;
            Halo5Ranks(ReadGamertag, csrObject, socket, userIdName);
		}
	});

	xhr.open("GET", "https://www.haloapi.com/metadata/h5/metadata/playlists");
	xhr.setRequestHeader("ocp-apim-subscription-key", halo.key);
	xhr.send(data);
}



function Halo5Ranks(ReadGamertag, csrObject, socket, userIdName) {
	// API Call for Halo Starts Here
	var data = null;
	var xhr = new XMLHttpRequest();
	xhr.withCredentials = false;
	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === this.DONE) {

			// Here the Thing begins
			var stats = JSON.parse(this.responseText);

			//console.log(rankImg);
			// Get the Player CSR Designations
			var getPlayerCsr = stats.Results[0].Result.ArenaStats.ArenaPlaylistStats;

			// Get the Playlists IDs
			csrDesignation = csrObject;

			// Designations:
			var designation = {
				7: 'Champion',
				6: 'Onyx',
				5: 'Diamond',
				4: 'Platinum',
				3: 'Gold',
				2: 'Silver',
				1: 'Bronze',
				0: 'Unranked'
			};

			// Checks how many placements the player has
			var datalength = getPlayerCsr.length;

			// Array of Messages
			var messages = [];
			var messagesName = [];
			var rankImgUrl = [];

			var messagesTest = '';

			// Loop through the players Placements
			for (var i = 0; i < datalength; i++) {


				// Gets the playlistID from the player
				var playlistId = getPlayerCsr[i].PlaylistId;

				// Gets the player CSR if they are Onyx or Champion
				var playlistCsr;

				// Gets the player Tier
				var playlistTier;

				// If to select Designation:
if (getPlayerCsr[i].MeasurementMatchesLeft === 0)
{
	if (getPlayerCsr[i].Csr.Csr === 0) {
		playlistCsr = getPlayerCsr[i].Csr.Csr;

		// This is the Rank (Onyx,Champ etc)
		var designationId = getPlayerCsr[i].Csr.DesignationId;

		// This is the Tier
		var tier = getPlayerCsr[i].Csr.Tier;

		// This is Rank and Tier
		var fullRank = designation[designationId] + ' ' + tier;

	}
	else if (getPlayerCsr[i].Csr.DesignationId === 6) {

		// This gets the Onyx Rank
		var designationId = getPlayerCsr[i].Csr.DesignationId;

		// This gets the Onyx CSR
		var csr = getPlayerCsr[i].Csr.Csr;

		// This is Rank and CSR
		var fullRank = designation[designationId] + ' ' + csr;
	}
	else if (getPlayerCsr[i].Csr.DesignationId === 7) {

		// This gets the Champion Rank
		var designationId = getPlayerCsr[i].Csr.DesignationId;

		// This gets the Champion CSR
		var csr = getPlayerCsr[i].Csr.Rank;

		// This is Rank and CSR
		var fullRank = designation[designationId] + ' ' + csr;
	}

	// Gets the playlistID
	var playlistId = getPlayerCsr[i].PlaylistId;

	// For Loop to find playlist name in meta data
	for (var n = 0; n < csrDesignation.length; n++) {
		if (csrDesignation[n].id === playlistId) {

			// Name for the playlist
			var playlistName = csrDesignation[n].name;
		}
	}
	// getRankImg(designationId, designation);

	var msg = playlistName + ': ' + fullRank + "\n";

	// messages.push({ msg: fullRank });   
	// messagesName.push({ msg: playlistName });
	// rankImgUrl.push({ url: playlistName });
	messagesTest = messagesTest + msg;
	// console.log(msg);
}


			}

			// Logs normal stats
			var gamertag = stats.Results[0].Result.PlayerId.Gamertag;
			var csr = stats.Results[0].Result.ArenaStats.HighestCsrAttained.Csr;

			//build our reply object
			var person = gamertag + "'s Profile: \n\n";
			var highCsr = "Highest CSR: " + csr + "\n";
			var normalStats = person + highCsr;

			// console.log(messages);
            var statusObj = messagesTest ;

            socket.call('msg', [`@${userIdName} `+statusObj]);
            console.log(`Ponged ${userIdName}`);
		}
	});
	xhr.open("GET", "https://www.haloapi.com/stats/h5/servicerecords/arena?players=" + ReadGamertag);
	xhr.setRequestHeader("ocp-apim-subscription-key", halo.key);
	xhr.send(data);
}