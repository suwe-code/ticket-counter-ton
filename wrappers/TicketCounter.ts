import {
    Address,
    beginCell,
    Cell,
    Contract,
    ContractABI,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode
} from '@ton/core';

export type TicketCounterConfig = {};

export function ticketCounterConfigToCell(config: TicketCounterConfig): Cell {
    return beginCell().endCell();
}

export class TicketCounter implements Contract {
    abi: ContractABI = { name: 'TicketCounter' }

    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TicketCounter(address);
    }

    static createFromConfig(config: TicketCounterConfig, code: Cell, workchain = 0) {
        const data = ticketCounterConfigToCell(config);
        const init = { code, data };
        return new TicketCounter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
