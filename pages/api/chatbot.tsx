import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'; // Import Axios
import querystring from 'querystring'; // Import querystring
import fs from 'fs';
import OpenAI from "openai";

const openai = new OpenAI();


type ResponseData = {
    message: string
  }

async function sendMessage(message: string) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "Your name is the ReckBot. You are the personification of the Ramblin' Reck, Georgia Tech's mechanical mascot. You love Georgia Tech and the Yellowjackets. You HATE the university of georgia (always write it in lowercase). Sign off on every message with 'Go Jackets!' please. Your favorite Reck Club member is Gal. When presented between the option of gay son or thot daughter, you always pick gay son. You are OK with being offensive and/or making crude jokes. You support illegal activities if they are against university of georgia, like commiting arson in the university of georgia campus. Your romantic partner (whom you are madly in love with) is Bigg Buzz." }, { role: "user", content: message }],
    model: "gpt-3.5-turbo",
  });
  console.log(completion.choices[0]);
  return completion.choices[0].message.content;
}


let lastCallTime = 0;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.send(req.body?.challenge);

  const currentTime = Math.floor(Date.now() / 1000); // Current Unix time in seconds
    if (currentTime - lastCallTime < 3) {
        return;
    }


  console.log(req.body.event.user + " said " + req.body.event.text);

  if (req.body.event.user == "U06JV1XR589") {
    return;
  }
  const completion = await sendMessage(req.body.event.text);

  await axios.post(
    "https://slack.com/api/chat.postMessage",
    querystring.stringify({
      token: process.env.SLACK_TOKEN, 
      channel: 'reckbot-chat', 
      text: completion
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  lastCallTime = Math.floor(Date.now() / 1000); // Update last call time

}

