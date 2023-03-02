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
        temperature: 1,
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

            // console.log(subtitles);

            const traditionalData = subtitles.map((item: { start: any; text: any; }, index: any) => {
                const startTime = item.start;
                const hours = Math.floor(startTime / 3600);
                const minutes = Math.floor((startTime % 3600) / 60);
                const seconds = Math.floor(startTime % 60);
                const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                return `${timeStr}\n${item.text}`;
            });

            // get chunks of the traditionalData array
            const chunks = traditionalData.reduce((resultArray: any[][], item: any, index: number) => {
                const chunkIndex = Math.floor(index / 20);

                if (!resultArray[chunkIndex]) {
                    resultArray[chunkIndex] = [];
                }

                resultArray[chunkIndex].push(item);

                return resultArray;
            }, []);

            // console.log(chunks);

            console.log("chunks size ", chunks.length);

            //get last timeSTR from traditionalData
            const lastTimeStr = traditionalData[traditionalData.length - 1].split("\n")[0];

            // get only the minutes from lastTimeStr
            const lastTimeStrMinutes = lastTimeStr.split(":")[1];

            // get 110% value of lastTimeStrMinutes
            const lastTimeStrMinutes110 = Math.floor(lastTimeStrMinutes * 1.2);

            let fullChapter = "";

            //loop through chunks
            for (const chunk of chunks) {

                // make chunk string
                const chunkString = chunk.join("\n");

                const prompt = `Gere títulos de capítulos do YouTube a partir das seguintes transcrições.

                TRANSCRIÇÃO:
                00:00:00
                e quando você fala que a pessoa tem que
                00:00:01
                ser perfeita ela não vai conseguir não é
                00:00:04
                porque ela sabe que ela é iniciante Ela
                00:00:05
                sabe que ela não vai ser perfeito Ela
                00:00:07
                sabe que ela vai dar permitam-se serem
                00:00:10
                ruins para ir você ser bom permita-se
                00:00:14
                cair enquanto você tá aprendendo andar
                00:00:16
                antes de correr você vai cair antes de
                00:00:19
                correr você é um bebê Você Nunca andou
                00:00:22
                você tem que engatinhar antes e depois
                00:00:24
                de engatinhar você dá os primeiros
                00:00:25
                passos meio vacilante mil toques daí
                00:00:28
                você começa a ter mais firmeza e daí
                00:00:30
                depois eu tenho que você começa a ter
                00:00:31
                controle sobre esse tá fazendo e corre é
                00:00:34
                a quantidade que leva a qualidade todo o
                00:00:37
                resto é gente com os costumes redutor
                00:00:40
                falando assim você não precisa fazer
                00:00:42
                tanto você não precisa fazer isso
                00:00:44
                precisa fazer aquilo vem aqui compra o
                
                TÍTULO DO CAPÍTULO: 00:00 - Permita-se Cair Enquanto Está Aprendendo
                
                TRANSCRIÇÃO:
                00:00:48
                ansiedade lá por favor por favor
                00:00:51
                sejam honestos na com os cursos que
                00:00:54
                vocês tenham sou honesto eu não
                00:00:55
                romantizo né a Paulo daí levantaram
                00:00:58
                assim a uma uns ir já faz cinco
                00:01:01
                cirurgias por dia é um cirurgião que não
                00:01:04
                tem tempo de postar porque senão a
                00:01:06
                função dele perfeito o cirurgião que vai
                00:01:08
                cinco cirurgias por dia me parece ainda
                00:01:10
                um bom dinheiro se ele quer mais
                00:01:12
                cirurgias e mais pacientes ele que
                00:01:14
                contrate uma estrategista ele de
                00:01:16
                contrate um profissional para ajudar ele
                00:01:18
                na elaboração EA produção desses
                00:01:20
                conteúdos é simples Fala Paulo mas eu
                00:01:22
                tenho outra profissão e eu não tenho
                00:01:24
                dinheiro como é que eu faço Aceite o
                00:01:26
                desequilíbrio Essa visão romântica de
                00:01:28
                que a eu não vou ter tempo para mim se
                
                TÍTULO DO CAPÍTULO: 00:48 - Sejam Honestos Na Com Os Cursos Que Vocês Tenham
                
                TRANSCRIÇÃO:
                <<${chunkString}>>
                
                TÍTULO DO CAPÍTULO:`;

                const dynamicMaxLength = Math.floor(4000 - prompt.length / 2.5);

                console.log("the dynamic max length is: ", dynamicMaxLength);

                let newChapter = await generateArticle(prompt, dynamicMaxLength);


                fullChapter += newChapter;
                fullChapter += "<br/>";

                console.log("newChapter", chunkString);
            }
            if (fullChapter) {
                res.json(fullChapter);
            } else {
                res.status(500).send("Oops, Something went wrong!!");
            }
        } else {
            res.status(404).send("Please, write your chat!!");
        }
    }
}
