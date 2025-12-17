import { Address } from '@ton/core';
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

    let me = provider.sender().address;
    if (!me) {
        const meStr = await ui.input('Enter your wallet address');
        if (!meStr) {
            ui.write('No wallet address provided');
            return;
        }
        me = Address.parse(meStr);
    }

    const mine = await ticketCounter.getMyTickets(me);
    ui.write(`Your address: ${me.toString()}`);
    ui.write(`Your tickets: ${mine}`);
}


