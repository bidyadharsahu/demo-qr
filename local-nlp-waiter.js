/**
 * Local NLP Waiter — zero-dependency, rule-based conversational engine.
 *
 * Exports: localWaiterReply({ message, restaurant, menu, cart, stage, history })
 * Returns: { reply, actions, raw }  — NEVER throws. NEVER says "brain freeze".
 *
 * Handles: greetings, menu browsing, recommendations, item add (with qty),
 * allergy, spicy level, wants/avoids, cooking notes, place order, payment,
 * cart summary, FAQ, small talk, and a context-aware fallback.
 */

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ------------------------------------------------------------------ *
 *  Deterministic pick — same message always produces the same reply   *
 *  variant, but different messages spread across templates nicely.    *
 * ------------------------------------------------------------------ */
function hashString(s = '') {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function pick(arr, seed) {
  if (!arr || !arr.length) return '';
  return arr[seed % arr.length];
}

/* ------------------------------------------------------------------ *
 *  Menu helpers                                                       *
 * ------------------------------------------------------------------ */
const NUM_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, a: 1, an: 1, couple: 2 };

function detectMenuItems(lower, menu = []) {
  const hits = [];
  for (const item of menu) {
    const name = String(item.name || '').trim();
    if (!name) continue;
    const nameLower = name.toLowerCase();
    if (!lower.includes(nameLower)) continue;

    // qty before the name: "2 truffle pasta", "two truffle pasta", "a truffle pasta"
    const qtyRe = new RegExp(`(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an|couple)\\s*(?:x|\\*|of)?\\s*(?:order[s]?\\s+of\\s+)?${escapeRegExp(nameLower)}`);
    const qtyMatch = lower.match(qtyRe);
    let quantity = 1;
    if (qtyMatch) {
      const tok = qtyMatch[1];
      quantity = NUM_WORDS[tok] || parseInt(tok, 10) || 1;
    }
    hits.push({ id: item.id, name: item.name, quantity: Math.max(1, quantity), item });
  }
  return hits;
}

function pickRecommendations(menu = [], n = 2, seed = 0) {
  if (!menu.length) return [];
  const pool = menu.filter((m) => m.available !== false);
  if (!pool.length) return [];
  const out = [];
  const used = new Set();
  for (let i = 0; i < Math.min(n, pool.length); i++) {
    const idx = (seed + i * 7) % pool.length;
    let k = idx;
    while (used.has(k)) k = (k + 1) % pool.length;
    used.add(k);
    out.push(pool[k]);
  }
  return out;
}

function menuByCategory(menu = []) {
  const byCat = {};
  for (const m of menu) {
    const cat = m.category || 'Other';
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(m);
  }
  return byCat;
}

function cartTotal(cart = []) {
  return (cart || []).reduce((s, c) => s + (Number(c.price || 0) * Number(c.qty || 0)), 0);
}

/* ------------------------------------------------------------------ *
 *  Intent detection                                                   *
 * ------------------------------------------------------------------ */
