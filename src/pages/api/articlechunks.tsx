import { Configuration, OpenAIApi } from "openai";
import { getSubtitles } from "youtube-captions-scraper";
import { Request, Response } from "express";


function formatString(str: string) {
    // Replace any tags that are not <br> with an empty string
    str = str.replace(/<(?!br\s*\/?)[^>]+>/gi, '');
  
    // Split the string into paragraphs using <br> tags as the delimiter
    let paragraphs = str.split(/<br\s*\/?>/gi);
  
    // Loop through each paragraph and count the number of phrases
    for (let i = 0; i < paragraphs.length; i++) {
      let phrases = paragraphs[i].split(/[.?!]+/g);
      let numPhrases = phrases.filter(Boolean).length;
  
      // If the paragraph has more than 3 phrases, add a single <br/> tag before and after it
      if (numPhrases > 3) {
        paragraphs[i] = '<br/>' + paragraphs[i] + '<br/>';
      }
    }
  
    // Join the paragraphs back into a single string
    str = paragraphs.join('<br/>');
  
    
    
    // Replace any tags that are not <br> with an empty string
    str = str.replace(/<(?!br\s*\/?)[^>]+>/gi, '');
  
    // Replace any groups of more than two <br> tags with exactly two
    str = str.replace(/(<br\s*\/?>){3,}/gi, '<br/><br/>');
    
    // Replace any remaining groups of two <br> tags with exactly two
    str = str.replace(/(<br\s*\/?>){2,}/gi, '<br/><br/>');
    
    
    
    // Remove any leading or trailing whitespace
    str = str.trim();
  
    return str;
  }
  

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
        const chat = req.body.chat;
        if (chat) {
            const subtitles = await getSubtitles({
                videoID: chat,
                lang: "pt",
            });

            const traditionalData = subtitles.map((item: { start: any; text: any; }, index: any) => {
                return `${item.text}`;
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

            let article = "";
            let resumeArticle = "";
            // loop through chunks
            let counter = 0;
            for (const chunk of chunks) {
                
                const chunkString = chunk.join(" ");

                const prompt = `Este é um pedaço de legenda de um vídeo do youtube:
                e quando você fala que a pessoa tem que ser perfeita ela não vai conseguir não é porque ela sabe que ela é iniciante Ela sabe que ela não vai ser perfeito Ela sabe que ela vai dar permitam-se serem ruins para ir você ser bom permita-se cair enquanto você tá aprendendo andar antes de correr você vai cair antes de correr você é um bebê Você Nunca andou você tem que engatinhar antes e depois de engatinhar você dá os primeiros passos meio vacilante mil toques daí você começa a ter mais firmeza e daí depois eu tenho que você começa a ter controle sobre esse tá fazendo e corre é a quantidade que leva a qualidade todo o resto é gente com os costumes redutor falando assim você não precisa fazer tanto você não precisa fazer isso precisa fazer aquilo vem aqui compra o
                
                Legenda reescrita, em primeira pessoa, no formato de resumo:
                Quando se fala em perfeição, é importante lembrar que, como iniciante, é impossível alcançá-la. Eu encorajo as pessoas a permitirem que elas mesmas cometam erros enquanto estão aprendendo, assim como um bebê que precisa engatinhar antes de andar. No processo de aprendizado, é normal tropeçar algumas vezes antes de se tornar mais firme e ter controle sobre o que está fazendo. Eu acredito que a quantidade de prática é o que leva à qualidade, e não há fórmula mágica ou atalhos para o sucesso. Algumas pessoas tentam vender soluções reducionistas, dizendo que não é necessário fazer tanto ou que só é preciso seguir uma fórmula específica. Mas eu acredito que é importante perseverar e seguir o caminho que funciona melhor para cada um.
                
                Este é um pedaço de legenda de um vídeo do youtube:
                meu curso que eu te ensino eu não tenho ansiedade lá por favor por favor sejam honestos na com os cursos que vocês tenham sou honesto eu não romantizo né a Paulo daí levantaram assim a uma uns ir já faz cinco cirurgias por dia é um cirurgião que não tem tempo de postar porque senão a função dele perfeito o cirurgião que vai cinco cirurgias por dia me parece ainda um bom dinheiro se ele quer mais cirurgias e mais pacientes ele que contrate uma estrategista ele de contrate um profissional para ajudar ele na elaboração EA produção desses conteúdos é simples Fala Paulo mas eu tenho outra profissão e eu não tenho dinheiro como é que eu faço Aceite o desequilíbrio Essa visão romântica de que a eu não vou ter tempo para mim se
                
                Legenda reescrita, em primeira pessoa, no formato de resumo:
                No meu curso, eu incentivo meus alunos a serem honestos e não terem ansiedade em relação aos resultados. Eu sou honesto e não romantizo o sucesso. Recentemente, um cirurgião foi citado como exemplo, pois faz cinco cirurgias por dia e não tem tempo para postar conteúdo. Embora ele ganhe bem, se quiser mais pacientes, ele poderia contratar um profissional para ajudar na produção de conteúdo. Se alguém me questionar dizendo que tem outra profissão e não tem dinheiro, eu aconselho a aceitar o desequilíbrio e não se iludir com a visão romântica de que não terá tempo para si mesmo.
                
                Este é um pedaço de legenda de um vídeo do youtube:
                ${chunkString}
                
                Legenda reescrita, em primeira pessoa, no formato de resumo:
                `

                const dynamicMaxLength = Math.floor(4000 - prompt.length / 2.5);
                // generate article
                const pieceOfContent = await generateArticle(prompt, dynamicMaxLength);

                article += pieceOfContent;
                counter++;

                // on the third iteration
                if (counter == 3) {
                    const prompt = `Este é um texto sem nexo:\n
                    ${article}\n
                    Este é um trecho de um artigo reescrito com titulo e subtitulo:\n
                    ` ;

                    const dynamicMaxLength = Math.floor(4000 - prompt.length / 2.5);

                    const resumeOfArticle = await generateArticle(prompt, dynamicMaxLength);
                    resumeArticle += "<br/><br/>";
                    resumeArticle += resumeOfArticle;
                    article = "";
                    counter = 0;
                }

                // if on last iteration
                if (chunk === chunks[chunks.length - 1] || chunk === chunks[chunks.length - 2] || chunk === chunks[chunks.length - 3]) {
                    if (counter == 0 || counter == 1 || counter == 2) {
                        resumeArticle += article;
                    }
                }
            }

            article = resumeArticle;

            if (article.length < 2500) {

                const prompt = `Este é um texto sem nexo:\n
                ${article}\n
                
                Este é o mesmo texto, reescrito em formato de artigo:\n
                ` ;

                const dynamicMaxLength = Math.floor(4000 - prompt.length / 2.5);

                const resumeOfArticle = await generateArticle(prompt, dynamicMaxLength);

                article = resumeOfArticle;
                console.log("ARTIGO MODIFICADO");
            }


            if (article) {
                res.json(formatString(article));
            } else {
                res.status(500).send("Oops, Something went wrong!!");
            }
        } else {
            res.status(404).send("Please, write your chat!!");
        }
    }
}
