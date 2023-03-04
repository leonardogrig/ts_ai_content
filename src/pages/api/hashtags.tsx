import { Configuration, OpenAIApi } from "openai";
import { Request, Response } from "express";

const generateHashtags = async (
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
        temperature: 0.5,
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
        const article = req.body.chat;

        const articleText = article.substring(0, 2500)

        //get first block of <br> from article
        const firstBlock = articleText.substring(0, articleText.indexOf("<br>"));

        //get second block of <br> from article
        const secondBlock = articleText.substring(
            articleText.indexOf("<br>") + 4,
            articleText.indexOf("<br>", articleText.indexOf("<br>") + 4)
        );

        console.log(firstBlock);
        console.log(secondBlock);
        
        const prompt = `Texto:\n
        <<Atualmente, o mundo está caótico e eu não falo muito com as pessoas. No entanto, aqui no meu canal, eu falo bastante. Hoje, eu quero mostrar um pouco da minha rotina da tarde/noite, que não sei quando vai acabar. Agora são 3 horas da manhã e eu estou muito cansada, mas tenho que fazer muitas coisas, pois no fim de semana passado eu fui muito produtivo e postei vídeos nos dois últimos dias>>\n\n
        
        Apenas 5 palavras chaves do texto:\n
        caos, cansaço, rotina, produtividade, videos\n\n
        
        Texto:\n
        <<Estou feliz comigo mesma porque consegui ser produtiva e adiantar meus estudos. No entanto, ainda tenho muitas coisas para fazer, como ler o livro Dom Casmurro de Machado de Assis, que precisa ser lido até março. Além disso, quero ler outros livros, mas não consigo porque não quero ler no celular. Por outro lado, meu quarto finalmente está do jeito que eu sempre sonhei: bonito e fofo. Vocês não estão vendo nem metade dele, mas tem posters e outros objetos decorativos.
        Estou arrumando meu quarto e pendurei uma tapeçaria com Nossa Senhora. Estou também montando uma estante com caixas de uva, que ficou muito fofa. Estou gravando muitos vídeos seguidos e meu armazenamento acabou, então tive que apagar alguns. Se em algum vídeo eu postar algo incompleto, é por causa disso>>\n\n
        
        Apenas 5 palavras chaves do texto:\n
        Felicidade, Estudos, Livros, Posters, Decoração\n\n
        
        Texto:\n
        <<${articleText}>>\n\n

        Apenas 5 palavras chaves do texto:\n
        `;

        const hashtags = await generateHashtags(prompt, 200);


        if (hashtags) {
            res.json(hashtags);
        } else {
            res.status(500).send("Oops, Something went wrong!!");
        }
    } else {
        res.status(404).send("Please, write your chat!!");
    }

}