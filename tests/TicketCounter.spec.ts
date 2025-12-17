import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TicketCounter } from '../wrappers/TicketCounter';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TicketCounter', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TicketCounter');
    });

    let blockchain: Blockchain;
    let ticketCounter: SandboxContract<TicketCounter>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        ticketCounter = blockchain.openContract(
            TicketCounter.createFromConfig(
                {
                    owner: deployer.address,
                    maxTickets: 5n,
                    price: toNano('1'),
                },
                code
            )
        );

        const deployResult = await ticketCounter.sendDeploy(deployer.getSender(), {
            value: toNano('0.05'),
        });

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: ticketCounter.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy with correct initial state', async () => {
        expect(await ticketCounter.getMaxTickets()).toBe(5n);
        expect(await ticketCounter.getTicketsSold()).toBe(0n);
        expect(await ticketCounter.getTicketsRemaining()).toBe(5n);
        expect(await ticketCounter.getPricePerTicket()).toBe(toNano('1'));
        expect(await ticketCounter.getTotalRevenue()).toBe(0n);
    });

    it('should allow buying 1 ticket', async () => {
        const buyer = await blockchain.treasury('buyer');

        const buyResult = await ticketCounter.sendBuyTickets(buyer.getSender(), {
            quantity: 1n,
            value: toNano('1'),
        });

        expect(buyResult.transactions).toHaveTransaction({
            from: buyer.address,
            to: ticketCounter.address,
            success: true,
        });

        expect(await ticketCounter.getTicketsSold()).toBe(1n);
        expect(await ticketCounter.getTicketsRemaining()).toBe(4n);
        expect(await ticketCounter.getTotalRevenue()).toBe(toNano('1'));
        expect(await ticketCounter.getMyTickets(buyer.address)).toBe(1n);
    });

    it('should allow buying multiple tickets in one message', async () => {
        const buyer = await blockchain.treasury('buyer2');

        await ticketCounter.sendBuyTickets(buyer.getSender(), {
            quantity: 3n,
            value: toNano('3'),
        });

        expect(await ticketCounter.getTicketsSold()).toBe(3n);
        expect(await ticketCounter.getTicketsRemaining()).toBe(2n);
        expect(await ticketCounter.getTotalRevenue()).toBe(toNano('3'));
        expect(await ticketCounter.getMyTickets(buyer.address)).toBe(3n);
    });

    it('should reject wrong payment amount', async () => {
        const buyer = await blockchain.treasury('buyer3');

        const badBuy = await ticketCounter.sendBuyTickets(buyer.getSender(), {
            quantity: 2n,
            value: toNano('1'),
        });

        expect(badBuy.transactions).toHaveTransaction({
            from: buyer.address,
            to: ticketCounter.address,
            success: false,
        });

        // state unchanged
        expect(await ticketCounter.getTicketsSold()).toBe(0n);
        expect(await ticketCounter.getMyTickets(buyer.address)).toBe(0n);
    });

    it('should reject buying more than maxTickets', async () => {
        const buyer = await blockchain.treasury('buyer4');

        await ticketCounter.sendBuyTickets(buyer.getSender(), {
            quantity: 5n,
            value: toNano('5'),
        });

        expect(await ticketCounter.getTicketsSold()).toBe(5n);
        expect(await ticketCounter.getTicketsRemaining()).toBe(0n);

        const overflowBuy = await ticketCounter.sendBuyTickets(buyer.getSender(), {
            quantity: 1n,
            value: toNano('1'),
        });

        expect(overflowBuy.transactions).toHaveTransaction({
            from: buyer.address,
            to: ticketCounter.address,
            success: false,
        });

        expect(await ticketCounter.getTicketsSold()).toBe(5n);
    });
});
