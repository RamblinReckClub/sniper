import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import querystring from "querystring";
import fs from "fs";

type ResponseData = {
  message: string;
};

const RECK_BOT_ID = "B06J9NPLA7Q";
const SNIPER_CHANNEL_ID = "C07TZ0J351S";
const SNIPER_STATS_CHANNEL_ID = "C07TP8ZCRGW";

const processedMessages = new Set<string>();

const teams = {
  "Team T's": [
    "Oh Oh Susannah",
    "Aastha La Vista",
    "Miriam's Maneaters",
    "Muhammad Allie",
  ],
  "Team Bees": [
    "The Dailey Dubs",
    "Ungry Ungry Ippos",
    "Mohr's Whores",
    "Guardians of the Gavaletz",
  ],
};

const UID_TO_USERNAME: { [key: string]: string } = {
  US8T5D7J5: "nisaf3",
  U04LP23EHCG: "bkotharkar3",
  U040E0HN94K: "jmanuel34",
  U02D86HTFP1: "sjohn48",
  U043S32HM4J: "hmkunwer",
  U034DRKDJ49: "sgordon44",
  U04DNFWHE6P: "dwood66",
  U033YACN0JH: "mdubose24",
  U048L7FRU1F: "gal.ovadia",
  U02JT1X66TD: "mardiaarnav",
  U02DUFWKY48: "maronin",
  U02ESPXHWP7: "spatel844",
  U02CZUR2FU2: "mbraunstein7",
  U03FDPKE69H: "cbraun31",
  U03TEUR9MFZ: "mmoffitt6",
  U02CJ237M7X: "ahart43",
  U041Q9U6R6J: "sbaker96",
  U03417T6V5H: "samuel.auborn",
  U040BKZP54J: "rianayar",
  U012SR3FZBR: "simplepoll",
  U02TBHVHBBP: "tgavaletz",
  U01N2CVARUG: "areitano3",
  U043R5TERN2: "szeigler6",
  U02EC44MC5P: "mkistner6",
  U030NC9FZMJ: "cwhite324",
  U04357S9CM8: "aasthasingh",
  U06HZS69M55: "adesai344",
  U02D24KNRGD: "aneeshahj",
  U02AYT9B686: "bmindiak3",
  U06JGSRU2HJ: "hfeeney3",
  U04NYQS0LJ3: "kralyea",
  U04P6NT2VFG: "nphelan6",
  U034DRK55JM: "mguthrie31",
  U02T7G9CX97: "eedwards44",
  U04NYQT3023: "aupton3",
  U05MHMRSEH5: "zprobert3",
  U04PD7M8919: "nunger3",
  U04PDB26282: "wdaly30",
  U04PD7KQULB: "lilyadlesick",
  U03553YS5E1: "zmohr3",
  U02V645GGAF: "aabbott32",
  U06JED8R6TU: "trussell61",
  U02JDLEDZL7: "tpatel313",
  U04LWULMHHT: "bpittman30",
  U06J7PZ9B6J: "dsharma96",
  U04NYQV4DQF: "esunny7",
  U01MR6KDP97: "jlawson64",
  U06CYE31AEN: "hburnside3",
  U05NVFKMLNS: "smolina32",
  U04PNCU0UUC: "svarmeziar3",
  U01MCHJ3HSN: "eprusener",
  U06J7PWNAH4: "jhembree7",
  U06J7PXH170: "kpark380",
  U03E4MD3GFK: "ndailey6",
  U06HZS7GF6K: "sumana6",
  U03417FS1JN: "ndobson3",
  U03UV6MM95H: "epickles3",
  U06HZS72W95: "adakoriya3",
  U0409C3S5UM: "aprabhakar32",
  U055W8MKML6: "mmathur38",
  U05P5944BBP: "vgeyling3",
  U06DP0QP7QA: "cmerchant6",
  U033UHRUC9L: "rvraman",
};

