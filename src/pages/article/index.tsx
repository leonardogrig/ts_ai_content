import React, { useEffect, useState } from "react";
import axios from "axios";
import * as articleS from "./styles";
import Image from "next/image";
import loadingImage from "./../utils/loader.gif";
import { BiLoaderAlt } from "react-icons/bi";
import youtubeThumbnail from "youtube-thumbnail";

console.log(loadingImage);

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
  var thumbnail = await youtubeThumbnail(url);
  console.log("thumbnail", thumbnail["high"]["url"]);
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
    console.log(response);
  }, [response]);

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    setLoading(true);
    event.preventDefault();

    setResponse("");

    setVideoThumb(await getYoutubeThumbnail(message));

    const videoId = getYoutubeVideoId(message);

    console.log(videoId);

    if (!videoId) {
      setResponse("Invalid URL.");
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
      <articleS.Container>
        <articleS.TextArea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        {loading ? (
          <BiLoaderAlt className="spinner" color="#FFF" size={50} />
        ) : (
          <articleS.Button onClick={handleSubmit}>Enviar</articleS.Button>
        )}
        <Image
          src={videoThumb}
          alt="Picture of the author"
          width={280}
          height={180}

          style={{ display: videoThumb ? "block" : "none", marginTop: 20 }}
        />
        <articleS.Content
          dangerouslySetInnerHTML={{ __html: response }}
        ></articleS.Content>
        <articleS.StringLength>
          String length: {stringLength}
        </articleS.StringLength>
      </articleS.Container>
    </>
  );
};

export default App;
