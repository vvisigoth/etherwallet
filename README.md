# Urbit Wallet

Wallet is a fork of [MyEtherWallet](https://www.MyEtherWallet.com) that allows 
you to manage various aspects of your ships, such as launching, starting, 
depositing, transferring, voting, etc. through the Etherume PKI. In this README, 
you will find a guide for running the application locally and for setting up a 
development environment.

![Urbit Wallet State](https://i.imgur.com/5GjDw5W.png)


## Running Wallet locally

Wallet will allow you to interact with the Urbit constitution on the Ethereum 
blockchain. The best way to do this is to run a copy of Wallet locally and connect 
it to an Ethereum address and a node that you trust. How you run Wallet will depend 
on what kind of Ethereum wallet you'd like to connect to.

1. If you're using a mnemonic, a private key or a UTC keystore file, you can merely 
click on the index.html file found at /dist/index.html.

If you're using a hardware wallet or Metamask, you have to run a simple webserver 
using the script provided at /bin/serve.py. In order to run it, cd into the `/bin` 
directory and run the following commands 

1. `openssl req -new -x509 -keyout localhost.pem -out localhost.pem -days 3650 -nodes`
2. `python ./serve.py ./localhost.pem`

Once you Wallet open, you'll want to connect your ethereum wallet, following the 
appropriate flow on the homepage.

The address to which Wallet is connected will be indicated at the header of the page. 
By default, Wallet is connected to an Ethereum node provided by MyEtherWallet. To 
chance this, click on the "node" indicator in the header. If you'd prefer to create 
your transactions Offline, this option is also available in the node dialogue.

The "State" screen of the Urbit wallet will show a list of Ships that you own, along 
with actions available for that Ship. It will also allow you to connect to a Pool, 
which is an exchange for exchanging Stars for Spark Tokens and vice versa. If a Pool 
is connected, you will see your address' Spark balance.

![Urbit Wallet State](https://i.imgur.com/5GjDw5W.png)


## Development

### Build wallet
1. cd into the repo directory and `npm install`
2. `npm run dev`
3. This command will watch the `app/` directory and build into the `dist/` directory.
4. Open the file at `dist/index.html` in a browser, OR `cd` into `bin/` and run `python ./serve.py`. Use the latter if you'd like to test with either the Ledger wallet or Metamask

### Testnet
In order to test the functionality of the Wallet, you'll need a testnet running the 
Urbit constitution.
1. Clone [the constitution](https://github.com/urbit/constitution)
2. cd into the repo and `npm install`
3. `npm install -g ganache-cli`
3. Run a local `ganache` node, boot using the following command to ensure a matching seed:  
   `ganache-cli -m "benefit crew supreme gesture quantum web media hazard theory mercy wing kitten"`
4. Run `truffle deploy` from the constitution's directory to deploy to your local node.
5. For wallet access, click "Mnemonic" as your method and enter the mnemonic described in step 2, and unlock your wallet.
6. In order to connect to your testnet, click the Node indicator in the header (usually defaults to ETH). Click through the wizard to set up a custom node. The placeholders will be the default for the testrpc node.
10. You are now authenticated and can perform operations that require that. By default, your address is `0x6deffb0cafdb11d175f123f6891aa64f01c24f7d`. Go give yourself a galaxy.

### Useful addresses
Constitution owner (is allowed to create galaxies): `0x6deffb0cafdb11d175f123f6891aa64f01c24f7d`

Test pool: `0xb71c0b6cee1bcae56dfe95cd9d3e41ddd7eafc43`



