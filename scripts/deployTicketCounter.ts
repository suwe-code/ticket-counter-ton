import { toNano } from '@ton/core';
import { TicketCounter } from '../wrappers/TicketCounter';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ticketCounter = provider.open(
        TicketCounter.createFromConfig({}, await compile('TicketCounter'))
    );

    await ticketCounter.sendDeploy(provider.sender(), {
        value: toNano('0.05'),
    });

    await provider.waitForDeploy(ticketCounter.address);

    console.log('ID:', ticketCounter.address);
}
