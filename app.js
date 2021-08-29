//jshint esversion:6

const express = require("express");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-mhr:mhr(1475963)@cluster0.mg7ta.mongodb.net/toDoListDb");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList !"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

  // const day = date.getDate();

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, function (err) {

        if (err) console.error(err);
        else console.log("Successfully saved default items to DB");

      })
      res.redirect('/');

    } else res.render("list", {
      listTitle: "Today",
      newListItems: foundItems
    });

  });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: req.body.newItem
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function (err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post('/delete', function (req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function (err) {
      if (err) console.log(err.message);
      else console.log("Successfully deleted checked item");
      res.redirect('/');
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemID}}}, function (err, foundList){
      if(!err) {
        res.redirect('/' + listName);
      }
    });
  }

});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function (err, foundList) {
    if(!err){
      if (foundList) {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      } else {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
  
        list.save();

        res.redirect("/" + customListName);
      }
    }
  });

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server Started Successfully !");
});