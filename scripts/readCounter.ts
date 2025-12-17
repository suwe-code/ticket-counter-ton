import { Address } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { TicketCounter } from '../wrappers/TicketCounter';

export async function run(provider: NetworkProvider) {

    const ui = provider.ui();
    const address = await ui.input('Enter contract address');

    if (!address) {
        ui.write('No address provided');
        return;
    }

    const ticketCounter = provider.open(TicketCounter.createFromAddress(Address.parse(address)));
    const counter = await ticketCounter.getCurrentCounter();

    ui.write(`Current counter: ${counter}`);
}
