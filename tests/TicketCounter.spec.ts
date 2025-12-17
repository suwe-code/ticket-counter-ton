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
    let deployer: SandboxContract<TreasuryContract>;
    let ticketCounter: SandboxContract<TicketCounter>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        ticketCounter = blockchain.openContract(TicketCounter.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await ticketCounter.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: ticketCounter.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and ticketCounter are ready to use
    });
});
