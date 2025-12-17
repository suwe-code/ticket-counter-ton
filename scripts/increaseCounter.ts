import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { TicketCounter } from '../wrappers/TicketCounter';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const address = await ui.input('Enter contract address');
    const increaseBy = await ui.input('Increase counter by');

    if (!address || !increaseBy) {
        ui.write('Missing inputs');
        return;
    }

    const ticketCounter = provider.open(
        TicketCounter.createFromAddress(Address.parse(address))
    );

    console.log('Sending increase message...');
    await ticketCounter.sendIncreaseCounter(provider.sender(), {
        value: toNano('0.05'),
        increaseBy: BigInt(increaseBy),
    });

    console.log('✓ Message sent');

    const counter = await ticketCounter.getCurrentCounter();
    console.log('New counter:', counter);
}
