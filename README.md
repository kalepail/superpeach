# Super Peach

A passkey powered multi signer abstract account contract example.

## TODO
- [] Allow signers to be deleted
- [x] Mechanic for listing out all an account's signers
- [] Signer list should be paginated
- [] Attach some meaningful metadata to signers so you know which one belongs to which domain
- [] Test on mobile browsers
- [] Add loading indicators
- [x] Show contract account balance
- [] Think about a reverse lookup mechanic for instances where you start with a child account that needs to sign into a super account
    Contract meta?
    Storage items?
    Contract hash or address derivation?
    Deploy lookup contracts?
    Stellar toml?

---

Part of generating and adding new signers could be attaching specific policies to each signer