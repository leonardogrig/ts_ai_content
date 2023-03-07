import { Configuration, OpenAIApi } from "openai";
import { getSubtitles } from "youtube-captions-scraper";
import { Request, Response } from "express";

const generateArticle = async (
  prompt: string,
  dynamicMaxLength: number
): Promise<string> => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0,
    max_tokens: dynamicMaxLength,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const textData = response.data.choices[0]["text"]!.replace(/\n/g, "<br/>");

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
        lang: "pt",
      });

      const captions = subtitles.map((caption: { text: any }) => caption.text);

      let captionsString = captions.join(" ");

      const blockSize = 2000;

      let startIndex = 0;
      let endIndex = blockSize;
      let article = "";
      let previousBlock = "";

      let iteration = 0;
      while (startIndex < captionsString.length) {
        console.log("Iteration: " + iteration);
        iteration++;

        // do only in first iteration
        if (startIndex === 0) {
          let firstBlock = captionsString.substring(startIndex, endIndex);

          console.log("First block: " + firstBlock);

          const prompt = `Produza um artigo completo para wordpress, no mínimo 2000 caracteres e em português, do texto entre aspas a seguir. Eu sou o autor dele, então gostaria que fosse escrito em primeira pessoa. Este é o texto:\n "${firstBlock}"\n`;

          const dynamicMaxLength = Math.floor(4000 - prompt.length / 2.5);

          try {
            previousBlock = await generateArticle(prompt, dynamicMaxLength);
            // get only last 1000 characters of the previousBlock variable
            if (previousBlock.length > 1000) {
              previousBlock = previousBlock.substring(
                previousBlock.length - 1000
              );
            }

            console.log("First result: ", previousBlock);
            article += previousBlock;
            startIndex = endIndex;
            endIndex += blockSize;
          } catch (error) {
            console.log(error);
            return res
              .status(500)
              .json({ message: "Oops, Something went wrong!!", error: error });
          }
        } else {
          let block = captionsString.substring(startIndex, endIndex);

          console.log("Block: " + iteration + " ... " + block);

          const prompt = `
           Sua última resposta foi: "${previousBlock}", não repita o texto anterior. Continue reestruturando e produzindo um artigo, em português. Sou o autor do texto, portanto gostaria que fosse escrito em primeira pessoa. Este é o texto que precisa ser reescrito:\n "${block}"\n`;

          if (endIndex > captionsString.length) {
            endIndex = captionsString.length;
          }

          const dynamicMaxLength = Math.floor(4000 - prompt.length / 2.5);

          try {
            previousBlock = await generateArticle(prompt, dynamicMaxLength);

            if (previousBlock.length > 1000) {
              previousBlock = previousBlock.substring(
                previousBlock.length - 1000
              );
            }
            console.log("Result: ", previousBlock);
            article += previousBlock;
            startIndex = endIndex;
            endIndex += blockSize;
          } catch (error) {
            console.log(error);
            return res
              .status(500)
              .json({ message: "Oops, Something went wrong!!", error: error });
          }
        }
      }

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
