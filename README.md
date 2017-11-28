# Urbit Wallet

Wallet is a fork of [MyEtherWallet](https://www.MyEtherWallet.com) that allows 
you to manage various aspects of your ships, such as launching, starting, 
depositing, transferring, voting, etc. through the Etherume PKI. In this README, 
you will find a guide for running the application locally and for setting up a 
development environment.

## Running Wallet locally

## Development

### Build wallet
1. cd into the repo directory and `npm install`
2. `npm run dev`
3. This command will watch the `app/` directory and build into the `dist/` directory.
4. Open the file at `dist/index.html` in a browser, OR `cd` into `bin/` and run `python ./serve.py`. Use the latter if you'd like to test with either the Ledger wallet or Metamask

### Testnet
In order to test the functionality of the Wallet, you'll need a testnet running the 
Urbit constitution.
1. Install testrpc `npm install --save testrpc`
2. Get [the constitution](https://github.com/urbit/constitution)
3. Run a local `testrpc` node, boot using the following command to ensure a matching seed:  
   `testrpc --mnemonic "benefit crew supreme gesture quantum web media hazard theory mercy wing kitten"`
4. Run `truffle deploy` from the constitution's directory to deploy to your local node.
5. For wallet access, click "Mnemonic" as your method and enter the mnemonic described in step 2, and unlock your wallet.
6. In order to connect to your testnet, click the Node indicator in the header (usually defaults to ETH). Click through the wizard to set up a custom node. The placeholders will be the default for the testrpc node.
10. You are now authenticated and can perform operations that require that. By default, your address is `0x6deffb0cafdb11d175f123f6891aa64f01c24f7d`. Go give yourself a galaxy.

### Useful addresses
Constitution owner (is allowed to create galaxies): `0x6deffb0cafdb11d175f123f6891aa64f01c24f7d`

Test pool: `0xb71c0b6cee1bcae56dfe95cd9d3e41ddd7eafc43`



