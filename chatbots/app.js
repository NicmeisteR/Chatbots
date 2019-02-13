// Start up Twitch Bot
const { spawn } = require('child_process');

// discord, mixer, twitch

function getBat(bot) {

    // Start up Bot
    const batch = spawn('cmd.exe', ['/c', bot + '.bat']);

    batch.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    batch.stderr.on('data', (data) => {
        console.log(data.toString());
    });

    batch.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
    });

};


getBat('dicord');
// getBat('mixer');