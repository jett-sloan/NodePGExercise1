const express = require("express");
const app = express();
const db = require('./db')
const ExpressError = require("./error");
app.use(express.json());
//app.use(function (req, res, next) {
//    const err = new ExpressError("Not Found", 404);
//    return next(err);
//  });
//  
//  /** general error handler */
//  
//  app.use((err, req, res, next) => {
//    res.status(err.status || 500);
//  
//    return res.json({
//      error: err,
//      message: err.message
//    });
//  });
  
const port = 3000 
// Parse request bodies for JSON

app.get("/companies", async function (req,res,next){
    const results = await db.query(
        `SELECT * FROM companies c
        JOIN industriescompany ic
         ON c.code = ic.company_code
        JOIN industries i ON i.code = ic.industry_code   `);
        console.log(results)

  return res.json(results.rows);


});



app.post("/companies", async function(req,res,next){
    const {code, name , description} = req.body
    const results = await db.query(
        `INSERT INTO companies (code,name,description ) values ($1,$2,$3) returning *`,[code,name,description]
    )
    return res.json(results.rows) 
})

app.put("/companies/:code", async function(req,res,next){
    try{
    const {name,description} = req.body
    let code = req.params.code
    if(!code){
        throw new ExpressError("Not found!", 400);
    }
    let results = await db.query(
        `UPDATE companies SET name=$1, description=$2
        WHERE code = $3
        RETURNING code, name, description`,
     [name,description,code]
    )
    
    return res.json(results.rows)
    }catch(err){
        return next(err)
    } 
})


app.delete("/companies/:code",async function(req,res,next){
    if(!code){
        throw new ExpressError("Not found!",404)
    }
    let code = req.params.code
    let results = await db.query(
    `DELETE FROM companies WHERE code = $1`,[code]
)
return res.json({message:'Deleted'})
})


app.get("/invoices", async function(req,res,next){
    let result = await db.query(
        `SELECT * FROM invoices`
    )
    return res.json(result.rows)
})


app.get("/invoices/:id", async function(req,res,next){
    if(id === 0){
        throw new ExpressError("Not Found",404)
    }
    let id = req.params.id
    let result = await db.query(
        `SELECT * FROM invoices WHERE id=$1`,[id]
        )
        return res.json(result.rows)
})

app.post("/invoices",async function(req,res,next){
    try{
    let {comp_code, amt} = req.body;
    let results = await db.query(
        `INSERT INTO invoices (comp_code,amt) values ($1,$2) returning id, comp_code, amt, paid, add_date, paid_date`,[comp_code,amt]
    )
    return res.json(results.rows[0])
    }catch(err){
        console.log(err)
        return next(err)
    } 
})



app.put("/invoices/:id", async function(req,res,next){
   
    const {id} = req.params
    if(id.length === 0) throw new ExpressError("Not found!", 404);
    const {amt,paid} = req.body
    const result = await db.query(
        `SELECT paid_date FROM invoices WHERE id=$1`,[id]
    )
    let paid_date = result.rows[0]
    if(paid){
        let nowDate = new Date(); 
        paid_date = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate(); 
    }else if(!paid){
        paid_date = null
    }else{

    }
    let results = await db.query(
        `UPDATE invoices SET amt=$1,
        paid =$2,
        paid_date =$4
        WHERE id = $3
        RETURNING id,comp_code,amt,paid,add_date,paid_date`,
     [amt,paid,id,paid_date]
    )
    console.log(results.rows)
    return res.json(results.rows)
    
})

app.delete("/invoices/:id", async function(req,res,next){
    if(id === 0){
        throw new ExpressError("Not found!",404)
    }
    let id = req.params.id
    let results = await db.query(
        `DELETE FROM invoices WHERE id = $1`,[id]
    )
    return res.json({message:"Deleted"})
})

app.get("/companies/:code", async function(req,res,next){
    if(!code){
        throw new ExpressError("Not found",404)
    }
    
    let code = req.params.code
    let company = await db.query(
        `SELECT * FROM companies WHERE code = $1`,[code]
    )
    let invoice = await db.query(
        `SELECT id,comp_code FROM invoices WHERE comp_code = $1`,
        [code]
    );
    if(company.rows.length === 0 ) throw new ExpressError("Not found!", 404);
    const companies = company.rows[0];
    const invoices = invoice.rows; 

    const inIDs = []
    for(let i = 0; i < invoices.length; i++){
        if(invoices[i].comp_code == companies.code){
            inIDs.push(invoices[i].id);
            console.log(invoices[i].comp_code)
        }
    }
    companies.invoices = inIDs;
    
    return res.json({"company":companies})

})


app.get("/industries", async function(req,res,next){
    try{
    const results = await db.query(
        `SELECT 
        i.code AS industry_code,
        i.industry,
        c.code AS company_code,
        c.name AS company_name
    FROM 
        industries i
    JOIN 
        industriescompany ic ON i.code = ic.industry_code
    JOIN 
        companies c ON ic.company_code = c.code;`
    )
    return res.json(results.rows);}
    catch(err){
        return next(err)
    }
})
app.post("/industries", async function(req,res,next){
    try{
    let {code, industry} = req.body
    const results = await db.query(
        `INSERT INTO industries (code,industry) VALUES ($1,$2)
        RETURNING code, industry`,[code, industry]
    )
    return res.json(results.rows)
    }catch(err){
        return next(err)
    }
})

app.listen(port,()=>{
    console.log('sever on')
})
