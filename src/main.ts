import 'dotenv/config';
import { CronJob } from 'cron';
import { createWalletClient, http, type Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { treasureTopaz, treasure } from 'viem/chains';

if (!process.env.TESTNET_WALLET) {
    throw new Error('Wallet private key missing');
}

const account = privateKeyToAccount(process.env.TESTNET_WALLET as `0x${string}`);

const args = process.argv.slice(2);

const networkArg = args[0];
let network: Chain | null = null;

if (!networkArg) {
    throw new Error('network arg must be passed in\n npm run start -- {network}');
}

switch (networkArg) {
    case 'testnet':
        network = treasureTopaz;
        break;
    case 'mainnet':
        network = treasure;
        break;
    default:
        throw new Error('Invalid Arg');
}

try {
    CronJob.from({
        cronTime: '0 */2 * * * *',
        onTick: async () => {
            console.log('You will see this message every second');

            const client = createWalletClient({
                account,
                chain: network,
                transport: http(),
            });

            const hash = await client.sendTransaction({
                account,
                to: account.address,
                value: 0n,
            });

            console.log('Tx sent:', hash);
        },
        start: true,
        timeZone: 'America/Los_Angeles',
    });
} catch (e) {
    if (e instanceof Error) {
        console.error(e.message);
    }

    console.error({ e });
}
