import { useState } from "react";

const samplePrompts = [
  "a whimsical cat astronaut exploring Mars",
  "a peaceful garden in the style of Monet",
  "futuristic city skyline at dusk, in neon colors",
  "portrait of an elegant fox in Renaissance attire",
  "underwater scene with mermaids and colorful coral reefs",
  "steampunk-inspired mechanical dragon",
  "digital art of a mystical forest with glowing trees",
  "oil painting of a cozy cabin in the mountains during winter",
  "a fantasy landscape with floating islands and waterfalls",
  "portrait of an alien queen in Art Deco style",
  "surreal painting of a clock melting over a tree",
  "cyberpunk street scene with neon lights and futuristic cars",
  "an old library with magical books and glowing orbs",
  "a serene beach scene at sunset in pastel colors",
  "abandoned spaceship in a sci-fi desert landscape",
  "medieval castle surrounded by a mystical forest",
  "a robot barista serving coffee in a futuristic café",
  "vibrant coral reef with diverse marine life, in watercolor",
  "steampunk cityscape with airships and gear-driven machines",
  "a tranquil Japanese zen garden in spring",
  "northern lights over a snowy mountain landscape",
  "an enchanted forest with fairies and magical creatures",
  "wild west town with cowboys and saloons in sepia tones",
  "a vintage car rally on the streets of 1920s Paris",
  "a surreal collage of various famous landmarks",
  "underwater city with bio-luminescent buildings",
  "post-apocalyptic landscape with nature reclaiming a city",
  "a bustling market street in ancient Rome",
  "retro-futuristic city with hovercars and art deco buildings",
  "a jazz band performing in a smoky 1930s nightclub",
  "a Gothic cathedral with intricate stained glass windows",
  "a fantasy map of an uncharted island with treasure",
  "a detailed illustration of an intricate steampunk watch",
  "a serene Buddhist temple in the Himalayan mountains",
  "an Egyptian tomb with hieroglyphs and treasures",
  "victorian-era train station bustling with travelers",
  "a magical greenhouse with exotic, sentient plants",
  "a cybernetic jungle with robotic wildlife",
];
import sample from "lodash/sample";

export default function PromptForm(props) {
  const [prompt] = useState(sample(samplePrompts));
  const [image, setImage] = useState(null);

  return (
    <form
      onSubmit={props.onSubmit}
      className="py-5 animate-in fade-in duration-700"
    >
      <div className="flex max-w-[512px]">
        <input
          type="text"
          defaultValue={prompt}
          name="prompt"
          placeholder="Enter a prompt..."
          className="block w-full flex-grow rounded-l-md"
        />

        <button
          className="bg-black text-white rounded-r-md text-small inline-block px-3 flex-none"
          type="submit"
        >
          Generate
        </button>
      </div>
    </form>
  );
}
