# Othrhalff - Proposed Chat Features (Gen Z & Privacy Focused)

This file contains premium feature concepts for Othrhalff's chat interface. You can instruct future AI coding agents to read this file (`new_features.md`) when you are ready to begin implementing any of these features.

---

## 1. Icebreakers & Mini-Games (Conversation Starters)
* **Goal**: Break the ice in "Ghost Chemistry First" matches before user identities/photos are revealed.
* **Concepts**:
  * **2 Truths and a Lie**: A small interactive widget where both users submit 2 truths and 1 lie, and the partner has to guess which one is the lie.
  * **Campus Trivia**: Localized university questions (e.g. comparing dining halls or library study spots) to find common ground.
  * **Would You Rather?**: Rapid-fire lighthearted questions (e.g. *"Would you rather take a 9:00 AM class on Saturday or study in the library basement for 24 hours straight?"*).

---

## 2. Blur & Reveal (Self-Destructing Media)
* **Goal**: Share photos securely and playfully while keeping the mystery alive.
* **Concepts**:
  * **Encrypted/Pixelated Send**: Images sent through chat are rendered as fully pixelated/blurred CSS blocks.
  * **Timed Reveal**: The recipient taps the blurred image to reveal it clearly for a 5-second countdown.
  * **Self-Destruction**: Once the 5-second timer expires, the image is automatically deleted from Supabase storage and the database, and the message block becomes unviewable (complementing the screenshot block).

---

## 3. Voice Notes with Visual Waveforms
* **Goal**: Share voice messages dynamically, a highly popular medium for Gen Z.
* **Concepts**:
  * **Mic Recording Button**: Press-and-hold to record audio using the browser's MediaRecorder API.
  * **Audio Upload**: Uploads the `.webm`/`.mp3` snippet to a private Supabase Storage bucket.
  * **Animated Waveform**: Renders inline inside the chat bubble with a visual play/pause waveform that animates while playing.

---

## 4. Virtual Date Co-Activities (Cinema & Music Date)
* **Goal**: Initiate shared activities directly from the chat screen.
* **Concepts**:
  * **Cinema Date Invite**: Launches a synchronized YouTube player inside a split-pane chat interface, allowing both matches to watch campus vlogs, shows, or videos in sync.
  * **Music Share Date**: Integration of a shared Spotify/audio playlist sync, letting matches stream music together in real-time.
  * **Trivia / Canvas Paint**: A lightweight multiplayer painting canvas or trivia board.

---

## 5. Premium Chat Themes (Crown Tier)
* **Goal**: Custom chat bubbles and backgrounds to drive premium subscriptions.
* **Concepts**:
  * **Themed Backgrounds**: Glassmorphic gradients (e.g. *Synthwave Night (Neon Pink/Dark Blue)*, *Aurora Emerald*, *Retro Sunset*, *Cyberpunk Grid*).
  * **Custom Bubbles**: Glowing neon outlines for bubbles, custom bubble colors, and custom emoji reactions.
  * **Monetization**: Only users with the premium "Crown" status (`is_premium: true`) can change or unlock custom chat backgrounds.
