import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'; // Import Axios
import querystring from 'querystring'; // Import querystring
import fs from 'fs';
import OpenAI from "openai";
import { WebClient } from '@slack/web-api'

const openai = new OpenAI();


type ResponseData = {
    message: string
  }


async function generateAndSaveImage(prompt: string) {
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
    });

    const imageUrl = response.data[0].url;

    if (!imageUrl) {
        throw new Error('Image URL is undefined.');
    }

    const imageFileName = Math.random().toString(36).substring(2, 12) + '.jpg'; // Generate a random string of 10 characters as the image file name

    // Download the image
    const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
    });

    // Save the image locally
    fs.writeFileSync('images/' + imageFileName, imageResponse.data, 'binary');

    console.log(`Image saved as ${imageFileName}`);
    return imageFileName;
}



// Initialize a WebClient with your Slack token
const web = new WebClient(process.env.SLACK_BOT_TOKEN);

// Function to upload an image to Slack
async function uploadImageToSlack(imagePath: String) {
    try {
        // Read the image file as a binary buffer
        const imageBuffer = fs.readFileSync(imagePath.toString());

        // Upload the image to Slack
        const result = await web.files.upload({
            channels: 'reckbot-chat',
            file: imageBuffer,
            filename: imagePath + '.jpg', // Specify the filename you want on Slack
        });

        if (result.file) {
            console.log('Image uploaded successfully:', result.file.id);
        } else {
            console.log('Image upload failed: result.file is undefined');
        }
    } catch (error) {
        console.error('Error uploading image to Slack:', error);
    }
}




export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
  ) {
    res.send(req.body?.challenge);
  
    if (req.body.event.user == "U06JV1XR589") {
        return;
    }
    console.log(req.body.event.user + " said " + req.body.event.text);

    const imageFileName = await generateAndSaveImage(req.body.event.text);

    await uploadImageToSlack('images/' + imageFileName)

    return;
  
  }
  







