## Issues

#### 23.12.2025

- Set up initial client and server logic ✅
- Set up socket for both client and server ✅

#### 24.12.2025

- Add input manager ✅

#### 26.12.2025

- Add entity class ✅
- Add player class ✅
- Add components and state machine ✅

#### 27.12.2025

- Add animation component ✅
- Draw players to the scene ✅

#### 28.12.2025

- Prepare player spritesheet layout ✅

#### 29.12.2025

- Add player update cycle ✅
- Set up physics manager ✅
- Set up movement handler ✅

#### 30.12.2025

- Add sprite mirroring ✅
- Adjust player creation cycle ✅
- Add states running, casting and jumping ✅

#### 31.12.2025

- Add hitbox and projectile ✅
- Set up player hosts ✅
- Add entity manager and entity store ✅
- Add pointable component ✅
- Draw an entity to the scene ✅
- Set up behavior component and entity updates ✅
- Add body component ✅
- Set up entity factory ✅

#### 1.1.2026

- Try Tiled editor ✅

#### 2.1.2026

- Add entity definitions ✅
- Add texture component ✅

#### 3.1.2026

- Add map loader ✅

#### 4.1.2026

- Add map factory ✅

#### 5.1.2026

- Add casting at coordinates ✅

#### 6.1.2026

- Download spritesheets ✅

#### 7.1.2026

- Implement pre loader ✅
- Introduce camera ✅

#### 8.1.2026

- Build first village section in Tiled editor ✅

#### 9.1.2026

- Add inventory ✅
- Add pickable component ✅
- Add hoverable component ✅

#### 10.1.2026

- Add outline pipeline ✅
- Add tile animations ✅
- Emit pick up events ✅

#### Next up

- Add spell configs
- Emit damage events
- Add ui inventory, toolbar and healthbar
- Switch host on disconnect
- Build player house in Tiled editor
- Add map transitions
- Throttle network updates / change detection
- Improve interpolation

## Devlog

#### How To Make A Game

In my teenage years I spent hundreds of hours playing video games such as Skyrim and Minecraft, exploring their vast worlds and lore. During COVID-19 Valheim came out and combined the best of these two games into one, even allowing my wife and myself to play together in co-op, happily building our viking village and occasionally wander out into the wilderness for a taste of adventure.

Ever since cozy games have been on quite the rise, or might have been even before that with games like Stardew Valley. But Valheim wasn't just cozy. Only thinking of landing on the shores of the Ashlands for the first time gives me chills to this day. Valheim did both, cozy and adventure.

I kept thinking about other games able to combine these two styles like Valheim did, and not many came to my mind. Being able to chill for a couple of hours, building a house or taming some animals yet the next day fighting a troll in the black forest. At one point I figured I could try to build a game like that.

I got into programming video games by watching Drew Conley on YouTube. The first ever video specifically was about 2D sprite animations and movement using but only CSS. It was done by transforming an absolute positioned `div` inside its relative parent. The animation was done using `background-position` and `background-size`. Doing something like this with CSS only amazed me (as a CSS fanatic), but I quickly learned doing 2D games without a canvas has a quite low ceiling.

While I followed the next few tutorials I soon discovered LPC sprites. Originally created for the Liberated Pixel Cup in 2012 they are maintained and extended to this day. Their diversity is incredible, it really is an indie dream come true. The first thing I built was a character editor, making use of the hundreds of options for bodies, heads, clothing and armour.

#### What Is The Game About

I instantly knew I wanted the game to be more story-driven than say Valheim or Minecraft. Total freedom is super fun, but a compelling story can draw you in just as much, if not more. I loved the adventure side of Skyrim and Oblivion a lot, but I also adored the depth of the universe itself. There are so many stories hidden in The Elder Scrolls, and you can find and read about them in the game.

On the other hand (obviously) I became a huge Lord of the Rings fan growing up. I was always fascinated by the massive world Tolkien created during his lifetime, with a never ending potential for storytelling.

