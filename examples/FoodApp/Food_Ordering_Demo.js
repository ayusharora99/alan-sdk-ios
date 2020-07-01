// {Name: Food_Ordering_Demo}
// {Description: Food Ordering demo app for delivering food}
// {Visibility: alan.app, synqq.com}
/*
This is a script for Food Ordering demo app for delivering food
Now there are four categories for food: drinks, pizza, street food, desserts.
*/
const menu = {
    "drinks": [
        {id: "sod", title: "cola", alt: ["coca-cola", "soda", "coca cola"]},
        {id: "amr", title: "americano"},
        {id: "lat", title: "latte"},
        {id: "cap", title: "cappuccino"},
        {id: "orj", title: "orange juice"},
        {id: "tea", title: "tea"}
    ],
    "pizza": [
        {id: "prn", title: "pepperoni", alt: ["pepperoni pizza"]},
        {id: "mrg", title: "margarita", alt: ["margarita pizza"]},
        {id: "4ch", title: "four Cheese", alt: ["cheese pizza"]},
        {id: "haw", title: "hawaiian", alt: ["hawaiian pizza"]}
    ],
    "street food": [
        {id: "brt", title: "burrito"},
        {id: "brg", title: "burger"},
        {id: "tco", title: "taco"},
        {id: "snd", title: "sandwich"}
    ],
    "dessert": [
        {id: "apl", title: "apple pie" },
        {id: "chc", title: "cheesecake"}
    ]
};
const CATEGORY_ALIASES = _.reduce(Object.keys(menu), (a, p) => {
    const key = p;
    a[key] = a[key + "s"] = a[key + "es"] = key;
    return a;
}, {});
const ITEM_ALIASES = _.reduce(menu, (a, p) => {
    p.forEach(i => {
        let key = i.title;
        a[key] = a[key + "s"] = a[key + "es"] = i;
        if (i.alt) {
            i.alt.forEach(s => a[s] = a[s + "s"] = a[s + "es"] = i)
        }
    });
    return a;
}, {});
const ITEMS_INTENT = Object.keys(ITEM_ALIASES).join("|");
const CATEGORY_LIST = Object.keys(CATEGORY_ALIASES).join("|");
intent(`What $(ITEM ${CATEGORY_LIST}) do you have?`, `(Order|get me|add|) $(NUMBER) $(ITEM ${CATEGORY_LIST})`, p => {
    let key = CATEGORY_ALIASES[p.ITEM.value];
    p.play({command: 'showCategory', value: key});
    let value = p.ITEM.endsWith('s') ? p.ITEM.value : p.ITEM.value + "s";
    p.play(`We have (a few|several) ${value} available`,
        `You can choose from a few different ${value}`,
        `There are a few types of ${value} (we have|available)`);
    for (let i = 0; i < menu[key].length; i++) {
        p.play({command: 'highlight', id: menu[key][i].title});
        p.play((i === menu[key].length - 1 ? "and " : "") + menu[key][i].title);
    }
    p.play(`Which ${value} would you like?`);
    p.play({command: 'highlight', id: ''});
});
intent(`(open|what do you have in|choose) $(ITEM ${CATEGORY_LIST})`, p => {
    p.play({command: 'showCategory', value: CATEGORY_ALIASES[p.ITEM.value]});
    p.play(`Openning ${p.ITEM} menu`);
});
intent(`open menu`, p => {
    p.play({command: 'showCategory', value: null});
    p.play(`Look at our menu`);
});
// add items to order
intent(`(add|I want|order|get|and|) $(NUMBER) $(ITEM ${ITEMS_INTENT})`,
    `(add|I want|order|get me|and|) $(ITEM ${ITEMS_INTENT})`,
    p => {
        let item = ITEM_ALIASES[p.ITEM.value].title;
        let quantity = p.NUMBER ? p.NUMBER.number : 1;
        p.play({command: 'addToCart', item, quantity});
        p.play(`(We|) added ${quantity} ${p.ITEM} to your order`);
    });
// remove or update order items
intent(`(remove|delete|exclude) $(ITEM ${ITEMS_INTENT})`,
    `(remove|delete|exclude) $(NUMBER) $(ITEM ${ITEMS_INTENT})`, p => {
        let order = p.visual.order || {};
        let title = ITEM_ALIASES[p.ITEM.value].title;
        if (!order[title]) {
            p.play(`${p.ITEM} has not been ordered yet`);
        } else {
            let quantity = order[title] ? order[title].quantity : 0;
            let deteleQnty = p.NUMBER ? p.NUMBER.number : quantity;
            if (quantity - deteleQnty <= 0) {
                p.play('Removed all ' + p.ITEM);
            } else {
                p.play(`Updated ${p.ITEM} quantity to ${quantity - deteleQnty}`);
            }
            p.play({command: 'removeFromCart', item: title, quantity: deteleQnty});
        }
    });
// play order details
intent(`(what is|show) (my order|order details)`, "what (have|) (I|we) ordered", p => {
    let {order} = p.visual;
    if (_.isEmpty(order)) {
        p.play("You have not ordered anything.", "Your cart is empty");
        return;
    }
    p.play("You have ordered:");
    for (let product in order) {
        if (order.hasOwnProperty(product)) {
            p.play(order[product].quantity + " " + order[product].title);
        }
    }
});
// checkout
intent(`that's (all|it)`, '(ready to|) checkout', p => {
    const {order} = p.visual;
    if (_.isEmpty(order)) {
        p.play("Your cart is empty, please make an order first");
        return;
    }
    p.play({command: 'checkout'});
    p.play("You have ordered:");
    for (let product in order) {
        if (order.hasOwnProperty(product)) {
            p.play(order[product].quantity + " " + order[product].title);
        }
    }
    p.play("You can ask me to set the Delivery and Payment details")
});

