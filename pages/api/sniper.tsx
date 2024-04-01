import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'; // Import Axios
import querystring from 'querystring'; // Import querystring
import fs from 'fs';


type ResponseData = {
  message: string
}

let members = ["gal.ovadia", "spatel844", "areitano3", "mkistner6", "aupton3"];
let probates = ["rianayar", "hburnside3"];

let member_points = 0;
let probate_points = 0;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.send(req.body?.challenge);

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
    console.log("writing line");
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
  }
}