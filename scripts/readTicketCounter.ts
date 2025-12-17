import { Address, fromNano } from '@ton/core';
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

    const maxTickets = await ticketCounter.getMaxTickets();
    const sold = await ticketCounter.getTicketsSold();
    const remaining = await ticketCounter.getTicketsRemaining();
    const price = await ticketCounter.getPricePerTicket();
    const revenue = await ticketCounter.getTotalRevenue();

    ui.write('=== TICKET COUNTER STATUS ===');
    ui.write(`Max Tickets:        ${maxTickets}`);
    ui.write(`Tickets Sold:       ${sold}`);
    ui.write(`Tickets Remaining:  ${remaining}`);
    ui.write(`Price per Ticket:   ${fromNano(price)} TON`);
    ui.write(`Total Revenue:      ${fromNano(revenue)} TON`);
}


