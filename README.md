# Super Peach

A passkey powered multi signer abstract account contract example.

Play with the demo here:
- [superpeach.pages.dev](https://superpeach.vercel.app/)
- [minipeach-a.vercel.app](https://minipeach-a.vercel.app/)
- [minipeach-b.vercel.app](https://minipeach-b.vercel.app/)

```
mv .env.example .env
pnpm i
pnpm run dev
```

```
cd site
mv .env.example .env
pnpm i
pnpm run dev
```

---

## TODO
- [ ] Add loading indicators
- [ ] Error handling

## DONE
- [x] Show contract account balance
- [x] Mobile popup isn't working
- [x] Add ability to sign in on child pages
- [x] Test on mobile browsers (only works once deployed, something about localhost/ips doesn't work)
- [x] Mechanic for listing out all an account's signers
- [x] Allow signers to be deleted
- [x] Add logout buttons
- [x] Set and manage sudo signer
- [x] Think about a reverse lookup mechanic for instances where you start with a child account that needs to sign into a super account
    - Contract meta?
    - Storage items?
    - Contract hash or address derivation?
    - Deploy lookup contracts?
    - Stellar toml?
    - The question here is primarily, given a passkey id, what contract is this passkey a signer on?
      - This may not be an important question to answer as you will be able to discover this from the super wallet
      - On the other hand if you change the sudo signer, add additional sudo signers (think passphrase recovery keys). It may be important to be able to regain visability into an account when you no longer have access to the super site or the ability to derive the contract address from the/a sudo signer id (which we use as a salt originally when creating the og super signer)
