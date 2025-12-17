import { NetworkProvider } from '@ton/blueprint';
import { run as runBuyTicket } from './buyTicket';

export async function run(provider: NetworkProvider) {
    // Backwards-compatible alias: "increaseCounter" is now "buyTicket".
    return runBuyTicket(provider);
}
