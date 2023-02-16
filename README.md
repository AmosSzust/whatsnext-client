# whatsnext-client

Find similar people like you based on shared life events.
You can experience it yourself here: https://www.stockdiv.com/whatsnext/#/login

Enter your main life events and find people who share the same events like you.

## Privacy Policy

We collect the email, password (encrypted) and life events as entered by the user. This data won't be sold nor shared with any 3rd party. When searching for other people, their private information is not disclosed. The user is able to ask for a connection request and his email will be visible to the other side.

## Before you begin

In src/boot/axios.ts you can set the server you'll work with:

- const baseURL = 'http://localhost:3000/api/'; >>> Works locally, you will need to setup the server locally
- const baseURL = 'https://stockdiv.com:8447/api'; >>> Works against the remote server. If you added a new client functionality that requires a new server functionality, it might not work.

When opening the client in the browser, make sure to browse to localhost:8080/#/login

## Contribution

The client side is developed using Quasar framework which is based on Vue3, you can find more information here: https://quasar.dev/

Feel free to contribute in any way you like. If you're only familiar with the client or server side, please let me know so we can coordinate the development. Several ideas to start with: https://github.com/AmosSzust/whatsnext-client/discussions/2

The server side of WhatsNext can be found here: https://github.com/AmosSzust/whatsnext-server

Thanks!

Amos
