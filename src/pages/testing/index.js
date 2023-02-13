import React, { useEffect, useState } from "react";
import axios from "axios";

function getYoutubeVideoId(url) {
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

    const handleSubmit = async (event) => {
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
            setResponse("An error occurred.");
        }

        setLoading(false);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                />
                {loading ? (
                    <button disabled>Carregando...</button>
                ) : (
                    <button>Enviar</button>
                )}
            </form>
            <p >String length: {stringLength}</p>
            <div className="content" dangerouslySetInnerHTML={{__html: response}}></div>
            <p>test string <br/> test</p>
        </div>
    );
};

export default App;
