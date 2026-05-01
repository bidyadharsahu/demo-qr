// Local NLP waiter test — no API calls, pure function test.
// Run:  node --experimental-vm-modules tests/test_local_nlp_waiter.mjs
import { localWaiterReply } from '../lib/local-nlp-waiter.js';

const restaurant = { name: 'Netrik Demo Bistro' };
const menu = [
  { id: 'menu_demo_1', name: 'Truffle Pasta',        price: 18.5, category: 'Mains',    description: 'Creamy truffle pasta with parmesan.', available: true },
  { id: 'menu_demo_2', name: 'Smoked Salmon Toast',  price: 14,   category: 'Starters', description: 'Sourdough toast with smoked salmon.', available: true },
  { id: 'menu_demo_3', name: 'Chocolate Lava Cake',  price: 9,    category: 'Desserts', description: 'Warm chocolate center.',              available: true },
  { id: 'menu_demo_4', name: 'Citrus Mint Cooler',   price: 6,    category: 'Drinks',   description: 'Fresh citrus, mint, sparkling water.', available: true },
];

const cases = [
  { name: 'Greeting',            message: 'hi',                                        expectIntent: 'greet' },
  { name: 'Hello long',          message: 'hello there!',                              expectIntent: 'greet' },
  { name: 'Menu',                message: 'show me the menu',                          expectIntent: 'menu' },
  { name: 'What do you have',    message: 'what do you have?',                         expectIntent: 'menu' },
  { name: 'Recommend',           message: 'what do you recommend?',                    expectIntent: 'recommend' },
  { name: 'Popular',             message: 'whats popular',                             expectIntent: 'recommend' },
  { name: 'Surprise me',         message: 'surprise me',                               expectIntent: 'recommend' },
  { name: 'Add 2 truffle',       message: 'add 2 truffle pasta',                       expectIntent: 'add',    expectAdd: 'menu_demo_1', expectQty: 2 },
  { name: 'Add one cooler',      message: 'i want one citrus mint cooler',             expectIntent: 'add',    expectAdd: 'menu_demo_4', expectQty: 1 },
  { name: 'Add three lava',      message: 'three chocolate lava cake please',          expectIntent: 'add',    expectAdd: 'menu_demo_3', expectQty: 3 },
  { name: 'Allergy',             message: 'I am allergic to peanuts',                  expectIntent: 'allergy' },
  { name: 'Vegan',               message: 'do you have anything vegan?',               expectIntent: 'allergy' },
  { name: 'Hot spicy',           message: 'make it hot please',                        expectIntent: 'spicy' },
  { name: 'Mild',                message: 'mild please, no spice',                     expectIntent: 'spicy' },
  { name: 'Extra cheese',        message: 'extra cheese with the pasta',               expectIntent: 'preferences' },
  { name: 'No onion',            message: 'no onion on the salmon toast',              expectIntent: 'preferences', expectAvoid: 'onion' },
  { name: 'Place order',         message: 'place my order now',                        expectIntent: 'place_order' },
  { name: 'Pay',                 message: 'I want to pay',                             expectIntent: 'pay' },
  { name: 'UPI',                 message: 'pay by upi',                                expectIntent: 'pay' },
  { name: 'Cart',                message: 'whats my total',                            expectIntent: 'cart' },
  { name: 'Thanks',              message: 'thanks a lot!',                             expectIntent: 'thanks' },
  { name: 'Bye',                 message: 'goodbye',                                   expectIntent: 'bye' },
  { name: 'Small talk',          message: 'how are you',                               expectIntent: 'smalltalk' },
  { name: 'Joke',                message: 'tell me a joke',                            expectIntent: 'joke' },
  { name: 'Who',                 message: 'are you a bot?',                            expectIntent: 'who' },
  { name: 'Help',                message: 'help',                                      expectIntent: 'help' },
  { name: 'Hours',               message: 'what are your hours?',                      expectIntent: 'faq_hours' },
  { name: 'Washroom',            message: 'where is the restroom?',                    expectIntent: 'faq_washroom' },
  { name: 'Unknown',             message: 'ghibli sunset over mountains',              expectIntent: 'fallback' },
  { name: 'Empty',               message: '',                                          expectIntent: 'empty' },
  { name: 'Gibberish',           message: 'asdfqwer zxcv',                             expectIntent: 'fallback' },
  { name: 'Place order empty',   message: 'place order',                               expectIntent: 'place_order', cart: [] },
  { name: 'Cart summary filled', message: 'my cart?',                                  expectIntent: 'cart',        cart: [{ id: 'menu_demo_1', name: 'Truffle Pasta', qty: 2, price: 18.5 }] },
];

let pass = 0, fail = 0;
const brainFreeze = /brain\s+freeze/i;

for (const tc of cases) {
  const out = localWaiterReply({
    message: tc.message,
    restaurant,
    menu,
    cart: tc.cart || [],
    stage: 'browsing',
  });

  const okIntent = !tc.expectIntent || out.intent === tc.expectIntent;
  const okNoFreeze = !brainFreeze.test(out.reply);
  const okReply = out.reply && out.reply.length > 0;
  let okAdd = true;
  if (tc.expectAdd) {
    const items = out.actions?.add_items || [];
    const hit = items.find((i) => i.id === tc.expectAdd);
    okAdd = !!hit && (!tc.expectQty || hit.quantity === tc.expectQty);
  }
  let okAvoid = true;
  if (tc.expectAvoid) {
    okAvoid = (out.actions?.set_avoids || []).includes(tc.expectAvoid);
  }

  const ok = okIntent && okNoFreeze && okReply && okAdd && okAvoid;
  if (ok) pass++; else fail++;

  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${tc.name.padEnd(22)} intent=${out.intent}  reply="${out.reply.slice(0, 90)}"`);
  if (!ok) {
    console.log(`        expectIntent=${tc.expectIntent} expectAdd=${tc.expectAdd} actions=${JSON.stringify(out.actions)}`);
  }
}

console.log('\n-------------------------------------');
console.log(`Total: ${cases.length}   Pass: ${pass}   Fail: ${fail}`);
if (fail > 0) process.exit(1);
