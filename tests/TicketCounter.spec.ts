import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TicketCounter } from '../wrappers/TicketCounter';
import '@ton/test-utils';

describe('TicketCounter', () => {
    let blockchain: Blockchain;
    let ticketCounter: SandboxContract<TicketCounter>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        const code = Cell.EMPTY; // Simplified for testing
        ticketCounter = blockchain.openContract(
            TicketCounter.createFromConfig({}, code)
        );

        await ticketCounter.sendDeploy(deployer.getSender(), {
            value: toNano('0.05'),
        });
    });

    it('should deploy successfully', async () => {
        const counter = await ticketCounter.getCurrentCounter(blockchain.provider());
        expect(counter).toBe(0n);
    });

    it('should increase counter by 1', async () => {
        await ticketCounter.sendIncreaseCounter(
            blockchain.provider(),
            deployer.getSender(),
            toNano('0.05'),
            1n
        );

        const counter = await ticketCounter.getCurrentCounter(blockchain.provider());
        expect(counter).toBe(1n);
    });

    it('should increase counter by 5', async () => {
        await ticketCounter.sendIncreaseCounter(
            blockchain.provider(),
            deployer.getSender(),
            toNano('0.05'),
            5n
        );

        const counter = await ticketCounter.getCurrentCounter(blockchain.provider());
        expect(counter).toBe(5n);
    });

    it('should increase counter multiple times', async () => {
        await ticketCounter.sendIncreaseCounter(
            blockchain.provider(),
            deployer.getSender(),
            toNano('0.05'),
            2n
        );
        await ticketCounter.sendIncreaseCounter(
            blockchain.provider(),
            deployer.getSender(),
            toNano('0.05'),
            3n
        );

        const counter = await ticketCounter.getCurrentCounter(blockchain.provider());
        expect(counter).toBe(5n);
    });

    it('should reset counter', async () => {
        await ticketCounter.sendIncreaseCounter(
            blockchain.provider(),
            deployer.getSender(),
            toNano('0.05'),
            10n
        );
        let counter = await ticketCounter.getCurrentCounter(blockchain.provider());
        expect(counter).toBe(10n);

        await ticketCounter.sendResetCounter(
            blockchain.provider(),
            deployer.getSender(),
            toNano('0.05')
        );
        counter = await ticketCounter.getCurrentCounter(blockchain.provider());
        expect(counter).toBe(0n);
    });

    it('should handle multiple increases then reset', async () => {
        await ticketCounter.sendIncreaseCounter(
            blockchain.provider(),
            deployer.getSender(),
            toNano('0.05'),
            7n
        );
        await ticketCounter.sendIncreaseCounter(
            blockchain.provider(),
            deployer.getSender(),
            toNano('0.05'),
            3n
        );
        let counter = await ticketCounter.getCurrentCounter(blockchain.provider());
        expect(counter).toBe(10n);

        await ticketCounter.sendResetCounter(
            blockchain.provider(),
            deployer.getSender(),
            toNano('0.05')
        );
        counter = await ticketCounter.getCurrentCounter(blockchain.provider());
        expect(counter).toBe(0n);
    });
});
