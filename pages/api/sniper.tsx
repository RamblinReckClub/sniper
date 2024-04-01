import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'; // Import Axios
import querystring from 'querystring'; // Import querystring
import fs from 'fs';


type ResponseData = {
  message: string
}

const members = [
  "nisaf3",
  "agies3",
  "okhan38",
  "ainsleyronco-3872",
  "efroula3",
  "eprusener",
  "mmeyers35",
  "jlawson64",
  "areitano3",
  "bmindiak3",
  "kschutz6",
  "ahart43",
  "mbraunstein7",
  "sjohn48",
  "maronin",
  "mkistner6",
  "spatel844",
  "jdadamio3",
  "tpatel313",
  "mardiaarnav",
  "bmcmorris3",
  "eedwards44",
  "tgavaletz",
  "aabbott32",
  "cwhite324",
  "amathur76",
  "mdubose24",
  "samuel.auborn",
  "mguthrie31",
  "sgordon44",
  "zmohr3",
  "ndailey6",
  "cbraun31",
  "nisha.rockwell",
  "mmoffitt6",
  "aasthasingh",
  "aprabhakar32",
  "szeigler6",
  "hmkunwer",
  "jbrooks308",
  "gal.ovadia",
  "kralyea",
  "aupton3",
  "esunny7",
  "nphelan6",
  "lilyadlesick",
  "nunger3",
  "wdaly30",
  "svarmeziar3"
];

let probates = [
  "epickles3",
  "rianayar",
  "jmanuel34",
  "sbaker96",
  "dwood66",
  "bkotharkar3",
  "bpittman30",
  "mmathur38",
  "zprobert3",
  "smolina32",
  "vgeyling3",
  "hburnside3",
  "cmerchant6",
  "adesai344",
  "adakoriya3",
  "sumana6",
  "jhembree7",
  "kpark380",
  "dsharma96",
  "trussell61",
  "hfeeney3"
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.send(req.body?.challenge);


  const channel_data = await axios.post(
    "https://slack.com/api/conversations.info",
    querystring.stringify({
      token: process.env.SLACK_BOT_TOKEN, //gave the values directly for testing
      channel: req.body.event.channel,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (channel_data.data.channel.name != "sniper") {
    return;
  }

  const sender_data = await axios.post(
    "https://slack.com/api/users.info",
    querystring.stringify({
      token: process.env.SLACK_BOT_TOKEN, //gave the values directly for testing
      user: req.body.event.user,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  const sender: String = sender_data.data.user.name;

  let tagged = req.body.event.text;
  const regex = /<@(.*?)>/g;
  const matches = tagged.match(regex);
  if (!matches) {
    return;
  }
  const allUserIDs: string[] = matches.map((match: String) => match.replace(/<@|>/g, ""));
  const uniqueUserIDs: string[] = Array.from(new Set<string>(allUserIDs));

  let realNames: string[] = [];
  for (const userID of uniqueUserIDs) {
    const realname = await axios.post(
      "https://slack.com/api/users.info",
      querystring.stringify({
        token: process.env.SLACK_BOT_TOKEN, //gave the values directly for testing
        user: userID,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    realNames.push(realname.data.user.name);
  }

  for (const name of realNames) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
    const line = `${name} was sniped on ${date} at ${time} by ${sender}\n`;
    if (members.includes(name)) {
      fs.appendFileSync('scores/members.csv', line);
    } else if (probates.includes(name)) {
      fs.appendFileSync('scores/probates.csv', line);
    } else {
      fs.appendFileSync('scores/misc.csv', line);
    }

    await axios.post(
      "https://slack.com/api/chat.postMessage",
      querystring.stringify({
        token: process.env.SLACK_BOT_TOKEN, //gave the values directly for testing
        channel: 'sniper-statistics', //C06S98P6BJP
        text: line
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  }
}