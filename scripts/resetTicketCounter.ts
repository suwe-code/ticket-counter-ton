import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { TicketCounter } from '../wrappers/TicketCounter';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const address = await ui.input('Enter contract address');

    if (!address) {
        ui.write('No contract address provided');
        return;
    }

    const ticketCounter = provider.open(
        TicketCounter.createFromAddress(Address.parse(address))
    );

    // Check current state
    const sold = await ticketCounter.getTicketsSold();
    const revenue = await ticketCounter.getTotalRevenue();

    ui.write(`Current state:`);
    ui.write(`  Tickets sold: ${sold}`);
    ui.write(`  Total revenue: ${revenue}`);
    ui.write(``);
    ui.write(`⚠️  WARNING: This will reset sold counter to 0 and clear ALL ticket ownership!`);
    ui.write(`Only the contract owner can execute this.`);
    
    const confirm = await ui.input('Type "RESET" to confirm');
    if (confirm !== 'RESET') {
        ui.write('Reset cancelled');
        return;
    }

    ui.write('Sending reset message...');
    await ticketCounter.sendResetTickets(provider.sender(), {
        value: toNano('0.05'),
    });

    ui.write('✓ Reset message sent');
    ui.write(`After confirmation, sold will be 0 and all tickets map cleared.`);
}