function detectIntent(msg, menu, cart, stage) {
  const lower = (msg || '').toLowerCase().trim();
  if (!lower) return { kind: 'empty' };

  // Pay / checkout payment
  if (/\b(pay|payment|bill|check\s*please|charge|settle|upi|card)\b/.test(lower)) {
    return { kind: 'pay' };
  }

  // Place order
  if (/\b(place\s+(my\s+)?order|submit\s+order|send\s+(?:the\s+)?order|confirm\s+order|i'?m\s+ready|that'?s\s+all|checkout)\b/.test(lower)) {
    return { kind: 'place_order' };
  }

  // Remove items
  if (/\b(remove|delete|cancel|take\s+off|don'?t\s+want|clear\s+cart|empty\s+cart)\b/.test(lower)) {
    return { kind: 'remove' };
  }

  // Cart / total / status
  if (/\b(cart|total|how\s+much|what'?s\s+my\s+(order|bill|total)|order\s+status|my\s+order)\b/.test(lower)) {
    return { kind: 'cart' };
  }

  // Menu browse
  if (/\b(menu|show\s+(me\s+)?(?:the\s+)?menu|what\s+do\s+you\s+(?:have|serve|got)|dishes|what'?s\s+good|what'?s\s+on\s+offer|list\s+of\s+food|food\s+options)\b/.test(lower)) {
    return { kind: 'menu' };
  }

  // Recommend
  if (/\b(recommend|suggest|popular|best\s*seller|signature|chef'?s\s+(?:pick|special)|what\s+should\s+i\s+(?:get|order|try)|what\s+do\s+you\s+suggest|surprise\s+me)\b/.test(lower)) {
    return { kind: 'recommend' };
  }

  // Allergy
  if (/\b(allerg(?:y|ic|ies)|intoleran|gluten[- ]?free|lactose|peanut|nut|dairy|shellfish|vegan|vegetarian|veggie|halal|kosher)\b/.test(lower)) {
    return { kind: 'allergy' };
  }

  // Spicy
  if (/\b(spicy|spice|hot|mild|medium|extra[- ]?hot|no\s+spic|picante)\b/.test(lower)) {
    return { kind: 'spicy' };
  }

  // Add items: exact menu match
  const menuHits = detectMenuItems(lower, menu);
  if (menuHits.length) return { kind: 'add', items: menuHits };

  // Add item by category
  const catHit = menuByCategory(menu);
  for (const cat of Object.keys(catHit)) {
    if (new RegExp(`\\b${escapeRegExp(cat.toLowerCase())}\\b`).test(lower)) {
      return { kind: 'show_category', category: cat, items: catHit[cat] };
    }
  }

  // Greetings
  if (/^(hi|hello|hey|yo|hola|namaste|good\s+(morning|afternoon|evening))\b/.test(lower)) {
    return { kind: 'greet' };
  }

  // Thanks
  if (/\b(thanks|thank\s+you|thx|ty|appreciated|cheers)\b/.test(lower)) {
    return { kind: 'thanks' };
  }

  // Goodbye
  if (/\b(bye|goodbye|see\s+you|later|good\s+night|cya)\b/.test(lower)) {
    return { kind: 'bye' };
  }

  // Help
  if (/\b(help|how\s+does\s+this\s+work|what\s+can\s+you\s+do|commands|options)\b/.test(lower)) {
    return { kind: 'help' };
  }

  // FAQ — hours, location, wifi, bathroom, waiter
  if (/\b(hours?|open|close|timings?|when.*(open|close))\b/.test(lower)) return { kind: 'faq_hours' };
  if (/\b(location|address|where.*(located|are\s+you))\b/.test(lower)) return { kind: 'faq_location' };
  if (/\b(wifi|password|internet)\b/.test(lower)) return { kind: 'faq_wifi' };
  if (/\b(bathroom|restroom|toilet|washroom)\b/.test(lower)) return { kind: 'faq_washroom' };
  if (/\b(call.*(waiter|human|staff)|real\s+waiter|speak\s+to\s+someone)\b/.test(lower)) return { kind: 'faq_human' };

  // Small talk
  if (/\b(how\s+are\s+you|how'?s\s+it\s+going|what'?s\s+up|sup|you\s+ok)\b/.test(lower)) {
    return { kind: 'smalltalk' };
  }
  if (/\b(joke|funny|make\s+me\s+laugh)\b/.test(lower)) return { kind: 'joke' };
  if (/\b(who\s+are\s+you|your\s+name|are\s+you\s+(a\s+)?(bot|human|ai))\b/.test(lower)) return { kind: 'who' };

  // Wants / avoids / notes (free form)
  if (/\b(extra|with|add|more|please\s+add)\b/.test(lower) || /\b(no|without|hold(?:\s+the)?|skip|not)\b/.test(lower)) {
    return { kind: 'preferences' };
  }

  return { kind: 'fallback' };
}

/* ------------------------------------------------------------------ *
 *  Action extractor — same spirit as extractDemoChatActions           *
 * ------------------------------------------------------------------ */
function extractActions(msg, menu = []) {
  const lower = (msg || '').toLowerCase();
  const actions = {};

  // Add items
  const hits = detectMenuItems(lower, menu);
  if (hits.length) {
    actions.add_items = hits.map((h) => ({ id: h.id, name: h.name, quantity: h.quantity }));
  }

  // Spicy
  if (/extra[- ]?hot/.test(lower)) actions.set_spicy = 'extra-hot';
  else if (/\bhot\b/.test(lower)) actions.set_spicy = 'hot';
  else if (/\bmedium\b/.test(lower)) actions.set_spicy = 'medium';
  else if (/\bmild\b|no\s+spic/.test(lower)) actions.set_spicy = 'mild';

  // Allergy
  if (/\b(allerg(?:y|ic|ies)|intoleran)\b/.test(lower)) {
    actions.set_allergy = msg.slice(0, 120).trim();
  }

  // Wants
  const wants = [];
  const wantRe = /\b(?:extra|with|add|more|please\s+add)\s+([a-z][a-z\s-]{1,30}?)(?=[,.!?]|$|\sand\s|\swith\s|\son\s|\sin\s|\sat\s|\sfor\s|\sto\s|\splease\b)/g;
  let w;
  while ((w = wantRe.exec(lower)) !== null) {
    const phrase = w[1].trim();
    if (phrase && phrase.length < 30) wants.push(phrase);
  }
  if (wants.length) actions.set_wants = [...new Set(wants)].slice(0, 6);

  // Avoids
  const avoids = [];
  const avoidRe = /\b(?:no|without|skip|hold(?:\s+the)?|not?)\s+([a-z][a-z\s-]{1,30}?)(?=[,.!?]|$|\sand\s|\swith\s|\son\s|\sin\s|\sat\s|\sfor\s|\sto\s|\splease\b)/g;
  let a;
  while ((a = avoidRe.exec(lower)) !== null) {
    const phrase = a[1].trim();
    // Filter junk like "no" or single stop-words
    if (phrase && phrase.length > 1 && phrase.length < 30 && !/^(thanks|thank|problem|worries|way|one|idea)$/.test(phrase)) {
      avoids.push(phrase);
    }
  }
  if (avoids.length) actions.set_avoids = [...new Set(avoids)].slice(0, 6);

  // Place order
  if (/\b(place\s+(my\s+)?order|submit\s+order|send\s+(?:the\s+)?order|confirm\s+order|checkout|that'?s\s+all|i'?m\s+ready)\b/.test(lower)) {
    actions.place_order = true;
  }

  // Pay
  if (/\b(pay|payment|bill|charge|settle|upi|pay\s+now|check\s+please)\b/.test(lower)) {
    actions.pay_now = true;
  }

  return Object.keys(actions).length ? actions : null;
}

/* ------------------------------------------------------------------ *
 *  Response templates                                                 *
 * ------------------------------------------------------------------ */
const T = {
  greet: [
    'Hey there! Welcome in. Hungry? I can walk you through the menu or just pick you a winner.',
    'Hi! Glad you stopped by. Want me to suggest something, or would you rather browse the menu?',
    'Hello! Grab a seat — what are you in the mood for tonight?',
    'Hey! Good to see you. Say the word and I\'ll get the menu up, or I can recommend our favourites.',
  ],
  thanks: [
    'Anytime! Let me know if you need anything else.',
    'My pleasure — shout if you want another round or the bill.',
    'You bet. Holler whenever you\'re ready for more.',
    'Happy to help! I\'m right here if you change your mind about anything.',
  ],
  bye: [
    'Take care! Come back soon — we\'ll keep a seat warm.',
    'Cheers! Hope to see you again. Safe travels.',
    'Goodbye for now! It was a pleasure serving you.',
  ],
  help: [
    'I can suggest dishes, show the menu, add items to your cart, handle allergies or spice levels, place your order, and even process payment — all right here. What would you like to do?',
    'Here\'s what I do: recommendations, menu, adding/removing items, setting preferences (allergies, spice, no onion, etc.), placing the order, and payment. Ask away.',
  ],
  smalltalk: [
    'Running full speed and happy to be here! How about you — hungry?',
    'All good on my end. The kitchen smells amazing today. Want me to suggest something?',
    'Doing great, thanks for asking! What\'s tempting you today?',
  ],
  joke: [
    'Why did the chef break up with the salad? It had too much dressing on the side. 🥗',
    'I told the soup a secret. It\'s chicken… I mean, simmering on it.',
    'What do you call a hungry clock? Four seconds past lunch.',
  ],
  who: [
    'I\'m your in-chat waiter — no humans bothering you, just quick service.',
    'I\'m the digital waiter for this table. Ask me anything about the menu, your cart, or the bill.',
  ],
  faq_hours: [
    'We\'re open for lunch and dinner today — the kitchen usually closes about an hour before the restaurant shuts. Want me to ask a staffer for exact timings?',
  ],
  faq_location: [
    'You\'re already here! For directions or parking, a real staff member can help — want me to flag one over?',
  ],
  faq_wifi: [
    'Ask a staff member — they\'ll share the Wi-Fi password in a flash. Meanwhile, I can keep you busy with food.',
  ],
  faq_washroom: [
    'Just ask any staffer walking by and they\'ll point you to the washroom. I\'ll keep your cart safe.',
  ],
  faq_human: [
    'No problem — flag down any staff member and they\'ll be right with you. I\'ll hold your order in the meantime.',
  ],
  remove: [
    'Got it — tell me exactly which dish to take off and I\'ll remove it from your cart.',
    'Sure, which item should I remove? Name the dish and it\'s gone.',
  ],
  menu_empty: [
    'The menu is still loading. Give it a second and try again?',
  ],
  fallback: [
    "I want to make sure I help properly — could you rephrase that? You can ask me to recommend something, show the menu, add a dish, or place your order.",
    "Let me help you better — try something like 'show the menu', 'what do you recommend', or 'add 2 truffle pasta'.",
    "Tell me a bit more — are you after a recommendation, ready to order, or curious about a specific dish?",
  ],
  empty: [
    'Say something and I\'ll jump in — you can ask for recommendations, the menu, or to place an order.',
  ],
};

/* ------------------------------------------------------------------ *
 *  Main reply builder                                                 *
 * ------------------------------------------------------------------ */
function formatPrice(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function buildReply({ intent, message, menu = [], cart = [], stage, restaurant, seed }) {
  const restName = restaurant?.name || 'the kitchen';
  const total = cartTotal(cart);
  const hasCart = cart && cart.length > 0;

  switch (intent.kind) {
    case 'empty':
      return pick(T.empty, seed);

    case 'greet':
      return pick(T.greet, seed);

    case 'thanks':
      return pick(T.thanks, seed);

    case 'bye':
      return pick(T.bye, seed);

    case 'help':
      return pick(T.help, seed);

    case 'smalltalk':
      return pick(T.smalltalk, seed);

    case 'joke':
      return pick(T.joke, seed);

    case 'who':
      return pick(T.who, seed);

    case 'faq_hours':
      return pick(T.faq_hours, seed);
    case 'faq_location':
      return pick(T.faq_location, seed);
    case 'faq_wifi':
      return pick(T.faq_wifi, seed);
    case 'faq_washroom':
      return pick(T.faq_washroom, seed);
    case 'faq_human':
      return pick(T.faq_human, seed);

    case 'menu': {
      if (!menu.length) return pick(T.menu_empty, seed);
      const byCat = menuByCategory(menu);
      const lines = Object.entries(byCat).map(([cat, items]) => {
        const names = items.slice(0, 4).map((i) => i.name).join(', ');
        return `${cat}: ${names}`;
      });
      const openers = [
        `Here's what we're cooking at ${restName} today —`,
        `A quick tour of tonight's menu —`,
        `Happy to walk you through the menu —`,
      ];
      return `${pick(openers, seed)} ${lines.join(' · ')}. Anything jumping out?`;
    }

    case 'show_category': {
      const items = intent.items || [];
      if (!items.length) return `We don\'t have much in ${intent.category} tonight — want to try another section?`;
      const sample = items.slice(0, 3).map((i) => `${i.name} (${formatPrice(i.price)})`).join(', ');
      return `In ${intent.category} we've got ${sample}. Want any of them?`;
    }

    case 'recommend': {
      if (!menu.length) return pick(T.menu_empty, seed);
      const picks = pickRecommendations(menu, 2, seed);
      const [a, b] = picks;
      const reasons = [
        'a guest favourite that rarely misses',
        'the chef\'s quiet brag',
        'simple, generous, and always clean on the return',
        'the one regulars keep re-ordering',
        'a crowd pleaser, especially tonight',
      ];
      if (!b) return `I'd go with the ${a.name} — ${pick(reasons, seed)}. Want me to add one?`;
      return `Tough call, but I'd lean toward the ${a.name} — ${pick(reasons, seed)}. If you want something lighter, the ${b.name} is a solid shout. Want me to add either?`;
    }

    case 'add': {
      const lines = intent.items
        .map((h) => `${h.quantity}× ${h.name} (${formatPrice(h.item?.price)})`)
        .join(', ');
      const followups = [
        'Anything to go alongside?',
        'Anything else while I\'m at it?',
        'Want something to drink with that?',
      ];
      return `Adding ${lines} to your cart. ${pick(followups, seed)}`;
    }

    case 'remove':
      return pick(T.remove, seed);

    case 'cart': {
      if (!hasCart) return 'Your cart is empty right now. Want a recommendation to get started?';
      const lines = cart.map((c) => `${c.qty}× ${c.name}`).join(', ');
      return `So far you've got ${lines} — total ${formatPrice(total)}. Say "place order" whenever you\'re ready.`;
    }

    case 'place_order': {
      if (!hasCart) return 'Your cart is empty — pick something from the menu first and then we\'ll fire the order.';
      return `On it — sending ${cart.length} item${cart.length > 1 ? 's' : ''} (${formatPrice(total)}) to the kitchen now. Any final notes for the chef?`;
    }

    case 'pay': {
      if (stage === 'paid') return 'All paid up already — you\'re good to go. Hope it was great!';
      if (!hasCart && stage === 'browsing') return 'You haven\'t ordered anything yet! Want me to suggest something first?';
      return 'Perfect — pulling up the UPI payment now. Pay securely right inside this chat.';
    }

    case 'allergy': {
      return `Noted — I\'ve flagged that with the kitchen. We\'ll steer clear. Want me to point out a few safe dishes from the menu?`;
    }

    case 'spicy': {
      const level = /extra[- ]?hot/.test(message.toLowerCase()) ? 'extra-hot'
        : /\bhot\b/.test(message.toLowerCase()) ? 'hot'
        : /\bmedium\b/.test(message.toLowerCase()) ? 'medium'
        : 'mild';
      const tones = {
        'extra-hot': 'Bold choice — chef will bring the heat. 🔥',
        hot: 'Hot it is — you\'ll feel it but still enjoy every bite.',
        medium: 'Balanced heat, good call — that\'s how most regulars take it.',
        mild: 'Gentle on the spice, got it. Comfort over fireworks.',
      };
      return `${tones[level]} Anything else I should know?`;
    }

    case 'preferences': {
      const openers = [
        'Got it — I\'ll pass that on to the kitchen.',
        'Noted — the chef will adjust accordingly.',
        'Sure, I\'ll make sure they know.',
      ];
      return `${pick(openers, seed)} Anything you\'d like to add to the order?`;
    }

    case 'fallback':
    default:
      return pick(T.fallback, seed);
  }
}

/* ------------------------------------------------------------------ *
 *  Public entrypoint                                                  *
 * ------------------------------------------------------------------ */
function localWaiterReply({ message = '', restaurant, menu = [], cart = [], stage = 'browsing' } = {}) {
  try {
    const seed = hashString(message) + (cart?.length || 0) + (menu?.length || 0);
    const intent = detectIntent(message, menu, cart, stage);
    const reply = buildReply({ intent, message, menu, cart, stage, restaurant, seed });
    const actions = extractActions(message, menu);
    return { reply, actions, raw: reply, intent: intent.kind };
  } catch (e) {
    // Absolute safety net — still never throw, still never "brain freeze".
    return {
      reply: 'Let me make sure I help you right — could you rephrase that? You can ask for the menu, recommendations, or to place an order.',
      actions: null,
      raw: 'fallback',
      intent: 'error',
    };
  }
}

export { localWaiterReply, extractActions, detectIntent };
export default localWaiterReply;
