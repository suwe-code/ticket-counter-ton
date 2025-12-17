import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { TicketCounter } from '../wrappers/TicketCounter';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const address = await ui.input('Enter contract address');

    if (!address) {
        ui.write('No address provided');
        return;
    }

    const ticketCounter = provider.open(
        TicketCounter.createFromAddress(Address.parse(address))
    );

    console.log('Sending reset message...');
    await ticketCounter.sendResetCounter(provider.sender(), {
        value: toNano('0.05'),
    });

    console.log('✓ Reset sent');

    const counter = await ticketCounter.getCurrentCounter();
    console.log('Counter is now:', counter);
}
