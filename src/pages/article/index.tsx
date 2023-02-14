import React, { useEffect, useState } from "react";
import axios from "axios";
import * as S from "./styles";
import Image from "next/image";
import loadingImage from "./../utils/loader.gif";
import { BiLoaderAlt } from "react-icons/bi";
import youtubeThumbnail from "youtube-thumbnail";


function getYoutubeVideoId(url: string) {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }
  return null;
}

async function getYoutubeThumbnail(url: string) {
  if (url === "") {
    return null;
  }
  var thumbnail = await youtubeThumbnail(url);
  return thumbnail["high"]["url"];
}

const App = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [stringLength, setStringLength] = useState(0);

  const [videoThumb, setVideoThumb] = useState("");

  useEffect(() => {
    setStringLength(response.length);
  }, [response]);

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    setLoading(true);
    event.preventDefault();

    setResponse("");

    const videoId = getYoutubeVideoId(message);
    setVideoThumb(await getYoutubeThumbnail(message));

    if (!videoId) {
      setResponse("Link Invalido.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post("/api/openai", {
        chat: videoId,
      });

      setResponse(data);
    } catch (error) {
      setResponse("An error occurred." + error);
    }

    setLoading(false);
  };

  return (
    <>
      <S.TopNavbar><S.Logo>Kepler.ai</S.Logo><S.LoginButton>Login</S.LoginButton></S.TopNavbar>

      <S.NavbarLine />
      <S.MainContainer >
        <h2 style={{ display: 'contents' }}>Adicione um vídeo</h2>

        <S.InputContainer>
          <h4 style={{ display: 'contents' }}>Cole aqui o link do vídeo do Youtube que deseja</h4>
          <S.LinkInput
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=-ANx41sZNIQ"
          />

        </S.InputContainer>
      </S.MainContainer>
      <S.Container>

        {loading ? (
          <BiLoaderAlt className="spinner" color="#FFF" size={50} />
        ) : (
          <S.Button onClick={handleSubmit}>Faça meu artigo!</S.Button>
        )}

        {videoThumb ? (
          <Image
            src={videoThumb}
            alt="Picture of the author"
            width={280}
            height={180}
            style={{marginTop: '20px', border: '1px solid #000'}}
          />
        ) : (<></>
        )}
        {response ? (
          <>
            <S.Content
              dangerouslySetInnerHTML={{ __html: response }}
            ></S.Content>
            <S.StringLength>
              Quantidade de Caracteres: {stringLength}
            </S.StringLength>
          </>
        ) : (<></>)}

        <S.Disclaimer>Aviso importante: Este aplicativo utiliza tecnologia de inteligência artificial para gerar conteúdo de forma automatizada. No entanto, é importante ressaltar que as afirmações contidas nos textos gerados podem não ser precisas e devem sempre ser verificadas pelo usuário. O aplicativo não se responsabiliza por quaisquer danos ou prejuízos causados pelo uso de informações incorretas. O usuário assume total responsabilidade pelo conteúdo gerado através deste aplicativo.</S.Disclaimer>
      </S.Container>
    </>
  );
};

export default App;
