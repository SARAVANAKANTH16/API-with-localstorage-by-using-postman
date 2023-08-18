require("dotenv").config();


const express= require("express");
const mongoose=express("mongoose");
var bodyParser = require("body-parser");
// database
const database = require("./database");

//Models

const BookModel = require("./book");
const AuthorModel = require("./author");
const PublicationModel = require("./publication");


//Initialise express
const booky = express();

booky.use(bodyParser.urlencoded({extended: true}));
booky.use(bodyParser.json());




/*
Route           /
Description  Get all the books
Access       public
parameter    none
Methods      GET
*/

booky.get("/",async(req,res) =>{

    const getAllBooks = await BookModel.find();
    return res.json(getAllBooks);
});

/*
Route           /is/:isbn
Description  Get all the books on isbn
Access       public
parameter    isbn
Methods      GET


*/

booky.get("/is/:isbn",(req,res)=>{
    getSpecificBook = database.books.filter(
        (book)=> book.ISBN === req.params.isbn
    );

    if(getSpecificBook.length === 0){
        return res.json({error: `No book found for the ISBN of ${req.params.isbn}`});
    }
    return res.json({book: getSpecificBook});
});

/*
Route           /c
Description  Get specific the books on  category
Access       public
parameter    cateogory
Methods      GET


*/

booky.get("/c/:category", (req,res)=>{
    const getSpecificBook = database.books.filter(
        (book)=>book.category.includes(req.params.category)
    )
    if(getSpecificBook.length ===0){
        return res.json({error: `No book found for the category of ${req.params.category}`})
    }
    return res.json({book: getSpecificBook});
});

/*
Route           /author
Description  Getalla uthors based on books
Access       public
parameter    isbn
Methods      GET


*/

booky.get("/author",(req,res)=>{
    return res.json({authors:database.author});
});
//toget a sepecific author-task

booky.get("/author/book:isbn" ,(req,res)=>{
    const getSpecificAuthor = database.author.filter(
        (author)=>author.books.includes(req.params.isbn)
    );
    if(getSpecificAuthor.length === 0){
        return res.json({
            error:`No author found for the book of ${req.params.isbn}`

        });
    }
    return res.json({authors: getSpecificAuthor});
});

booky.get("/publications",async(req,res)=>{
    const getAllPublications = await PublicationModel.find();
    return res.json(getAllPublications);
});


//post
/*
Route           /book/new
Description  Add new books
Access       public
parameter    None
Methods      post
*/

booky.post("/book/new",(req,res)=>{
    const newBook = req.body;
    database.books.push(newBook);
    return res.json({updatedBooks : database.books});
});

//post
/*
Route           /author/new
Description  Add new authors
Access       public
parameter    None
Methods      post
*/


booky.post("/author/new",(req,res)=>{
    const newAuthor=req.body;
    database.author.push(newAuthor);
    return res.json(database.author);
});

booky.post("/publication/new",(req,res)=>{
    const newPublication= req.body;
    database.publication.push(newPublication);
    return res.json(database.publication);
});

/*
Route           /publication/update/book
Description  update/add new publicating
Access       public
parameter    isbn
Methods      put
*/

booky.put("/publication/update/book/:isbn",(req,res)=>{
    //update the publication database
    database.publication.forEach((pub)=>{
        if(pub.id === req.body.pubId){
            return pub.books.push(req.params.isbn);
        }
    });

    //update the book database
    database.books.forEach((book)=>{
        if(book.ISBN === req.params.isbn){
            book.publications=req.body.pubId;
            return;
        }
    });

    return res.json(
        {
            books: database.books,
            publications:database.publication,
            message: "Succesfully Updated publications"
        }
    )

});

booky.delete("/book/delete/:isbn",(req,res) =>{
    //whichever book that doesnot match with the isbn , just send and rest will be filtered out
    const updatedBooksDatabase = database.books.filter(
        (book) => book.ISBN !== req.params.isbn
    )
    database.books = updatedBooksDatabase;
    return res.json({books:database.books});
});


/*
Route           /book/delete/author
Description  Dlete ana uthor from abook and viceversa
Access       public
parameter    isbn,authorId
Methods      Delete
*/  

booky.delete("/book/delete/author/:isbn/:authorId",(req,res)=>{
    //Update the book database
    database.books.forEach((book)=>{
        if(book.ISBN === req.params.isbn){
            const newAuthorList= book.author.filter(
                (eachAuthor)=>eachAuthor !== parseInt(req.params.authorId)//because it me be in the string format
            );
            book.author=newAuthorList;
            return;
        }

    });
    //update the authir database
    database.author.forEach((eachAuthor)=>{
        if(eachAuthor.id === parseInt(req.params.authorId)){
            const newBookList = eachAuthor.books.filter(
                (book)=> book !== req.params.isbn
            );
            eachAuthor.book = newBookList;
            return;
        }
    });

    return res.json({
        book:database.books,
        author:database.author,
        message: "Author was deleted!!!!"
    });
});

booky.listen(3000,()=>{
    console.log("Server is up and running");
});
