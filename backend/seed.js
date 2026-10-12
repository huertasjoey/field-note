// Inserts sample articles. Safe to run repeatedly: articles are matched by slug,
// existing ones are left untouched (so your edits are never overwritten).
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Article = require("./models/Article");
const { slugify, estimateReadTime } = require("./utils/helpers");

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const samples = [
  {
    title: "The Quiet Art of Slow Mornings",
    category: "Lifestyle",
    author: "Maya Okafor",
    image: img("photo-1495474472287-4d71bcdd2085"),
    featured: true,
    daysAgo: 2,
    excerpt:
      "What happens when you stop reaching for your phone first thing and give the first hour of the day back to yourself.",
    content: `For most of a decade, my mornings began with a glowing rectangle. Before my feet touched the floor I had already read the news, answered three emails and absorbed other people's opinions about things that had nothing to do with me.

Last spring I changed one small thing: the phone stays in another room until I have finished a cup of coffee. That is the whole rule.

The first week felt strange, almost rude, as if I were ignoring someone who needed me. By the second week I noticed the light moving across the kitchen wall. By the third I had started writing a few lines in a paper notebook, mostly nonsense, occasionally something true.

A slow morning does not require candles, journaling prompts or a six a.m. alarm. It requires a boundary and a little boredom. Boredom is where attention goes to recover.

Some practical things that helped:

Keep the ritual small. Boil water. Open a window. Sit down while the coffee is hot rather than carrying it around the house.

Let the first thought of the day be your own. Whatever comes up, a worry, a plan, a half-remembered dream, is more useful than a headline.

Be forgiving. Some mornings there is a deadline or a child who needs breakfast. The goal is not perfection, it is a default you can return to.

I still check the news. It is simply no longer the first thing I let into my head, and the day that follows feels like it belongs to me a little more.`,
  },
  {
    title: "Lisbon by Tram: A Slow Guide to the Hills",
    category: "Places",
    author: "Tomás Ribeiro",
    image: img("photo-1513735492246-483525079686"),
    daysAgo: 5,
    excerpt:
      "Skip the checklist. Ride the 28 early, get off where the street looks interesting, and let the city's seven hills set your pace.",
    content: `Lisbon is a city that punishes hurry. The hills are steep, the cobblestones are polished smooth by centuries of feet, and the best views are always one more staircase away.

Start early. The yellow Tram 28 fills up by nine, but at seven-thirty you will share it with bakers and schoolchildren, and the light over the Tagus is pale gold.

Get off in Graça. The miradouro here is less famous than its neighbours, which means you can sit on a low wall with a coffee and watch terracotta roofs tumble toward the river without anyone's selfie stick in your frame.

Eat where the menu is short. A handwritten board with four dishes, grilled sardines, a bean stew, a plain salad, is a better sign than any review.

Walk down, not up. Take trams and funiculars up the hills and let gravity do the work on the way back. You will see side streets you would never find otherwise: laundry strung between balconies, tiled facades in blue and green, a cat asleep on a warm doorstep.

Leave an afternoon empty. Lisbon rewards wandering more than planning, and the best moments of any trip are rarely on the itinerary.`,
  },
  {
    title: "Why We Still Read Paper Books",
    category: "Culture",
    author: "Elena Marchetti",
    image: img("photo-1481627834876-b7833e8f5570"),
    daysAgo: 9,
    excerpt:
      "Sales of print books keep holding steady in the age of screens. The reasons have more to do with memory and mood than nostalgia.",
    content: `Every few years someone announces the death of the printed book, and every few years the printed book politely declines to die.

Part of the answer is physical. A book has a shape: you know roughly how far through it you are by the weight in your left hand versus your right. Researchers who study reading comprehension have found that this sense of place helps readers remember where in a story something happened, which in turn helps them remember what happened.

Part of it is attention. A paper book cannot send you a notification. It does not offer to check the weather or show you what a friend had for lunch. Its single trick is to hold still while you think.

And part of it is plain affection. Bookshelves are autobiographies. The cracked spine of a favourite novel, the pencilled note in a margin, the train ticket used as a bookmark, these are little archives of who we were when we read them.

None of this makes e-readers the enemy. They are wonderful for travel, for dark bedrooms, for reading at a size your eyes can manage. But the quiet persistence of paper suggests that technology does not always replace what came before. Sometimes it simply sits beside it.`,
  },
  {
    title: "Small Ideas for a Smaller Footprint",
    category: "Ideas",
    author: "Jonas Lindqvist",
    image: img("photo-1470071459604-3b5ec3a7fe05"),
    daysAgo: 14,
    excerpt:
      "You do not need a grand lifestyle overhaul to make a difference. A handful of modest habits can add up over a year.",
    content: `The conversation about sustainability often swings between two poles: do nothing because individual action is meaningless, or do everything and burn out by March. The sensible middle is boring and effective.

Start with what you already do every day. Food, transport and heating are the big three for most households, and small shifts in each matter more than any single dramatic gesture.

Eat one more plant-based meal a week than you did last month. Walk or cycle the trips under two kilometres. Turn the thermostat down by one degree and put on a jumper.

Repair before you replace. A pair of boots resoled, a laptop with a new battery, a coat with a fresh zip: each one is a purchase that did not happen.

Buy less, and buy better. A well-made item you use for ten years has a far smaller footprint than five cheap versions that end up in a drawer.

Finally, talk about it. Habits spread socially. When a neighbour mentions their balcony compost or a colleague cycles in through the rain, it quietly changes what feels normal.

None of this will fix everything. But a million small, steady changes are how most large cultural shifts have ever actually happened.`,
  },
  {
    title: "Inside the Last Vinyl Pressing Plant in Town",
    category: "Culture",
    author: "Priya Raman",
    image: img("photo-1539375665275-f9de415ef9ac"),
    daysAgo: 20,
    excerpt:
      "Behind an unmarked door, a crew of six still presses records the way it was done in 1975, and the orders keep coming.",
    content: `The smell hits first: warm vinyl and machine oil. Then the rhythm, a heavy hiss and thump as a press closes on a puck of hot PVC and squeezes it into a record in about thirty seconds.

The plant has six people and four presses, two of them older than anyone who works here. Spare parts are made by hand when they cannot be found. "If it breaks, we fix it," says the foreman. "Nobody makes these any more."

Orders come from local bands, reissue labels and the occasional pop star who wants a limited run for superfans. Waiting times stretch for months. Demand for vinyl has outpaced the world's capacity to produce it, and the handful of surviving plants are running flat out.

Quality control is done by ear and eye. Each batch, someone lifts a record from the stack, drops the needle and listens for pops, then tilts it under the light to check for ripples in the grooves.

Why bother, in an age where every song ever recorded is a tap away? Ask the people carrying boxes out the door and the answer is surprisingly consistent. It is the ritual. You choose a record, you lower the needle, and for twenty minutes you do nothing else.`,
  },
  {
    title: "A Weekend in the Scottish Highlands",
    category: "Places",
    author: "Callum Reid",
    image: img("photo-1506905925346-21bda4d32df4"),
    daysAgo: 27,
    excerpt:
      "Two days, one rented car and a very good raincoat: how to see the best of Glencoe without the crowds.",
    content: `The first rule of the Highlands is that the weather has opinions. The second is that it does not matter, because mist on the mountains is half the beauty.

Fly into Glasgow and drive north on the A82. Within an hour the suburbs fall away, Loch Lomond appears on your left, and the landscape slowly empties of people. Stop in Tyndrum for a pie. You will thank me later.

Glencoe itself is best seen at the edges of the day. At dawn the peaks glow pink and the car parks are empty. At dusk, deer wander down to the road. At midday, tour buses queue. Plan accordingly.

For a gentle walk, try the Lochan Trail near Glencoe village, a short loop through birch woods with views up the glen. If you have the legs for it, the Pap of Glencoe rewards you with a summit view of Loch Leven for about two hours of effort.

Sleep in a small guesthouse rather than a chain hotel. Breakfast will involve porridge, kippers or both, and your host will almost certainly have advice about tomorrow's weather that is better than any app.

Pack layers, bring waterproof boots and leave room in your schedule. The Highlands are not a place to rush.`,
  },
  {
    title: "The Case for the Handwritten Letter",
    category: "Stories",
    author: "Maya Okafor",
    image: img("photo-1455390582262-044cdead277a"),
    daysAgo: 33,
    excerpt:
      "In a world of instant replies, a letter that takes a week to arrive might be the most generous message you can send.",
    content: `I found a bundle of letters in my grandmother's sideboard last winter, tied with kitchen string. They were from her sister, who had moved overseas in 1962. Forty years of weather reports, recipes, gossip and quiet heartbreak.

Reading them, I realised I could not remember the last thing anyone had written me that was longer than a paragraph, let alone anything I had kept.

So I started writing letters. Not often, perhaps one a month. The first took an hour, because I had forgotten how slow handwriting is. That slowness turned out to be the point. You cannot dash off a letter. You have to decide what matters before the ink dries.

The replies surprised me. A friend wrote back three pages. My brother sent a postcard with a terrible drawing of a dog. A former teacher, now in her eighties, mailed me a pressed flower.

A letter says something an email cannot: I sat down for you, and I was thinking only of you for the length of this page. In a noisy world, that kind of attention is rare, and people can feel it.

Buy a pad of paper, find a stamp, and write to someone today. It will take twenty minutes, and it might be kept for forty years.`,
  },
];

async function seed() {
  await connectDB();
  let created = 0;
  let skipped = 0;
  for (const { daysAgo, ...data } of samples) {
    const slug = slugify(data.title);
    if (await Article.exists({ slug })) {
      skipped++;
      continue;
    }
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    await Article.create({ ...data, slug, readTime: estimateReadTime(data.content), createdAt });
    created++;
  }
  // Keep exactly one featured article
  const featured = await Article.find({ featured: true }).sort({ createdAt: -1 });
  if (featured.length > 1) {
    await Article.updateMany({ _id: { $in: featured.slice(1).map((a) => a._id) } }, { featured: false });
  }
  console.log(`Seed complete: ${created} created, ${skipped} already existed.`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
