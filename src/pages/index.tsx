import { createClient } from "pexels";
import { useState } from "react";
import Image from "next/image";
import { PhotosWithTotalResults } from "pexels/dist/types";

const Home = () => {
  const [thumbnailOption, setThumbnailOption] = useState<PhotosWithTotalResults | null>(null);

  if (!thumbnailOption) {
    (async () => {
      const client = createClient(
        "ViOAsHWTQYluCWAeG3LeCsW1JQPTRaePjKQAwRNVv6e7AXv22M0cSWTb"
      );

      const photos = await client.photos.search({
        query: "nature",
        per_page: 3,
      });

      if ("error" in photos) {
        return;
      }

      setThumbnailOption(photos);
    })();
  }

  return (
    <>
      {thumbnailOption ? (
        <>
          <Image
            src={thumbnailOption?.photos[0]?.src?.medium}
            alt="Picture of the author"
            width={525}
            height={350}
          />
          <Image
            src={thumbnailOption?.photos[1]?.src?.medium}
            alt="Picture of the author"
            width={525}
            height={350}
          />
          <Image
            src={thumbnailOption?.photos[2]?.src?.medium}
            alt="Picture of the author"
            width={525}
            height={350}
          />
        </>
      ) : null}
    </>
  );
};

export default Home;
