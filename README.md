# Super Peach

A passkey powered multi signer abstract account contract example.

## Todo
- [] Allow signers to be deleted
- [] Signer list should be paginated
- [] Attach some meaningful metadata to signers so you know which one belongs to which domain
- [] Add loading indicators
- [] Error handling
- [] Think about a reverse lookup mechanic for instances where you start with a child account that needs to sign into a super account
    Contract meta?
    Storage items?
    Contract hash or address derivation?
    Deploy lookup contracts?
    Stellar toml?

## Done
- [x] Show contract account balance
- [x] Mobile popup isn't working
- [x] Add ability to sign in on child pages
- [x] Test on mobile browsers (only works once deployed, something about localhost/ips doesn't work)
- [x] Mechanic for listing out all an account's signers

---

Part of generating and adding new signers could be attaching specific policies to each signer