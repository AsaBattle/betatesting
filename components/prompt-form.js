import { useState, useEffect } from "react";

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
  "A bustling medieval marketplace, filled with colorful tents and merchants selling exotic spices and silks, under a bright blue sky",
  "A serene Japanese garden in spring, with cherry blossoms in full bloom, a tranquil pond, and a small wooden bridge",
  "An abandoned Victorian mansion at midnight, lit only by the full moon, with ivy climbing its ancient walls",
  "A futuristic cityscape at dusk, with flying cars zooming between neon-lit skyscrapers and holographic billboards",
  "A deep underwater scene with a sunken pirate ship, colorful coral reefs, and schools of tropical fish swimming amidst hidden treasures",
  "A mystical forest shrouded in mist, with ancient trees, glowing fireflies, and a hidden path leading to an enchanted glade",
  "A lively Renaissance fair, with jesters, knights in armor, and artisans displaying their crafts, set against a backdrop of medieval tents and banners",
  "A desolate Martian landscape, with a lone astronaut exploring red rock formations and distant planet Earth visible in the sky",
  "An ancient Egyptian marketplace, bustling with people, camels, and stalls selling papyrus, spices, and handcrafted jewelry, beside the towering pyramids",
  "A snow-covered village in the Alps at twilight, with cozy cottages, a frozen lake, and mountains in the background",
  "A sun-drenched Tuscan vineyard, with rows of grapevines, a rustic stone farmhouse, and rolling hills in the distance",
  "A vibrant carnival in Rio de Janeiro, with dancers in colorful costumes, lively music, and extravagant floats under a starry sky",
  "An eerie swamp at night, with a full moon, twisted trees, fog hovering over the water, and the distant sound of a mysterious creature",
  "A grand medieval banquet hall, with a feast laid out on long tables, nobles in fine attire, and minstrels playing in the background",
  "A tranquil beach at sunrise, with soft pink and orange hues in the sky, gentle waves, and a lone palm tree",
  "An enchanted library with towering bookshelves, magical books that float and whisper, and a glowing orb casting an ethereal light",
  "A bustling New York street in the 1920s, with vintage cars, flappers, jazz musicians, and neon signs illuminating the night",
  "A high mountain peak at dawn, with a climber standing at the summit, overlooking a sea of clouds and the rising sun",
  "A wild west town in the heat of the day, with dusty streets, saloons, horse-drawn wagons, and cowboys in the distance",
  "A moonlit garden with exotic flowers that glow in the dark, a sparkling fountain, and a hidden bench beneath a weeping willow",
  "An opulent ballroom in the Victorian era, with elegant dancers, grand chandeliers, and a live orchestra playing a waltz",
  "A vast savanna at sunset, with silhouettes of elephants, acacia trees, and a dramatic orange and purple sky",
  "A mysterious stone circle under the northern lights, with ancient runes, a clear starry night, and a sense of magic in the air",
  "A bustling space station orbiting a distant planet, with astronauts, alien visitors, and a view of the galaxy through large windows",
  "A charming French café in the morning, with fresh pastries, a cobblestone street, and a view of the Eiffel Tower in the distance"
];
import sample from "lodash/sample";
import { Eraser, Dice5, DivideSquare } from "lucide-react";

export default function PromptForm(props) {
  const [prompt, setPrompt] = useState(sample(samplePrompts));
  const [image, setImage] = useState(null);

  // Handler for the clear button
  const handleClear = () => {
    setPrompt('');  // Set the prompt state to an empty string
  };

  // Handler to update prompt state when input changes
  const handleInputChange = (event) => {
    setPrompt(event.target.value);
  };

  // Function to set a random prompt
  const setRandomPrompt = () => {
    setPrompt(sample(samplePrompts));
  };

  // Set an initial random prompt when the component mounts
  useEffect(() => {
    setRandomPrompt();
  }, []);

  return (
    <form
      onSubmit={props.onSubmit}
      className="py-5 animate-in fade-in duration-700"
    >
      <div className="flex max-w-[512px]">
        <div className="flex flex-col w-12"> {/* Adjust width as needed for the buttons */}
          {/* Eraser button */}
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-200 text-gray-700 rounded-t-md p-2 h-1/2 border-b border-black" // Tailwind class for half height
          >
            <Eraser size={16} />
          </button>
          {/* Random prompt button */}
          <button
            type="button"
            onClick={setRandomPrompt}
            className="bg-gray-200 text-gray-700 rounded-b-md p-2 h-1/2" // Tailwind class for half height
          >
            <Dice5 size={16} /> {/* Dice icon */}
          </button>
        </div>
        {/* Input field */}
        <input
          type="text"
          value={prompt}  // Bind the input value to the prompt state
          onChange={handleInputChange}  // Update state when input changes
          name="prompt"
          placeholder="Enter a prompt..."
          className="block w-full flex-grow rounded-l-md"
        />

        {/* Generate button */}
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
