### Problem:
Public nodes work too slow, for example, TON TESTNET has limit 1 request per second, so if you want high perfomance, you have to implement your own node, but that unreasonable if you only need to make a few requests to node. 


### Soluton:
There are private nodes. Access to this nodes is limited. That’s why it work faster, it’s great solution if you ready to pay money for such benefits. 

Here we found a use of payment channel. User will pay for each requests he send to node. 
It can be useful for some developers who need to make just few requests and this payment method more comfortable for them.

### What we have done:
We developed service for paying for each request you made to node.

We use telegram bot as an interface for registration and payment, backend js server for opening payment channels and saving data, balancer for capturing traffic to node.

### You can see our video demonstration here:
https://youtu.be/7lAnbyJdpOA

### Our presentation:
https://docs.google.com/presentation/d/16VD1B2ErnQHGFKwdtRGtPQh6I6Ye7_e-gFxXlw38svk/edit?usp=sharing

### How to setup
required library: 
```
apt-get install libpq-dev g++ make
```

doocker
```
sudo docker-compose up -d && sudo docker exec -i postgres_db psql -U postgres pg_db < start.sql
```
