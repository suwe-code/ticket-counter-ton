struct Storage {
    owner: address
    maxTickets: uint32
    sold: uint32
    price: coins
    tickets: map<address, uint32>
}

fun Storage.load() {
    return Storage.fromCell(contract.getData());
}

fun Storage.save(self) {
    contract.setData(self.toCell());
}

/// Buy N tickets by sending an internal message with this opcode + quantity.
struct (0x3edb9d9a) BuyTickets {
    quantity: uint32
}

/// Reset tickets (owner-only). Resets sold counter and clears tickets map.
struct (0x5fcc3d14) ResetTickets {}

type AllowedMessage = BuyTickets | ResetTickets

fun Storage.buyTickets(mutate self, buyer: address, quantity: uint32, paid: coins) {
    assert(quantity > 0) throw 100;
    assert(self.price > 0) throw 101;

    // Ensure availability
    assert(self.sold + quantity <= self.maxTickets) throw 102;

    // Ensure exact payment
    assert(paid == self.price * quantity) throw 103;

    // tickets[buyer] += quantity
    val existing = self.tickets.get(buyer);
    var current: uint32 = 0;
    if (existing.isFound) {
        current = existing.loadValue();
    }

    self.tickets.set(buyer, current + quantity);
    self.sold = self.sold + quantity;
}

fun Storage.resetTickets(mutate self, caller: address) {
    // Only owner can reset
    assert(caller == self.owner) throw 200;
    
    // Reset sold counter
    self.sold = 0;
    
    // Clear tickets map by creating a new empty map
    self.tickets = createEmptyMap<address, uint32>();
}

fun onInternalMessage(in: InMessage) {
    var storage = lazy Storage.load();

    val msg = lazy AllowedMessage.fromSlice(in.body);
    match (msg) {
        BuyTickets => {
            storage.buyTickets(in.senderAddress, msg.quantity, in.valueCoins);
            storage.save();
        }

        ResetTickets => {
            storage.resetTickets(in.senderAddress);
            storage.save();
        }

        else => {
            // Optional compatibility: allow "comment" messages (opcode 0) to buy exactly 1 ticket.
            // This makes simple wallet transfers with a text comment work as a "buy" action.
            if (!in.body.isEmpty()) {
                assert(in.body.preloadUint(32) == 0) throw 0xFFFF;
            }

            storage.buyTickets(in.senderAddress, 1, in.valueCoins);
            storage.save();
        }
    }
}

get fun maxTickets(): int {
    val st = lazy Storage.load();
    return st.maxTickets;
}

get fun ticketsSold(): int {
    val st = lazy Storage.load();
    return st.sold;
}

get fun ticketsRemaining(): int {
    val st = lazy Storage.load();
    return st.maxTickets - st.sold;
}

get fun pricePerTicket(): int {
    // coins is an integer in nanotoncoins at runtime
    val st = lazy Storage.load();
    return st.price;
}

get fun totalRevenue(): int {
    val st = lazy Storage.load();
    return st.price * st.sold;
}

get fun myTickets(user: address): int {
    val st = lazy Storage.load();
    val r = st.tickets.get(user);
    if (r.isFound) {
        return r.loadValue();
    }
    return 0;
}
