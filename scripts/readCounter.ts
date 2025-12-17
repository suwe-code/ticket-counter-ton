import { NetworkProvider } from '@ton/blueprint';
import { run as runReadTicketCounter } from './readTicketCounter';

export async function run(provider: NetworkProvider) {
    // Backwards-compatible alias (this project used to be a simple counter).
    return runReadTicketCounter(provider);
}
