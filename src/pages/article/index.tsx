import React, { useEffect, useState } from "react";
import axios from "axios";
import * as articleS from "./styles";
import Head from "next/head";

function getYoutubeVideoId(url: string) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return match[2];
    }
    return null;
}


const App = () => {

    const [message, setMessage] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [stringLength, setStringLength] = useState(0);

    useEffect(() => {
        setStringLength(response.length);
        console.log(response);
    }, [response]);

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        setLoading(true);
        event.preventDefault();

        const videoId = getYoutubeVideoId(message);

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
                <articleS.Button disabled>Carregando...</articleS.Button>
            ) : (
                <articleS.Button onClick={handleSubmit}>Enviar</articleS.Button>
            )}

            <articleS.Content dangerouslySetInnerHTML={{ __html: response }}></articleS.Content>
            <articleS.StringLength>String length: {stringLength}</articleS.StringLength>
        </articleS.Container>
        </>
    );
};

export default App;
