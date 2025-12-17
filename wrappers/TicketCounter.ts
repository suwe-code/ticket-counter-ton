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

export type Config = {};

export function configToCell(config: Config): Cell {
    return beginCell().endCell();
}

export class TicketCounter implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) {}

    static createFromAddress(address: Address) {
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

    async sendIncreaseCounter(
        provider: ContractProvider,
        via: Sender,
        opts: Partial<{
            value: bigint;
            increaseBy: bigint;
        }> = {}
    ) {
        const messageBody = beginCell()
            .storeUint(0x7e8764ef, 32)
            .storeUint(opts.increaseBy ?? 1n, 32)
            .endCell();

        await provider.internal(via, {
            value: opts.value || toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: messageBody,
        });
    }

    async sendResetCounter(
        provider: ContractProvider,
        via: Sender,
        opts: Partial<{
            value: bigint;
        }> = {}
    ) {
        const messageBody = beginCell()
            .storeUint(0x3a752f06, 32)
            .endCell();

        await provider.internal(via, {
            value: opts.value || toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: messageBody,
        });
    }

    async getCurrentCounter(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('currentCounter', []);
        return result.stack.readBigNumber();
    }
}
