// Required imports
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { isHex, isU8a, u8aToU8a, stringToU8a, u8aToString } = require('@polkadot/util');

async function main () {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider('wss://node.testnet.fx.land');

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

let manifest_metadata = JSON.parse('{"job": {"work": "Storage", "engine": "IPFS", "uri": "bafybeibpkbze56segjvs4qxyntqeykx5ywyqs6kvrqs4ddmikhxx7fxt7i"}}');
let metadataU8a = stringToU8a(JSON.stringify(manifest_metadata));
let metadataBytes = u8aToString(metadataU8a);

  await api.tx.fula
  .uploadManifest(metadataBytes,"bafybeibpkbze56segjvs4qxyntqeykx5ywyqs6kvrqs4ddmikhxx7fxt7i", 1, 3)
  .signAndSend(alice, ({ events = [], status, txHash }) => {
    console.log(`Current status is ${status.type}`);

    if (status.isFinalized) {
      console.log(`Transaction included at blockHash ${status.asFinalized}`);
      console.log(`Transaction hash ${txHash.toHex()}`);

      // Loop through Vec<EventRecord> to display all events
      events.forEach(({ phase, event: { data, method, section } }) => {
        console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
      });
    }
  });
}

main().catch(console.error);
