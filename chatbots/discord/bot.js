import {discord, halo} from '../config.js';

let token = discord.token;
let prefix = discord.prefix;

// Node Files
import { Client, RichEmbed } from '../node_modules/discord.js'; // <-- Discord
import tmi from "../node_modules/tmi.js"; // <-- Twitch
import { XMLHttpRequest } from "../node_modules/xmlhttprequest";

// Initialize Discord
const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("NicmeisteR create me!", { type: "WATCHING" })
});

client.on('message', msg => {
  //   if (msg.content === 'roast') {
  //     msg.reply('Fuck you');
  //   }

  if (msg.author.bot) { return };
  if (msg.channel.type === "dm") { return };

  let messageArray = msg.content.split(" ");

  let cmd = messageArray[0]; // <-- This is the command eg, !halostats
  let args = messageArray.slice(1); // <-- This is the Word that follows

  if (cmd === `${prefix}hello`) {
    return msg.channel.send("Hello!");
  }

  if (cmd === `${prefix}info`) {
    let icon = client.user.displayAvatarURL;
    let info = new RichEmbed()
      //   .setDescription("Know your Senpai!")
      .setTitle("Know your Senpai!")
      .setColor("#008b8b")
      .setThumbnail(icon)
      .addField("I'm your Senpai, call me", client.user.username)
      .addField("Created On ", client.user.createdAt);

    msg.delete().catch(O_o => { });

    return msg.channel.send(info);
  }


  if (cmd === `${prefix}halostats`) {
    emblem(msg);

  }

  if (cmd === `${prefix}serverinfo`) {
    let icon = msg.guild.iconURL;
    let info = new RichEmbed()
      //   .setDescription("Know your Senpai!")
      .setTitle("Server Information")
      .setColor("#008b8b")
      .setThumbnail(icon)
      .addField("Server Name", msg.guild.name)
      .addField("Created On ", msg.guild.createdAt)
      .addField("Joined On ", msg.guild.joinedAt)
      .addField("Total Members ", msg.guild.memberCount);

    return msg.channel.send(info);
  }

});

client.login(token);


function Halo5Stats(ReadGamertag, socket, userIdName) {
  // API Call for Halo Starts Here
  var data = null;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = false;
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {

      // Here the Thing begins
      var stats = JSON.parse(this.responseText)

      // Logs normal stats
      var gamertag = stats.Results[0].Result.PlayerId.Gamertag;

      //build our reply object
      var person = gamertag + "'s Xp Breakdown: \n\n";
      var spartanRank = stats.Results[0].Result.SpartanRank;

      //XP
      var xpCur = stats.Results[0].Result.Xp;
      var xpCurrent = numberFormat(stats.Results[0].Result.Xp);

      //Xp functions
      var goal = numberFormat(50000000);
      var percentage = ((xpCur / 50000000) * 100).toFixed(0) + "%";

      var sr = "SR: " + spartanRank + "\n" + "Percentage: " + percentage + "\n" + "\n";

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
      var warzone = numDecFormat((50000000 - xpCur) / 15000);
      var arena = numDecFormat((50000000 - xpCur) / 3000);
      var infection = numDecFormat((50000000 - xpCur) / 7000);

      var breakdown = "Target Xp: " + goal + '\n' + "Current Xp: " + xpCurrent + "\n\n" + "Left: " + left + "\n\n";
      var matches = "Warzone Matches: " + warzone + "\n" + "Arena Matches: " + arena + "\n" + "Infection Matches: " + infection;
      // var normalStats = person+sr+breakdown+matches;
      var normalStats = person + sr + breakdown;

      // console.log(messages);
      // var msgLenght = messages.length;
      var statusObj = normalStats;
      socket.call('msg', [`@${userIdName} ` + statusObj]);
      console.log(`Ponged ${userIdName}`);
    }
  });
  xhr.open("GET", "https://www.haloapi.com/stats/h5/servicerecords/arena?players=" + ReadGamertag);
  xhr.setRequestHeader("ocp-apim-subscription-key", halo.key);
  xhr.send(data);
}


function getCsrCode(ReadGamertag) {
  var data = null;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = false;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {

      // Commented out but used to work so keep it here if it breaks again
      var csrObject = JSON.parse(this.responseText);
      // var csrObject = this.responseText;
      Halo5Ranks(ReadGamertag, csrObject);
    }
  });

  xhr.open("GET", "https://www.haloapi.com/metadata/h5/metadata/playlists");
  xhr.setRequestHeader("ocp-apim-subscription-key", halo.key);
  xhr.send(data);
}



function Halo5Ranks(ReadGamertag, csrObject) {
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
        if (getPlayerCsr[i].MeasurementMatchesLeft === 0) {
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
      var statusObj = messagesTest;


    }
  });
  xhr.open("GET", "https://www.haloapi.com/stats/h5/servicerecords/arena?players=" + ReadGamertag);
  xhr.setRequestHeader("ocp-apim-subscription-key", halo.key);
  xhr.send(data);
}

function emblem(msg,) {
  var data = null;

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {

      let icon = "https://image.halocdn.com/h5/emblems/311_36_0_48?width=256&hash=Rkv1NdgxEqeKa6NQLxv32HKf4K%2f3XCmCtcDbPFC6rcQ%3d";
      let info = new RichEmbed()
        //   .setDescription("Know your Senpai!")
        .setTitle("Senpai's Stats")
        .setColor("#008b8b")
        .setThumbnail(icon)
        .addField("I'm your Senpai's Emblem")

      msg.delete().catch(O_o => { });

      return msg.channel.send(info);
    }
  });

  xhr.open("GET", "https://www.haloapi.com/profile/h5/profiles/Final%20Necessity/emblem?=");
  xhr.setRequestHeader("ocp-apim-subscription-key", halo.key);

  xhr.send(data);
}