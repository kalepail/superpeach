# Super Peach

A passkey powered multi signer abstract account contract example.

Play with the demo here:
- https://superpeach.pages.dev/
- https://minipeach-a.pages.dev/
- https://minipeach-b.pages.dev/

```
mv .env.example .env
pnpm i
pnpm run dev
```

```
cd site-a/
mv .env.example .env
pnpm i
pnpm run dev
```

```
cd site-b/
mv .env.example .env
pnpm i
pnpm run dev
```

If you fiddle with contracts in `./contracts` you'll need to run the make commands. Just remember to update the `WEBAUTHN_FACTORY` and `WEBAUTHN_WASM` values from the `make deploy` command before running `make init`. Once you run `make init` you'll need to update all the `.env` site files with the new `PUBLIC_factoryContractId`. 

---

## Todo
- [ ] Signer list should be paginated
- [ ] Attach some meaningful metadata to signers so you know which one belongs to which domain
- [ ] Add loading indicators
- [ ] Error handling
- [ ] Think about a reverse lookup mechanic for instances where you start with a child account that needs to sign into a super account
    - Contract meta?
    - Storage items?
    - Contract hash or address derivation?
    - Deploy lookup contracts?
    - Stellar toml?

## Done
- [x] Show contract account balance
- [x] Mobile popup isn't working
- [x] Add ability to sign in on child pages
- [x] Test on mobile browsers (only works once deployed, something about localhost/ips doesn't work)
- [x] Mechanic for listing out all an account's signers
- [x] Allow signers to be deleted
- [x] Add logout buttons
- [x] Set and manage sudo signer
