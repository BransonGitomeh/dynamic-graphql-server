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
            Project(_id: String):Project,
            Projects:[Project],
            Relationship:Relationship,
            Relationships:[Relationship]
          }

          type Mutation {
           addType(
            name: String,
            Project:String!,
            description:String,
           ): String,

           removeType(
            _id: String,
           ): String,

           addProject(
              name: String,
              description: String,
           ):String

           removeProject(
            _id: String,
           ): String,

           addProp(
             name: String,
             list: Boolean,
             Parent:String,
             Type:String,
             required:Boolean,
             description:String,
           ): String,

           removeProp(
            _id: String,
           ): String,
          }

          type Project {
            _id: String,
            name: String,
            Types:[Type]
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
        Project: ({ _id }) => new Promise((res, rej) => {
            const col = db.collection("Projects")
            console.log(_id)
            col.findOne({ _id: new ObjectId(_id) }, (err, data) => {
                !data ? "" : data.Types = () => new Promise((res, rej) => {
                    const col = db.collection("Types")
                    col.find({ Project: new ObjectId(data._id) }).toArray((err, data) => {
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
                })
                console.log(data)
                res(data)
            })
        }),
        Projects: () => new Promise((res, rej) => {
            const col = db.collection("Projects")
            col.find().toArray((err, data) => {
                data.forEach(item => {
                    item.Props = () => new Promise((res, rej) => {
                        const col = db.collection("Props")
                        col.find().toArray((err, data) => {
                            res(data)
                        })
                    })
                })
                res(data)
            })
        }),
        addProject: (args) => new Promise((res, rej) => {
            const col = db.collection("Projects")
            col.insertOne(args, (err, data) => {
                res(data)
            })
        }),
        addType: (args) => new Promise((res, rej) => {
            const col = db.collection("Types")
            args.Project = new ObjectId(args.Project)
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

    app.use('/graphql2/:project_id', (req, res, next) => {
        makeSchema(req.params.project_id).then(schema => {
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

function makeSchema(project_id) {
    return new Promise((res, rej) => {
        let url = 'http://localhost:3000/graphql'
        if (process.env.NODE_ENV == 'production') {
            url = "https://guarded-spire-97737.herokuapp.com/graphql"
        }
        request.post({
            url,
            form: {
                query: `query te($project:String){
                                    Project(_id:$project){
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
                                    }
                                  }`,
                variables: JSON.stringify({
                    project: project_id
                })
            }
        }, (err, result) => {
            console.log(err || result.body)
            const data = JSON.parse(result.body).data.Project

            console.log(data)
            const queries = `
                            type Query {
                              ${data.Types.map(type => `\n# ${type.description} \n 
                                ${spaceToSnake(type.name.toString())}(_id:String) : ${spaceToSnake(type.name.toString())}`)
                    .join(" ")}
                              
                              ${data.Types.map(type => `\n# list of ${type.description} \n 
                                ${spaceToSnake(type.name.toString())}s : [${spaceToSnake(type.name.toString())}]`)
                    .join(" ")}
                            }

                            ${data.Types.map(propContaining => `\n# ${propContaining.description}\n type ${spaceToSnake(propContaining.name)} {
                              ${propContaining.Props.map(prop => `\n# ${prop.description} \n 
                                ${checkIfPropRequireList(prop)}: ${decorate(prop)}`)
                            .join(" ")}
                            }`).join(" ")}
            `
            const mutations = `
              type Mutation {
                ${data.Types.map(type => `\n# ${type.description} \n
                  ${spaceToSnake(type.name.toString())}Mutations : ${spaceToSnake(type.name.toString())}Mutations`)
                    .join(" ")}
              }

              ${data.Types.map(type => `type ${spaceToSnake(type.name)}Mutations {
                      Create(
                          ${spaceToSnake(type.name)}:input_${spaceToSnake(type.name)}
                      ): ${spaceToSnake(type.name)},

                      Update(
                          ${spaceToSnake(type.name)}:input_${spaceToSnake(type.name)}
                      ): ${spaceToSnake(type.name)},

                      Delete(
                          ${spaceToSnake(type.name)}:input_${spaceToSnake(type.name)}
                      ): ${spaceToSnake(type.name)}
                  }`)}
              

              ${data.Types.map(propContaining => `\n# ${propContaining.description}\n input input_${spaceToSnake(propContaining.name)} {
                ${propContaining.Props.map(prop => `\n# ${prop.description} \n ${spaceToSnake(prop.name)}: ${decorate_input(prop)}`).join(" ")}
              }`).join(" ")}
            `

            res(buildSchema((queries + mutations)))
        })

    })
}
