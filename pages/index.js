import Head from "next/head";
import Link from "next/link";

export default function About() {
  return (
    <div className="max-w-[512px] mx-auto p-10 bg-white rounded-lg">
      <Head>
        <title>FullJourney.AI Inpainting</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {/* <h1 className="text-center text-7xl pb-3">🎨</h1> */}
      <p className="pb-5 text-lg">
        <strong>FullJourney.AI Inpainting</strong>
      </p>

      <Link href="/ImageMode">
        <video autoPlay loop muted playsInline className="w-full cursor-pointer">
          <source src="/cherries-oranges-bananas.mp4" />
        </video>
      </Link>

      <Link href="/ImageMode">
        <a className="py-3 block text-center bg-black text-white rounded-md mt-10">
          Start painting
        </a>
      </Link>
    </div>
  );
}
