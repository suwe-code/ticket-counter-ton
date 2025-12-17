# Ticket Counter - TON Smart Contract

A decentralized ticket vending system built on the TON blockchain. This smart contract allows event organizers to sell a fixed number of tickets with a set price, track ownership, and manage sales—all on-chain with no central server required.

## About the Project

This is a **simple event ticket counter** that demonstrates a full ticketing system on TON:

- **Fixed Supply**: Set a maximum number of tickets at deployment
- **Fixed Price**: Set price per ticket (in TON) at deployment
- **Ownership Tracking**: Each buyer's address is mapped to their ticket count
- **On-Chain Storage**: All data (sales, ownership) is stored permanently on the blockchain
- **Owner Controls**: Contract owner can reset sales (clears sold count and ownership map)

### Features

✅ Buy tickets by sending TON with the correct amount  
✅ Track how many tickets each address owns  
✅ View real-time stats: sold, remaining, revenue  
✅ Owner-only reset function to clear sales  
✅ Immutable configuration: max tickets and price set at deploy  

## Project Structure

```
ticket-counter-ton/
├── contracts/
│   └── ticket_counter.tolk      # Smart contract source (Tolk language)
├── wrappers/
│   └── TicketCounter.ts          # TypeScript wrapper for contract interaction
├── scripts/
│   ├── deployTicketCounter.ts    # Deploy new contract instance
│   ├── readTicketCounter.ts      # View contract stats (sold, remaining, revenue)
│   ├── buyTicket.ts              # Purchase tickets
│   ├── myTickets.ts              # Check your ticket count
│   └── resetTicketCounter.ts     # Owner-only: reset sales and ownership
├── tests/
│   └── TicketCounter.spec.ts     # Jest tests for contract functionality
├── build/                        # Compiled contract artifacts (generated)
└── package.json
```

## Prerequisites

- **Node.js** >= 18.14.0 (or >= 20.0.0 recommended)
- **npm** or **yarn**
- A TON wallet (for testnet: Tonkeeper or similar)

## Setup & Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd ticket-counter-ton
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify installation**:
   ```bash
   npx blueprint --version
   ```

## Building

Compile the smart contract to generate build artifacts:

```bash
npm run build
```

Or directly:
```bash
npx blueprint build TicketCounter
```

This will:
- Compile `contracts/ticket_counter.tolk` to TVM bytecode
- Generate `build/TicketCounter.compiled.json` with the contract cell
- Create `build/TicketCounter/TicketCounter.fif` (Fift assembly)

## Testing

Run the test suite to verify contract functionality:

```bash
npm test
```

Or:
```bash
npx jest --verbose
```

Tests cover:
- Contract deployment
- Buying tickets (single and multiple)
- Payment validation
- Max tickets limit enforcement
- Getter methods

## Deployment & Usage

### 1. Deploy a New Contract

Deploy your ticket counter with custom parameters:

```bash
npx blueprint run deployTicketCounter --testnet
```

You'll be prompted for:
- **Owner address**: Your wallet address (or leave empty to use connected wallet)
- **Max tickets**: Maximum number of tickets available (e.g., `100`)
- **Price per ticket**: Price in TON (e.g., `1` for 1 TON per ticket)

The script will output the contract address. **Save this address** - you'll need it for all other operations.

### 2. View Contract Status

Check current sales stats:

```bash
npx blueprint run readTicketCounter --testnet
```

Enter the contract address when prompted. You'll see:
- Max tickets
- Tickets sold
- Tickets remaining
- Price per ticket
- Total revenue

### 3. Buy Tickets

Purchase tickets from the contract:

```bash
npx blueprint run buyTicket --testnet
```

You'll be prompted for:
- Contract address
- Quantity of tickets to buy

The script automatically calculates the total cost and sends the transaction from your connected wallet.

### 4. Check Your Tickets

See how many tickets your wallet owns:

```bash
npx blueprint run myTickets --testnet
```

Enter the contract address. The script uses your connected wallet address to query the contract.

### 5. Reset Sales (Owner Only)

Clear all sales and ownership records:

```bash
npx blueprint run resetTicketCounter --testnet
```

**Important**: Only the contract owner (set at deployment) can execute this. The script will:
- Show current state
- Require typing "RESET" to confirm
- Reset `sold` counter to 0
- Clear the entire `tickets` ownership map

**Note**: This does NOT change `maxTickets` or `price` (those are immutable).

## How It Works

### Smart Contract Storage

The contract stores:
- `owner`: Contract owner address (set at deploy, immutable)
- `maxTickets`: Maximum tickets available (set at deploy, immutable)
- `sold`: Counter of tickets sold (increments on purchase)
- `price`: Price per ticket in nanotoncoins (set at deploy, immutable)
- `tickets`: Map of `address → uint32` (tracks ownership per buyer)

### Buying Tickets

1. User sends TON transaction with opcode `0x3edb9d9a` + quantity
2. Contract validates:
   - Quantity > 0
   - Payment == `price * quantity`
   - `sold + quantity <= maxTickets`
3. Contract updates:
   - `tickets[buyer] += quantity`
   - `sold += quantity`

### Querying Data

All getter methods are **read-only** (no state changes):
- `maxTickets()` - Returns max tickets
- `ticketsSold()` - Returns sold counter
- `ticketsRemaining()` - Returns `maxTickets - sold`
- `pricePerTicket()` - Returns price
- `totalRevenue()` - Returns `price * sold`
- `myTickets(address)` - Returns tickets owned by that address

### Client vs Server

- **Server (On-Chain)**: The smart contract deployed on TON blockchain stores all data permanently
- **Client (Off-Chain)**: Your scripts run locally and interact with the contract via RPC calls
- **Identity**: Your wallet address (`provider.sender().address`) is your identity - the contract doesn't know "who you are", only the address you use

## Network Options

- `--testnet`: Use TON testnet (free, for testing)
- `--mainnet`: Use TON mainnet (real TON, costs gas)

**For development, always use `--testnet` first!**

## Troubleshooting

### Build fails
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be >= 18)

### Scripts fail with "Cannot find module"
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Transaction fails
- Check you have enough TON for gas fees
- Verify payment amount matches `price * quantity` exactly
- Ensure tickets are still available (`sold < maxTickets`)

### Reset fails
- Only the contract owner can reset
- Verify you're using the owner wallet address

## License

MIT
