const express=require("express");
const bodyParser=require("body-parser");
const mysql=require("mysql");
const session=require("express-session");
const path=require("path");
const { request } = require("http");
const { response } = require("express");
const { error } = require("console");
const { name } = require("ejs");
const { JSON } = require("mysql/lib/protocol/constants/types");
// const menuItems=require(__dirname + "/menu.js");






const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));


const connection=mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password@07",
    database: "nodelogin"
});

app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        connection.query("SHOW DATABASES", function (err, result) {
          if (err) throw err;
          console.log((result));
        });
      });

      





// Sending home page
app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

//receiving data from home page
app.post('/', function(request, response) {
	// Capture the input fields
	var username = request.body.username;
	let password = request.body.password;
    let usertype=request.body.loginas;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
                if(usertype=="customer"){
				response.redirect('/menu'); }
                else if(usertype="chef"){
                    response.redirect('/orders');
                }

			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});



// var item_sql="SELECT COUNT(*) as total FROM menu";
// connection.query(item_sql, function(err, result){
//     if (err) throw error;
//     total=result[0].total;
//     return total;
// });
// console.log(total);



















app.get("/signup", function(req, res){
    res.sendFile(__dirname + "/signup.html");
})

app.post("/signup", function(req, res){
    let newUSer=req.body.fname;
    let pass=req.body.pass;
    let email=req.body.email;

    console.log(newUSer);

    var sql = "INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)";
    connection.query(sql,[newUSer,pass,email], function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
    res.redirect("/success");
  });        
});

app.get("/success", function(req, res){
    res.sendFile(__dirname + "/success.html");
});



app.post("/success", function(req, res){
    res.redirect("/");
});

var items=[];
    var items_sql="SELECT item_name, item_price FROM menu";
   connection.query(items_sql, function(err, result){
    if (err) throw error;
    
    
    for(let i=0; i<10; i++){
    var item={
        name : result[i].item_name,
        price : result[i].item_price 
    }
    items.push(item);
    }
});

app.get("/menu", function(req, res){

res.render("menu", {
    itemsList : items
});    

});

let ordlist=[];

app.post("/menu", function(req, res){
    var idli=Number(req.body.idli);
    ordlist.push(idli);
    var dosa=Number(req.body.dosa);
    ordlist.push(dosa);
    var poori=Number(req.body.poori);
    ordlist.push(poori);
    var poha=Number(req.body.poha);
    ordlist.push(poha);
    var gobi=Number(req.body.gobi);
    ordlist.push(gobi);
    var noodles=Number(req.body.noodles);
    ordlist.push(noodles);
    var omlet=Number(req.body.omlet);
    ordlist.push(omlet);
    var tea=Number(req.body.tea);
    ordlist.push(tea);
    var coffee=Number(req.body.coffee);
    ordlist.push(coffee);
    var milkshake=Number(req.body.milkshake);
    ordlist.push(milkshake);

    var ordsql="INSERT INTO orders (qty, name) VALUES ( ? , ? )";
    for(let i=0; i<ordlist.length; i++){
        if(ordlist[i]>0){
            connection.query(ordsql, [ordlist[i], items[i].name], function(err, result){
                if (err) throw err;
                console.log("Values Inserted");
            })
            }
    }

   

    res.redirect("/cart");
})




app.get("/cart",function(req, res){
    
    let amtList=[];
    let totalamt=0;
    for(let i=0; i<ordlist.length; i++){
        var amt=(ordlist[i])*(items[i].price);
        amtList.push(amt);
        totalamt+=amt;
    }

    res.render("cart", {
        cartItems: ordlist,
        itemsList: items,
        prices: amtList,
        total: totalamt
    });

});

app.post("/cart", function(req, res){
    res.redirect("/paid");
});

app.get("/paid", function(req, res){
    res.render("paid");
})

app.post("/paid", function(req, res){
    res.redirect("/menu");
})


/// Chef page
let orders=[];
    connection.query("SELECT * FROM orders", function(err, result){
        if (err) throw err;
        for(let i=0; i<result.length; i++){
        var order={
            id: result[i].order_id,
            ord_name: result[i].name,
            ord_qty: result[i].qty
        }
            orders.push(order);
        }
        console.log(orders);
    });




app.get("/orders", function(req, res){
    
    res.render("orders",{
        orderedItems: orders
    })
});

app.post("/orders", function(req, res){
    connection.query("DELETE FROM orders", function(err, result){
        if (err) throw err;
        console.log(result);
    })

    res.redirect("/orders");


})








    

app.listen(9999, function(){
    console.log("Server now started on 9999");
});