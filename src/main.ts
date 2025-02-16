
import { md } from './lib/md/md';

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
  md();
}
