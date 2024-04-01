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
  const sender: string = sender_data.data.user.name;

  let tagged = req.body.event.text;

  if (tagged == "--undo") {
    if (sender == "gal.ovadia" || sender == "mmoffitt6" || sender == "kralyea") {
      await axios.post(
        "https://slack.com/api/chat.postMessage",
        querystring.stringify({
          token: process.env.SLACK_BOT_TOKEN, //gave the values directly for testing
          channel: 'sniper', //C06S98P6BJP
          text: "The previous snipe has been undone 🤠",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    } else {
      await axios.post(
        "https://slack.com/api/chat.postMessage",
        querystring.stringify({
          token: process.env.SLACK_BOT_TOKEN, //gave the values directly for testing
          channel: 'sniper', //C06S98P6BJP
          text: "Permission denied... 🙄",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    }
    return;
  }

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

  let probate_points = 0;
  let member_points = 0;
  let misc_points = 0;

  for (const name of realNames) {
    if (name == sender) {
      continue;
    }
    if (members.includes(name) && members.includes(sender)) {
      continue;
    }
    if (probates.includes(name) && probates.includes(sender)) {
      continue;
    }
  
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
    const line = `${name} was sniped on ${date} at ${time} by ${sender}\n`;
    if (members.includes(name)) {
      probate_points += 1;
      fs.appendFileSync('scores/members.csv', line);
    } else if (probates.includes(name)) {
      member_points += 1;
      fs.appendFileSync('scores/probates.csv', line);
    } else {
      misc_points += 1;
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


  const probate_message = probate_points > 0 ? `+${probate_points} for probates!\n` : "";
  const member_message = member_points > 0 ? `+${member_points} for members!\n` : "";
  const misc_message = misc_points > 0 ? `+${misc_points} for an unknown team! (This message should never appear, message Gal if you're seeing this)\n` : "";

  await axios.post(
    "https://slack.com/api/chat.postMessage",
    querystring.stringify({
      token: process.env.SLACK_BOT_TOKEN, //gave the values directly for testing
      channel: 'sniper', //C06S98P6BJP
      text: probate_message + member_message + misc_message,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

}