Inspired by that I dreamt of creating my own fantasy world which I did then start around the age of 13. I collected ideas for over ten years with the hope of one day turning it into a fantasy novel (which I did not). During my years at university I then stumbled across the following quote:

```
There are these peculiar faculties of the psyche, that it isn’t entirely confined to space and time. You can have dreams or visions of the future, you can see around corners ... Now these facts show that the psyche, in part at least, is not dependent upon these confinements. And then what? When the psyche is not under the obligation to live in time and space alone, and obviously it doesn’t, then to that extent, the psyche is not subjected to those laws ...

C.G. Jung
````
Assume for a moment Jung was not out of his mind (ha!) at the time, this means our psyche might be able to look into the future when we're dreaming.

Say someone did possess this ability, would it be of great use? Would others care for it? Would they want this ability to be their own? Would they want to abuse it? I've found that if the answer to any of these questions is an instant yes, you might be on to something interesting. I went with it and nudged my world in that direction. The protagonists would attempt to learn to "see into the future" using their dreams and – with the right training – even "meet at places" they were going to be in a few days or weeks. Therefore being able to know future outcomes or how to communicate over far distances (a quite valuable skill in a medieval fantasy setting).

Obviously it needed more work. For me or in terms of the game I was going to create it certainly clicked anyway. An almost complete main quest I had been working on for years pretty much, a pool of characters and villains to draw from, each with a background story, names and lore for cities, landscapes and creatures: I might not even need this much detail in the beginning and could in time create more.

#### What Is The Core Loop

Besides knowing I wanted to build it story-driven, what was clear to me right away was that the game needed multiplayer. I had never done anything like that before so I was naturally scared of it. But I knew Valheim or Minecraft would have never been the same for me without sharing the experience with other people. And oh boy, what would I have given for a good Elder Scrolls co-op (And yes, I tried Skyrim Together).

So preferably people would play together. But what would they actually do? There was this scaffold of a story and a fantasy world, but what would players do in this world over and over? Why would they come back to it day after day?

Technically it could be a quest based game where you follow a main quest and do side quests along the way, in a vast open world full of cities, npcs, creatures, forests, mountains, rivers and villages. The whole world would be "editable" in a Minecraft or Valheim sense, combined with farming and taming animals for a cozy experience. But building such a world simply is out of scope. If I wanted this project to go anywhere it needed a core loop I could actually implement.

So instead of cities and forests and mountains and villages I landed on: One village. A village to harness and to take care of. I really got inspired by Anno at this point, figuring that the village starts rather small and the more you progress the more buildings you'd unlock and the more villager needs had to be met. Your decisions might even affect those needs: Like on leveling up you're presented with choices. A helper for the smith or a helper for the bakery. Produce iron faster or food, both of which you need to keep the village satisfied. It would of course benefit you to be smart about these decisions. I kind of got carried away there for a while, but I really liked the idea and actually it was perfect for starting small, then making it bigger later on.

The first thing in this village that needs your attention is be the farm of an older couple. They can't handle the workload anymore, so you have to step in.

#### What Is The Role Of AI

I quickly realized I wanted to do the heavy lifting – or most of it for that matter – myself, and not let AI build a game for me. For the most part because this should be a learning experience. Also though I feel like to make the game in any shape or way maintainable, I should understand the code to its full extent. To this day I'm using AI mostly for researching and looking at snippets of what I'm going to build next. I've found that sometimes, just to look at a feature in fast fashion, letting ai build it is really helpful. Afterwards either discard it or rebuild it from scratch. I saved hours of implementing stuff only to realize I didn't want it in the first place by using AI.

For the sake of entertainment I am going to collect some fun interactions with my agent of choice, Claude Sonnet 4.5. This is a rather colorful collection for that matter.

```
Claude on January 10th
"Until then, YAGNI! Keep it simple"