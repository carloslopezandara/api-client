// Required imports
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

async function main () {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider('ws://127.0.0.1:9944');

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });

  // Retrieve the chain & node information information via rpc calls
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

  const keyring = new Keyring({ type: 'sr25519' });

// Add our Alice dev account
const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });
//const bob = keyring.addFromUri('//Bob', { name: 'Bob default' });

// Log some info
console.log(`${alice.meta.name}: has address ${alice.address}`);

// An example address
const ADDR = '5CoX5FJ7dBfRP8g8kgL1rNWvmbbzpoEenXwzsyz5iXj4Kie1';

// Retrieve last block timestamp, account nonce & balances
const [now, { nonce, data: balance }] = await Promise.all([
  api.query.timestamp.now(),
  api.query.system.account(alice.address)
]);

console.log(`${now}: balance of ${balance.free} and a nonce of ${nonce}`);

// Retrieve the latest header
const lastHeader = await api.rpc.chain.getHeader();

// Log the information
console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);

let metadata = JSON.parse('{"manifest_metadata": {"job": {"work": "Storage", "engine": "IPFS", "uri": "QmcwQBzZcFVa7gyEQazd9WryzXKVMK2TvwBweruBZhy3pf"}}}');
console.log(metadata);

  const test = await api.tx.fula
  .uploadManifest(metadata,"QmcwQBzZcFVa7gyEQazd9WryzXKVMK2TvwBweruBZhy3pk", 1,1)
  .signAndSend(alice, ({ events = [], status, txHash }) => {
    console.log(`Current status is ${status.type}`);

    if (status.isFinalized) {
      console.log(`Transaction included at blockHash ${status.asFinalized}`);
      console.log(`Transaction hash ${txHash.toHex()}`);

      // Loop through Vec<EventRecord> to display all events
      events.forEach(({ phase, event: { data, method, section } }) => {
        console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
      });

      test();
    }
  });
}

main().catch(console.error).finally(() => process.exit());