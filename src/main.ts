
import { md } from './lib/md/md';
import { mdMain } from './lib/md/md-main';

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
    throw e;
  }
})();

async function main() {
  console.log('hi ~');
  // md();
  await mdMain();
}
