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

            let fullChapter = "";

            let previousChunk = [];
            let secondChunk = "";
            let counter = 0;

            //loop through chunks
            for (const chunk of chunks) {

                // make chunk string
                const chunkString = chunk.join("\n");

                let prompt = `Gere títulos de capítulos do YouTube a partir das seguintes transcrições.\n\n

                TRANSCRIÇÃO:\n
                <<00:00
                e quando você fala que a pessoa tem que
                00:01
                ser perfeita ela não vai conseguir não é
                00:04
                porque ela sabe que ela é iniciante Ela
                00:05
                sabe que ela não vai ser perfeito Ela
                00:07
                sabe que ela vai dar permitam-se serem
                00:10
                ruins para ir você ser bom permita-se
                00:14
                cair enquanto você tá aprendendo andar
                00:16
                antes de correr você vai cair antes de
                00:19
                correr você é um bebê Você Nunca andou
                00:22
                você tem que engatinhar antes e depois
                00:24
                de engatinhar você dá os primeiros
                00:25
                passos meio vacilante mil toques daí
                00:28
                você começa a ter mais firmeza e daí
                00:30
                depois eu tenho que você começa a ter
                00:31
                controle sobre esse tá fazendo e corre é
                00:34
                a quantidade que leva a qualidade todo o
                00:37
                resto é gente com os costumes redutor
                00:40
                falando assim você não precisa fazer
                00:42
                tanto você não precisa fazer isso
                00:44
                precisa fazer aquilo vem aqui compra o>>\n\n
                
                TÍTULO DO CAPÍTULO: 00:00 - Permita-se cair enquanto está aprendendo\n\n
                
                TRANSCRIÇÃO:\n
                <<00:48
                ansiedade lá por favor por favor
                00:51
                sejam honestos na com os cursos que
                00:54
                vocês tenham sou honesto eu não
                00:55
                romantizo né a Paulo daí levantaram
                00:58
                assim a uma uns ir já faz cinco
                01:01
                cirurgias por dia é um cirurgião que não
                01:04
                tem tempo de postar porque senão a
                01:06
                função dele perfeito o cirurgião que vai
                01:08
                cinco cirurgias por dia me parece ainda
                01:10
                um bom dinheiro se ele quer mais
                01:12
                cirurgias e mais pacientes ele que
                01:14
                contrate uma estrategista ele de
                01:16
                contrate um profissional para ajudar ele
                01:18
                na elaboração EA produção desses
                01:20
                conteúdos é simples Fala Paulo mas eu
                01:22
                tenho outra profissão e eu não tenho
                01:24
                dinheiro como é que eu faço Aceite o
                01:26
                desequilíbrio Essa visão romântica de
                01:28
                que a eu não vou ter tempo para mim se>>\n\n
                
                TÍTULO DO CAPÍTULO: 00:48 - Sejam honestos com os cursos de vocês\n\n
                
                TRANSCRIÇÃO:\n
                <<${chunkString}>>\n\n
                
                TÍTULO DO CAPÍTULO:\n`;

                // if second itteration of for loop
                if (counter == 1) {
                    const firstChunkString = chunks[0].join("\n");

                    prompt = `Gere títulos de capítulos do YouTube a partir das seguintes transcrições.\n\n

                TRANSCRIÇÃO:\n
                ${firstChunkString}\n\n
                
                TÍTULO DO CAPÍTULO: ${previousChunk[previousChunk.length - 1]}\n\n
                
                TRANSCRIÇÃO:\n
                <<00:48
                ansiedade lá por favor por favor
                00:51
                sejam honestos na com os cursos que
                00:54
                vocês tenham sou honesto eu não
                00:55
                romantizo né a Paulo daí levantaram
                00:58
                assim a uma uns ir já faz cinco
                01:01
                cirurgias por dia é um cirurgião que não
                01:04
                tem tempo de postar porque senão a
                01:06
                função dele perfeito o cirurgião que vai
                01:08
                cinco cirurgias por dia me parece ainda
                01:10
                um bom dinheiro se ele quer mais
                01:12
                cirurgias e mais pacientes ele que
                01:14
                contrate uma estrategista ele de
                01:16
                contrate um profissional para ajudar ele
                01:18
                na elaboração EA produção desses
                01:20
                conteúdos é simples Fala Paulo mas eu
                01:22
                tenho outra profissão e eu não tenho
                01:24
                dinheiro como é que eu faço Aceite o
                01:26
                desequilíbrio Essa visão romântica de
                01:28
                que a eu não vou ter tempo para mim se>>\n\n
                
                TÍTULO DO CAPÍTULO: 00:48 - Sejam honestos com os cursos de vocês\n\n
                
                
                TRANSCRIÇÃO:\n
                <<${chunkString}>>
                
                TÍTULO DO CAPÍTULO:`;

                } else if (counter >= 2) {
                    const firstChunkString = chunks[counter - 2].join("\n");
                    const secondChunkString = chunks[counter - 1].join("\n");

                    prompt = `Gere títulos de capítulos do YouTube a partir das seguintes transcrições.\n\n
    
                    TRANSCRIÇÃO:\n
                    ${firstChunkString}\n\n
                    
                    TÍTULO DO CAPÍTULO: ${previousChunk[previousChunk.length - 2]}\n\n
                    
                    TRANSCRIÇÃO:\n
                    <<${secondChunkString}>>\n\n
                    
                    TÍTULO DO CAPÍTULO: ${previousChunk[previousChunk.length - 1]}\n\n
                    
                    
                    TRANSCRIÇÃO:\n
                    <<${chunkString}>>\n\n
                    
                    TÍTULO DO CAPÍTULO:\n`;

                    console.log("the prompt is: ", prompt)
                }

                const dynamicMaxLength = Math.floor(4000 - prompt.length / 2.5);

                console.log("the dynamic max length is: ", dynamicMaxLength);

                let newChapter = await generateArticle(prompt, dynamicMaxLength);



                //add newChapter to previousChunk
                previousChunk.push(newChapter);


                fullChapter += newChapter;
                fullChapter += "<br/>";

                counter++;
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
