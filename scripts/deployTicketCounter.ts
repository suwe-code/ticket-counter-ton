import { Address, toNano } from '@ton/core';
import { TicketCounter } from '../wrappers/TicketCounter';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    let owner = provider.sender().address;
    if (!owner) {
        const ownerStr = await ui.input('Owner address (leave empty to cancel)');
        if (!ownerStr) {
            ui.write('No owner address provided');
            return;
        }
        owner = Address.parse(ownerStr);
    }

    const maxTicketsStr = await ui.input('Max tickets');
    const priceStr = await ui.input('Price per ticket (TON, e.g. 1)');

    if (!maxTicketsStr || !priceStr) {
        ui.write('Missing inputs');
        return;
    }

    const maxTickets = BigInt(maxTicketsStr);
    const price = toNano(priceStr);

    const ticketCounter = provider.open(
        TicketCounter.createFromConfig({ owner, maxTickets, price }, await compile('TicketCounter'))
    );

    await ticketCounter.sendDeploy(provider.sender(), {
        value: toNano('0.05'),
    });

    await provider.waitForDeploy(ticketCounter.address);

    ui.write(`Deployed TicketCounter at: ${ticketCounter.address.toString()}`);
}
