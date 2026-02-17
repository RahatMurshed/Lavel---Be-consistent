export const AUTH_QUOTES = [
  { text: "Consistency is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "It's not what we do once in a while that shapes our lives, but what we do consistently.", author: "Tony Robbins" },
  { text: "Motivation gets you going. Habit keeps you growing.", author: "John Maxwell" },
  { text: "The only way to do great work is to love what you do — and show up daily.", author: "Steve Jobs" },
  { text: "Progress is impossible without change, and those who cannot change their minds cannot change anything.", author: "George Bernard Shaw" },
  { text: "A river cuts through rock not because of its power, but because of its persistence.", author: "Jim Watkins" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Your habits will determine your future.", author: "Jack Canfield" },
  { text: "The chains of habit are too weak to be felt until they are too strong to be broken.", author: "Samuel Johnson" },
  { text: "Identity change is the North Star of habit change.", author: "James Clear" },
];

export const ONBOARDING_QUOTES = [
  { text: "Every expert was once a beginner. Today, you begin.", author: "Helen Hayes" },
  { text: "Your identity is not a fixed thing — it's a choice you make every day.", author: "James Clear" },
  { text: "Goals are about the results you want to achieve. Systems are about the processes that lead to those results.", author: "James Clear" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
];

export const ACTION_TOASTS = {
  full: [
    "Full send! You're becoming who you said you'd be. 🔥",
    "That's the compound effect in action. Keep stacking wins.",
    "Your future self is silently thanking you right now.",
    "Consistency unlocked. This is how champions are built.",
    "Another brick laid in the foundation of your identity. 💪",
    "You showed up at 100%. That's rare — own it.",
  ],
  min: [
    "Showing up matters more than intensity. Well done.",
    "Minimum version, maximum respect. Consistency > perfection.",
    "Even on hard days, you still showed up. That's the real win.",
    "The streak lives on. Small steps still move you forward.",
    "Low effort today, high commitment always. That's resilience.",
    "Two minutes of action beats two hours of intention.",
  ],
  miss: [
    "Awareness is the first step to recovery. You've got this.",
    "Every miss is data, not defeat. Learn and move on.",
    "Friction logged — now you know what to solve next time.",
    "Missing once won't break you. Missing the lesson might.",
    "Rest if you must, but don't quit. Tomorrow is a new day.",
    "The strongest streaks survive a stumble. Come back stronger.",
  ],
};

export function getRandomQuote(arr: typeof AUTH_QUOTES) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomToast(type: keyof typeof ACTION_TOASTS) {
  const messages = ACTION_TOASTS[type];
  return messages[Math.floor(Math.random() * messages.length)];
}
