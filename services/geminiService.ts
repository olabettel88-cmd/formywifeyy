
/**
 * Purely static hydration tips library.
 * Removes all Gemini API calls to fix 429 quota errors and satisfy the request to remove AI dependency.
 */

const TIPS = [
  "You're doing amazing, starshine! Keep sipping! ✨",
  "Your skin is going to be so glowy today! 🌸",
  "Hydroy thinks you're the best for drinking water! 💧",
  "One sip at a time, you're becoming a hydration queen! 👑",
  "Don't forget to blink and take a sip! Pinky promise? 🌷",
  "Every drop is a hug for your cells! 💖",
  "Stay hydrated, stay cute, stay you! 🎀",
  "Nature called, it said you need a refill! 🍃",
  "Sparkle from the inside out with more water! ✨",
  "You're basically a plant with more complicated emotions. Water yourself! 🌿",
  "A sip a day keeps the thirsties away! 🍭",
  "Drink water like it's your job (the cute kind of job)! 💼💕",
  "Hydroy is cheering for you! Go go go! 📣",
  "Water is your secret weapon for a magic day! 🪄",
  "Stay juicy, sunshine! 🍊",
  "Your brain loves water almost as much as I love you! 🧠💕",
  "Sip sip hooray! You're crushing it! 🥂",
  "Refresh your soul with a little splash! 🌊",
  "The water bottle misses you when you're gone! 🥺",
  "Hydration is the best accessory! 💎"
];

const MORNING_TIPS = [
  "Wakey wakey! Start your day with a big splash! ☀️",
  "Morning dew for a morning star! Drink up! 🌅",
  "Good morning! Your body is thirsty for a new day! ☕💧"
];

const EVENING_TIPS = [
  "Wind down with some cozy hydration! 🌙",
  "Sweet dreams start with a hydrated body! ☁️",
  "Evening sips for a peaceful sleep! ✨"
];

export const getHydrationTip = async (currentAmount: number, goal: number): Promise<string> => {
  // Small artificial delay for a natural feel
  await new Promise(resolve => setTimeout(resolve, 300));

  const hour = new Date().getHours();
  let pool = TIPS;

  if (hour < 11) pool = [...TIPS, ...MORNING_TIPS];
  else if (hour > 19) pool = [...TIPS, ...EVENING_TIPS];

  if (currentAmount >= goal) return "Goal reached! You're a hydration LEGEND! 🏆✨";
  if (currentAmount > goal * 0.8) return "Almost there! You're radiating health! 🌟";
  if (currentAmount === 0) return "Let's start the flow! First sip is the best! 💧✨";

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};
