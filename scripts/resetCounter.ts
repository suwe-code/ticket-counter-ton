import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    ui.write(
        'This project was upgraded from a simple counter to a ticket vending contract.'
    );
    ui.write('Reset is not supported (no admin reset message).');
    ui.write('Use: blueprint run readTicketCounter / buyTicket / myTickets');
}
