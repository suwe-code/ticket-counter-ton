import { Address, fromNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { TicketCounter } from '../wrappers/TicketCounter';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const address = await ui.input('Enter contract address');
    const quantityStr = await ui.input('How many tickets to buy?');

    if (!address || !quantityStr) {
        ui.write('Missing inputs');
        return;
    }

    const quantity = BigInt(quantityStr);
    if (quantity <= 0n) {
        ui.write('Quantity must be > 0');
        return;
    }

    const ticketCounter = provider.open(
        TicketCounter.createFromAddress(Address.parse(address))
    );

    const price = await ticketCounter.getPricePerTicket();
    const totalCost = price * quantity;

    ui.write(`Price per ticket: ${fromNano(price)} TON`);
    ui.write(`Total cost: ${fromNano(totalCost)} TON`);
    ui.write(`Buying ${quantity} ticket(s)...`);

    await ticketCounter.sendBuyTickets(provider.sender(), {
        value: totalCost,
        quantity,
    });

    ui.write('✓ Purchase message sent');
}


