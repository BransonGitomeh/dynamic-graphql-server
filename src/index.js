const express = require('express');
const app = new express();
const graphqlHTTP = require('express-graphql');
let { graphql, buildSchema } = require('graphql');
let MongoClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId
let url = 'mongodb://localhost:27017/coola';
let prodUrl = 'mongodb://branson:a323573770@ds141082.mlab.com:41082/coola'
const request = require('request')

if (process.env.NODE_ENV == 'production') {
    url = prodUrl
}

MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log(err)
        console.log("could not connet to the database")
    } else {
        console.log("database connected succesfully")
    }
    var schema = buildSchema(`
          type Query {
            hello: String,
            Type(_id: String):Type,
            Types:[Type],
            Prop:Prop,
            Props:[Prop],
            Relationship:Relationship,
            Relationships:[Relationship]
          }

          type Mutation {
           addType(
            name: String,
            description:String,
           ): String,
           addProp(
             name: String,
             list: Boolean,
             Parent:String,
             Type:String,
             required:Boolean,
             description:String,
           ): String,
           relate(origin: String,target: String): String
          }

          type Type {
            _id: String,
            name: String,
            description : String,
            Props:[Prop]
          }

          type Prop {
            _id: String,
            Parent:Type,
            list: Boolean,
            required:Boolean,
            description:String,
            name: String,
            Type:String
          }

          type Relationship {
            _id: String,
            origin: Type,
            target: Type,
          }
        `);

    const types = []

    var rootValue = {
        hello: () => 'Hello world!',
        Type: ({ _id }) => new Promise((res, rej) => {
            const col = db.collection("Types")
            console.log(_id)
            col.findOne({ _id: new ObjectId(_id) }, (err, data) => {
                !data ? "" : data.Props = () => new Promise((res, rej) => {
                    const col = db.collection("Props")
                    col.find({ Parent: new ObjectId(data._id) }).toArray((err, data) => {
                        res(data)
                    })
                })
                console.log(data)
                res(data)
            })
        }),
        Types: () => new Promise((res, rej) => {
            const col = db.collection("Types")
            col.find().toArray((err, data) => {
                data.forEach(item => {
                    item.Props = () => new Promise((res, rej) => {
                        const col = db.collection("Props")
                        col.find({ Parent: new ObjectId(item._id) }).toArray((err, data) => {
                            res(data)
                        })
                    })
                })
                res(data)
            })
        }),
        addType: (args) => new Promise((res, rej) => {
            const col = db.collection("Types")
            col.insertOne(args, (err, data) => {
                res(data)
            })
        }),
        addProp: (args) => new Promise((res, rej) => {
            const col = db.collection("Props")
            args.Parent = new ObjectId(args.Parent)
            col.insertOne(args, (err, data) => {
                res(data)
            })
        }),
    };

    app.use(express.static('./www'));

    app.use('/graphql', graphqlHTTP({
        schema,
        rootValue,
        graphiql: true
    }));

    app.use('/graphql2', (req, res, next) => {
        makeSchema().then(schema => {
            req.schema = schema
            next()
        })
    }, (req, res, next) => {
        const middleware = graphqlHTTP({
            schema: req.schema,
            rootValue,
            graphiql: true
        })

        middleware(req, res, next)
    });

    const port = process.env.PORT || 3000

    app.listen(port, () => console.log(`Started listening at ${port}`, url));
});

function decorate(prop) {
    let finalRes = spaceToSnake(prop.Type)

    if (prop.Type)

        if (prop.list == true) {
            finalRes = `[${finalRes}]`
        }

    if (prop.required == true) {
        finalRes = `${finalRes}!`
    }

    return finalRes
}

function decorate_input(prop) {
    const basicTypes = ['Int', 'String', 'Boolean', 'Float']

    let finalRes = spaceToSnake(prop.Type)

    if (basicTypes.indexOf(finalRes) == -1) {
        finalRes = "input_" + spaceToSnake(prop.Type)
    }

    if (prop.list == true) {
        finalRes = `[${finalRes}]`
    }

    if (prop.required == true) {
        finalRes = `${finalRes}!`
    }

    return finalRes
}

function spaceToSnake(string) {
    return string.replace(/ /g, "_")
}

function checkIfPropRequireList(prop) {
    let finalRes = spaceToSnake(prop.name)

    if (prop.list == true) {
        finalRes = `${finalRes}(first:Int,after:String,offSet:Int)`
    }

    return finalRes
}

function makeSchema() {
    return new Promise((res, rej) => {
                request.post({
                            url: "http://localhost:3000/graphql",
                            form: {
                                query: `query te{
                          Types {
                            _id
                            name,
                            description,
                            Props{
                              _id,
                              name,
                              required,
                              description,
                              list,
                              Type
                            }
                          }
                        }`
                            }
                        }, (err, result) => {
                            console.log(err)
                            const data = JSON.parse(result.body).data

                            console.log(data)
                            const queries = `
              type Query {
                ${data.Types.map(type=>`\n# ${type.description} \n 
                  ${spaceToSnake(type.name.toString())}(_id:String) : ${spaceToSnake(type.name.toString())}`)
                .join(" ")}
                ${data.Types.map(type=>`\n# list of ${type.description} \n 
                  ${spaceToSnake(type.name.toString())}s : [${spaceToSnake(type.name.toString())}]`)
                .join(" ")}
              }

              ${data.Types.map(propContaining=>`\n# ${propContaining.description}\n type ${spaceToSnake(propContaining.name)} {
                ${propContaining.Props.map(prop=>`\n# ${prop.description} \n 
                  ${checkIfPropRequireList(prop)}: ${decorate(prop)}`)
                .join(" ")}
              }`).join(" ")}
            `
            const mutations = `
              type Mutation {
                ${data.Types.map(type=>`\n# ${type.description} \n
                  ${spaceToSnake(type.name.toString())}Mutations : ${spaceToSnake(type.name.toString())}Mutations`)
                .join(" ")}
              }

              ${data.Types.map(type=>`type ${type.name}Mutations {
                      Create(
                          ${type.name}:input_${type.name}
                      ): ${type.name},

                      Update(
                          ${type.name}:input_${type.name}
                      ): ${type.name},

                      Delete(
                          ${type.name}:input_${type.name}
                      ): ${type.name}
                  }`)}
              

              ${data.Types.map(propContaining=>`\n# ${propContaining.description}\n input input_${spaceToSnake(propContaining.name)} {
                ${propContaining.Props.map(prop=>`\n# ${prop.description} \n ${spaceToSnake(prop.name)}: ${decorate_input(prop)}`).join(" ")}
              }`).join(" ")}
            `

            res(buildSchema((queries + mutations)))
        })

    })
}