intent(`(set|change|replace) (delivery|) address`, `(delivery|) address is (not correct|invalid)`,
    p => {
        if (_.isEmpty(p.visual.order)) {
            p.play("Please, add something to your order first");
        } else {
            p.play('What is delivery address?');
            p.then(address);
            p.then(date_time);
        }
    });
let address = context(() => {
    follow('$(LOC)', p => {
        let address = p.LOC.value
        p.play("The address is " + address)
        p.play({command: "address", address: address});
    });
});

intent(`(Let's|) (set|choose|select|change) (delivery|) (time|date)`, `(delivery|) (date|time) is (not correct|invalid)`,
    p => {
        if (_.isEmpty(p.visual.order)) {
            p.play("Please, add something to your order first");
        } else {
            p.play("What is delivery date and time?");
            p.then(date_time);
        }
    });

let date_time = context(() => {
    follow('$(TIME)', '$(T now|asap|right now|as soon as possible)', '$(DATE)',
        '$(TIME) $(DATE)', '$(DATE) $(TIME)',  p => {
            let time, date;
            if (p.T) {
                // deliver in 30 minutes
                date = api.moment().tz(p.timeZone).format("MMMM Do");
                time = api.moment().tz(p.timeZone).add(30, 'minutes').format("h:mm a");
//                 p.play("It is scheduled to be delivered on " + date + "at" + time)
                p.play({command: 'time', time: time});
            }
            if (p.TIME) {
                time = p.TIME.value;
//                 p.play("It is schedules to be delivered at" + time)
                p.play({command: 'time', time: time});
            }
            if (p.DATE) {
                date = p.DATE.moment.format("MMMM Do");
//                 p.play("It is scheduled to be delivered on " + date)
                p.play({command: 'date', date: date});
            }
            p.play("I have scheduled it to be delivered on " + date + "at" + time)
            p.play({command: "time_date", time: time, date: date});
        
        });
});                
     
let card_number = context(() => {
    follow('$(NUMBER)', async p => {
        let card_number = p.NUMBER.value
        p.play("I'll add the payment details for your card ending in " + card_number)
        p.play({command: "card_number", card_number: card_number});
        return card_number
    });
});


intent(`(Let's|) (set|choose|select|change) (payement|) (details|info)`,
     p => {
        if (_.isEmpty(p.visual.order)) {
            p.play("Please, add something to your order first");
        }else{
            p.play("What are the last 4 digits of your credit card number?");
            p.then(card_number);
            
        }
    });

intent(`(Let's|) (set|choose|select|change) (payement|) (expiration)`,p => {
        if (_.isEmpty(p.visual.order)) {
            p.play("Please, add something to your order first");
        }else{
            p.play("What is the expiration date for this credit card?");
            p.then(card_exp_date);
            
        }
    });

let card_exp_date = context(() => {
    follow('$(DATE)', p => {
        let card_expMonth = p.DATE.moment.format("MM");
//         let card_expYear = p.DATE.moment.format('yy')
        p.play("The expiration date is " + card_expMonth)
        p.play({command: "card_expMonth", card_expMonth: card_expMonth});
//         p.play({command: "card_exp_date", card_exp_date: card_exp_date});
    });
});



intent(`finish (order|)`, p => {
    p.play({command: "finishOrder"});
    p.play("Thank you! We have already started preparing your order ")
});
intent(`how to (make an|) order`, `Give me an (order|) example`,
    reply("Choose food category and add items from menu to order. For example, you can say:" +
        "(select pizza, add 3 pepperoni, checkout|open street food, add 5 burgers, if you wish to remove some items say remove one burger, what is my order? checkout|open drinks, add one latte, add one cappuccino, that is all)"));
intent(`what is (it|the app|application)`, `where am I`,
    reply("(This is|It's) (just|simple) Food Ordering example application for (food delivery service|pizza ordering)"));
intent("What (kind|types) of food do you have (to order|)", "What do you have (to order|)", "What (food|) is available", "What can I (order|have|get)",
    reply("We have several pizzas, street foods, desserts, and drinks available. (What would you like to order?|)",
        "We offer pizzas, street foods, desserts, and drinks. (What would you like to order?|)"));
intent(`what (can|should|must) I (do|say|pronounce)`, `help (me|)`, `what to do (here|)`, `how to start`,
    p => {
        const screen = p.visual.screen ? p.visual.screen : null;
        switch (screen) {
            case "main":
                p.play("Here you can navigate through the menu and add and remove food to your order. To open menu category say (Open|go to) (drinks|pizza|street food|desserts). " +
                    "To add an item to your cart say 'add taco or add (2|3) (burgers|margaritas|latte)'. " +
                    "To remove an item from your cart say 'remove taco or remove (2|3) (burgers|margritas)'. " +
                    "To finish order and checkout say that is all or checkout");
                break;
            case "checkout":
                p.play("You are in your cart. You can change or finish your order.");
                break;
            default:
                p.play("We have several pizzas, street foods, desserts, and drinks available.", "We offer pizzas, street foods, desserts, and drinks. What would you like to order?");
        }
    });