const families = {
  "Oh Oh Susannah": [
    "dwood66",
    "sbaker96",
    "sgordon44",
    "esunny7",
    "mdubose24",
    "jlawson64",
  ],
  "Ungry Ungry Ippos": [
    "hburnside3",
    "kralyea",
    "samuel.auborn",
    "bpittman30",
    "nunger3",
    "maronin",
    "cmerchant6",
    "lilyadlesick",
  ],
  "Mohr's Whores": [
    "mkistner6",
    "zmohr3",
    "jhembree7",
    "rraman",
    "epickles3",
    "tdobson",
    "eedwards44",
    "aprabhakar32",
  ],
  "The Dailey Dubs": [
    "szeigler6",
    "ndailey6",
    "dsharma96",
    "adakoriya3",
    "ahart43",
    "nisaf3",
    "adesai344",
    "gal.ovadia",
  ],
  "Aastha La Vista": [
    "szambrano",
    "hfeeney3",
    "bkotharkar3",
    "aasthasingh",
    "cwhite324",
    "hmkunwer",
    "areitano3",
  ],
  "Miriam's Maneaters": [
    "aupton3",
    "mguthrie31",
    "zprobert3",
    "vgeyling3",
    "sumana6",
    "sjohn48",
  ],
  "Muhammad Allie": [
    "rianayar",
    "mmoffitt6",
    "jmanuel34",
    "aabbott32",
    "trussell61",
    "amathur76",
    "nphelan6",
    "eprusener",
    "cbraun31",
  ],
  "Guardians of the Gavaletz": [
    "spatel844",
    "tgavaletz",
    "tpatel313",
    "mardiaarnav",
    "wdaly30",
    "kpark380",
    "svarmeziar3",
  ],
};

// Create a mapping from username to family name
const usernameToFamily: { [username: string]: string } = {};
for (const [familyName, familyMembers] of Object.entries(families)) {
  for (const member of familyMembers) {
    usernameToFamily[member] = familyName;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Handle Slack challenge verification
  if (req.body?.challenge) {
    return res.send(req.body.challenge);
  }

  // Check for a body
  if (!req.body) {
    return res.status(400).json({ message: "No body" });
  }

  // Check for duplicate messages
  const clientMsgId = req.body.event?.client_msg_id;
  if (clientMsgId && processedMessages.has(clientMsgId)) {
    return res.status(200).end(); // Ignore duplicate request
  }
  if (clientMsgId) {
    processedMessages.add(clientMsgId);
    setTimeout(() => processedMessages.delete(clientMsgId), 5 * 60 * 1000); // Retain for 5 minutes
  }

  // Validate user in UID_TO_USERNAME
  if (!UID_TO_USERNAME.hasOwnProperty(req.body.event.user)) {
    return res.status(200).end();
  }

  // Validate channel ID
  if (req.body.event.channel !== SNIPER_CHANNEL_ID) {
    return res.status(200).end();
  }

  const usernames: string[] = Array.from(
    new Set(
      (req.body.event.text.match(/<@(.*?)>/g) || []).map(
        (match: string) =>
          UID_TO_USERNAME[match.replace(/<@|>/g, "")] || "Unknown"
      )
    )
  );

  if (usernames.length === 0) {
    return res.status(200).end();
  }

  const senderUsername = UID_TO_USERNAME[req.body.event.user];
  const senderTeam = Object.entries(teams).find(([teamName, members]) =>
    members.includes(usernameToFamily[senderUsername])
  )?.[0];

  if (!senderTeam) {
    throw new Error("Sender's team not found");
  }

  let pointsAwarded = 0;
  for (const username of usernames) {
    const targetTeam = Object.entries(teams).find(([teamName, members]) =>
      members.includes(usernameToFamily[username])
    )?.[0];

    if (targetTeam) {
      if (targetTeam !== senderTeam) {
        pointsAwarded += 1;
      } else {
        pointsAwarded -= 1;
      }
    }
  }

  const message = `${pointsAwarded} point${
    pointsAwarded !== 1 ? "s" : ""
  } for team ${senderTeam}`;

  try {
    axios.post(
      "https://slack.com/api/chat.postMessage",
      querystring.stringify({
        token: process.env.SLACK_BOT_TOKEN,
        channel: req.body.event.channel,
        text: message,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    axios.post(
      "https://slack.com/api/chat.postMessage",
      querystring.stringify({
        token: process.env.SLACK_BOT_TOKEN,
        channel: SNIPER_STATS_CHANNEL_ID,
        text: message,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Send a success response after the message is sent
    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
