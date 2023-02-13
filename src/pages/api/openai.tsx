import { Configuration, OpenAIApi } from "openai";
import { getSubtitles } from 'youtube-captions-scraper';
import express, {Request, Response} from 'express';

const generateArticle = async (captionsString: string, dynamicMaxLength: number): Promise<string> => {
  const configuration = new Configuration({
    apiKey: process.env.API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Produza um artigo completo para wordpress, com headers, subheaders, "/n" entre os parágrafos e no mínimo 2000 caracteres, em português do texto entre aspas. Eu sou o autor dele, então gostaria que fosse escrito em primeira pessoa. Este é o texto:\n\n "${captionsString}"`,
    temperature: 0,
    max_tokens: dynamicMaxLength,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  });

  const textData = response.data.choices[0]['text']!.replace(/\n/g, '<br/>');
  
  return textData;
};

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed!!" });
    return;
  }

  if (req.method === "POST") {
    const chat = req.body.chat;
    if (chat) {
      const subtitles = await getSubtitles({
        videoID: chat,
        lang: 'pt'
      });

      const captions = subtitles.map((caption: { text: any; }) => caption.text);

      let captionsString = captions.join(' ');

      captionsString = `"${captionsString}"`;

      const stringLength:number = captionsString.length;

      const dynamicMaxLength = Math.floor(4000 - (stringLength / 2.5));

      console.log(dynamicMaxLength)

      const article = await generateArticle(captionsString, dynamicMaxLength);

      if (article) {
        res.json(article);
      } else {
        res.status(500).send("Oops, Something went wrong!!");
      }
    } else {
      res.status(404).send("Please, write your chat!!");
    }
  }
}