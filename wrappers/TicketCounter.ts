import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    toNano,
} from '@ton/core';

export type Config = {
    owner: Address;
    maxTickets: bigint;
    price: bigint;
};

export function configToCell(config: Config): Cell {
    return beginCell()
        .storeAddress(config.owner)
        .storeUint(config.maxTickets, 32)
        .storeUint(0, 32) // sold
        .storeCoins(config.price)
        // tickets map<address, uint32> stored as an optional dict; empty map = null dict
        .storeDict() // empty
        .endCell();
}

export class TicketCounter implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromAddress(address: Address) {
        return new TicketCounter(address);
    }

    // Alias for convenience (matches common naming in other TON wrappers)
    static fromAddress(address: Address) {
        return new TicketCounter(address);
    }

    static createFromConfig(config: Config, code: Cell, workchain = 0) {
        const data = configToCell(config);
        const init = { code, data };
        return new TicketCounter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, opts: any) {
        await provider.internal(via, {
            value: opts.value || toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    /**
     * Buy tickets (opcode 0x3edb9d9a).
     * `value` must be exactly `price * quantity`.
     */
    async sendBuyTickets(
        provider: ContractProvider,
        via: Sender,
        opts: Partial<{
            value: bigint;
            quantity: bigint;
        }> = {}
    ) {
        const messageBody = beginCell()
            .storeUint(0x3edb9d9a, 32)
            .storeUint(opts.quantity ?? 1n, 32)
            .endCell();

        await provider.internal(via, {
            value: opts.value ?? toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: messageBody,
        });
    }

    /**
     * Reset tickets (owner-only). Resets sold counter and clears tickets map.
     * Opcode: 0x5fcc3d14
     */
    async sendResetTickets(
        provider: ContractProvider,
        via: Sender,
        opts: Partial<{
            value: bigint;
        }> = {}
    ) {
        const messageBody = beginCell()
            .storeUint(0x5fcc3d14, 32)
            .endCell();

        await provider.internal(via, {
            value: opts.value ?? toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: messageBody,
        });
    }

    async getMaxTickets(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('maxTickets', []);
        return result.stack.readBigNumber();
    }

    async getTicketsSold(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('ticketsSold', []);
        return result.stack.readBigNumber();
    }

    async getTicketsRemaining(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('ticketsRemaining', []);
        return result.stack.readBigNumber();
    }

    async getPricePerTicket(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('pricePerTicket', []);
        return result.stack.readBigNumber();
    }

    async getTotalRevenue(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('totalRevenue', []);
        return result.stack.readBigNumber();
    }

    async getMyTickets(provider: ContractProvider, user: Address): Promise<bigint> {
        const result = await provider.get('myTickets', [
            { type: 'slice', cell: beginCell().storeAddress(user).endCell() },
        ]);
        return result.stack.readBigNumber();
    }
}
