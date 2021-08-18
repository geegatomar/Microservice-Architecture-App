const mongoose = require("mongoose");

mongoose.connect("mongodb://mongo:27017/atlanDB", {useNewUrlParser: true, useUnifiedTopology: true}, (err)=>{
    if(err) {
        console.log(err);
    }else {
        console.log("Connected mongodb successfully");
        }
});

module.exports = (questionsInForm, req) => {

    const schemaObj = {};
    for (const key of questionsInForm) {
        schemaObj[key] = String;
    }
    console.log(schemaObj);
    
    mySchema = mongoose.Schema(schemaObj);
    const Atlan = mongoose.model("Atlan", mySchema);

    const obj = {};
    for (var i = 0; i < questionsInForm.length; i++)
    {
        obj[questionsInForm[i]] = req.body["id="][i];
    }
    console.log(obj);
    const atlan = new Atlan(obj);
    atlan.save();

    console.log("Document saved to mongoDB");

}